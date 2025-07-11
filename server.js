const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const WebstoreChat = require('./models/webstoreChatModel');

dotenv.config();

const app = express();
const server = http.createServer(app);

// Allowed origins
const allowedOrigins = [
  'http://localhost:3000',
  'https://navarrojalen.netlify.app',
  process.env.CLIENT_URL_PRODUCTION,
  process.env.CLIENT_URL,
].filter(Boolean);

// CORS Middleware for Express routes
app.use(cors({
  origin: allowedOrigins, // Simpler origin check
  credentials: true,
}));

// Custom CORS middleware to allow all methods and headers for allowed origins
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS'); // Added PATCH and OPTIONS
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization'); // Added Authorization
  next();
});

// Session Configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'None',
  },
}));

app.use(express.json()); // For parsing application/json
app.use(express.urlencoded({ extended: true })); // For parsing application/x-www-form-urlencoded

// 🔌 Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins, // Socket.io CORS also uses the allowedOrigins array
    methods: ['GET', 'POST'], // Keep methods explicitly defined for Socket.io if needed
    credentials: true,
  },
});

const onlineUsers = new Map(); // userId => socket.id

io.on('connection', (socket) => {
  // JOIN room
  socket.on('join', async ({ userId, isAdmin }) => {
    socket.userId = userId;
    socket.isAdmin = isAdmin;

    if (isAdmin) {
      socket.join('admin-room');
      socket.emit('user-online', Array.from(onlineUsers.keys()));
    } else {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      io.to('admin-room').emit('user-online', Array.from(onlineUsers.keys()));

      try {
        const history = await WebstoreChat.find({ user: userId }).sort({ createdAt: 1 });
        socket.emit('chat-history', history.map(m => ({
          ...m.toObject(),
          _id: m._id.toString(),
          user: m.user.toString(),
          createdAt: m.createdAt.toISOString(),
        })));
      } catch (err) {
        console.error('❌ Chat history error:', err.message);
      }
    }
  });

  // Admin requesting history
  socket.on('get-history', async ({ userId }) => {
    try {
      const history = await WebstoreChat.find({ user: userId }).sort({ createdAt: 1 });
      socket.emit('chat-history', history.map(m => ({
        ...m.toObject(),
        _id: m._id.toString(),
        user: m.user.toString(),
        createdAt: m.createdAt.toISOString(),
      })));
    } catch (err) {
      console.error('❌ Admin get-history error:', err.message);
    }
  });

  // Send message
  socket.on('send-message', async ({ userId, message, sender }) => {
    if (!userId || !message || !sender) return;

    try {
      const newMessage = await WebstoreChat.create({ user: userId, message, sender });
      const formatted = {
        ...newMessage.toObject(),
        _id: newMessage._id.toString(),
        user: newMessage.user.toString(),
        createdAt: newMessage.createdAt.toISOString(),
      };

      io.to(userId).emit('new-message', formatted);
      io.to('admin-room').emit('new-message', formatted);

      if (sender === 'admin') {
        io.to('admin-room').emit('message-read', { userId });
      }
    } catch (err) {
      console.error('❌ Send message error:', err.message);
    }
  });

  // Typing indicators
  socket.on('typing', ({ userId, isTyping }) => {
    if (!userId) return;

    if (socket.isAdmin) {
      io.to(userId).emit('typing', { userId: 'admin', isTyping });
    } else {
      io.to('admin-room').emit('typing', { userId, isTyping });
    }
  });

  // Mark as read
  socket.on('mark-read', ({ userId }) => {
    io.to('admin-room').emit('message-read', { userId });
    io.to(userId).emit('message-read-confirmed');
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    if (socket.userId && !socket.isAdmin) {
      onlineUsers.delete(socket.userId);
      io.to('admin-room').emit('user-online', Array.from(onlineUsers.keys()));
    }
  });
});

// Health Check
app.get('/', (req, res) => {
  res.send('<h2>✅ Backend is working.</h2>');
});

// Routes
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/links', require('./routes/linkRoutes'));
app.use('/api/codes', require('./routes/codeRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/dates', require('./routes/dateRoutes'));
app.use('/api/notes', require('./routes/noteRoutes'));
app.use('/api/images', require('./routes/imageRoute'));
app.use('/api/presentations', require('./routes/presentationRoutes'));
app.use('/api/image-categories', require('./routes/imageCategoryRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));


app.use('/api/webstore-users', require('./routes/webstoreUserRoutes'));
app.use('/api/webstore-services', require('./routes/webstoreServiceRoutes'));
app.use('/api/webstore-credits', require('./routes/webstoreCreditRoutes'));
app.use('/api/webstore-orders', require('./routes/webstoreOrderRoutes'));
app.use('/api/webstore-chat', require('./routes/webstoreChatRoutes'));

// DB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('🟢 MongoDB connected'))
  .catch(err => console.error('🔴 MongoDB error:', err));

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});