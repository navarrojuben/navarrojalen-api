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

const allowedOrigins = [
  'http://localhost:3000',
  'https://navarrojalen.netlify.app',
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

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

app.use(express.json());

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

const onlineUsers = new Map(); // 🔴 Track online users by userId
const typingUsers = new Set(); // 🔵 Track who is typing

io.on('connection', (socket) => {
  // console.log('🔌 Socket connected:', socket.id);

  socket.on('join', async ({ userId, isAdmin }) => {
    socket.userId = userId;
    socket.isAdmin = isAdmin;

    if (isAdmin) {
      socket.join('admin-room');
      // console.log('🧑‍💼 Admin joined admin-room');
    } else {
      socket.join(userId);
      onlineUsers.set(userId, socket.id);
      io.to('admin-room').emit('user-online', Array.from(onlineUsers.keys()));
      // console.log(`👤 User ${userId} joined room`);

      try {
        const history = await WebstoreChat.find({ user: userId }).sort({ createdAt: 1 });
        socket.emit('chat-history', history);
      } catch (err) {
        console.error('❌ Chat history error:', err.message);
      }
    }
  });

  // ✅ Emit to BOTH user and admin no matter who sends the message
  socket.on('send-message', async ({ userId, message, sender }) => {
    if (!userId || !message || !sender) return;

    try {
      const newMessage = await WebstoreChat.create({ user: userId, message, sender });

      // Always emit to both
      io.to(userId).emit('new-message', newMessage);
      io.to('admin-room').emit('new-message', newMessage);

      // Mark as read only when admin sends it
      if (sender === 'admin') {
        io.to('admin-room').emit('message-read', { userId });
      }
    } catch (err) {
      console.error('❌ Send message error:', err.message);
    }
  });

  // ✅ Typing indicator
  socket.on('typing', ({ userId, isTyping }) => {
    if (socket.isAdmin) {
      io.to(userId).emit('typing', { isTyping: true });
    } else {
      io.to('admin-room').emit('typing', { userId, isTyping });
    }
  });

  // ✅ Message read receipt
  socket.on('mark-read', ({ userId }) => {
    io.to('admin-room').emit('message-read', { userId });
  });

  socket.on('disconnect', () => {
    // console.log('❌ Disconnected:', socket.id);
    if (socket.userId && !socket.isAdmin) {
      onlineUsers.delete(socket.userId);
      io.to('admin-room').emit('user-online', Array.from(onlineUsers.keys()));
    }
  });
});

app.get('/', (req, res) => {
  res.send('<h2>✅ Backend is working.</h2>');
});

// ✅ Routes
app.use('/api/projects',         require('./routes/projectRoutes'));
app.use('/api/links',            require('./routes/linkRoutes'));
app.use('/api/codes',            require('./routes/codeRoutes'));
app.use('/api/messages',         require('./routes/messageRoutes'));
app.use('/api/dates',            require('./routes/dateRoutes'));
app.use('/api/notes',            require('./routes/noteRoutes'));
app.use('/api/images',           require('./routes/imageRoute'));
app.use('/api/presentations',    require('./routes/presentationRoutes'));
app.use('/api/image-categories', require('./routes/imageCategoryRoutes'));
app.use('/api/resume',           require('./routes/resumeRoutes'));
app.use('/api/',                 require('./routes/resumeRoutes'));

app.use('/api/webstore-users',    require('./routes/webstoreUserRoutes'));
app.use('/api/webstore-services', require('./routes/webstoreServiceRoutes'));
app.use('/api/webstore-credits',  require('./routes/webstoreCreditRoutes'));
app.use('/api/webstore-orders',   require('./routes/webstoreOrderRoutes'));
app.use('/api/webstore-chat',     require('./routes/webstoreChatRoutes'));

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
