const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');
const http = require('http');
const { Server } = require('socket.io');
const WebstoreChat = require('./models/webstoreChatModel');
const WebstoreUser = require('./models/webstoreUserModel'); // Assuming this is your user model

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

// CORS Middleware
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

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

app.use(express.json());

// 🔌 Socket.io
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  maxHttpBufferSize: 50 * 1024 * 1024
});

const onlineUsers = new Map(); // userId => socket.id

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  // JOIN room
  socket.on('join', async ({ userId, isAdmin }) => {
    socket.userId = userId;
    socket.isAdmin = isAdmin;

    if (isAdmin) {
      socket.join('admin-room');
      socket.emit('user-online', Array.from(onlineUsers.keys()));
      console.log(`Admin ${userId} joined admin-room.`);
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

  // Send message - MODIFIED TO ACCEPT imageUrls (array)
  socket.on('send-message', async ({ userId, message, sender, imageUrls }) => { // Changed imageUrl to imageUrls
    // Validation: userId and sender are required. Either message OR imageUrls must be present.
    if (!userId || !sender || (!message && (!imageUrls || imageUrls.length === 0))) {
      console.warn('Invalid message data received (text or images missing):', { userId, message, sender, imageUrls });
      return;
    }

    try {
      const newMessage = await WebstoreChat.create({
        user: userId,
        message: message || undefined, // Set to undefined if empty
        imageUrls: (imageUrls && imageUrls.length > 0) ? imageUrls : undefined, // Assign array or undefined
        sender: sender,
        read: false,
      });
      const formatted = {
        ...newMessage.toObject(),
        _id: newMessage._id.toString(),
        user: newMessage.user.toString(),
        createdAt: newMessage.createdAt.toISOString(),
      };

      io.to(userId).emit('new-message', formatted);
      io.to('admin-room').emit('new-message', formatted);

      if (imageUrls && imageUrls.length > 0) {
        console.log(`[Image Message] From ${sender} (${userId}): ${imageUrls.join(', ')}`);
      }
      if (message) {
        console.log(`[Text Message] From ${sender} (${userId}): "${message}"`);
      }

    } catch (err) {
      console.error('❌ Send message error:', err.message);
      socket.emit('chat-error', 'Failed to send message.');
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
  socket.on('mark-read', async ({ userId }) => {
    if (!userId) return;

    try {
      await WebstoreChat.updateMany(
        { user: userId, sender: 'admin', read: false },
        { $set: { read: true } }
      );
      console.log(`Messages from admin to user ${userId} marked as read.`);

      io.to('admin-room').emit('message-read-confirmed', { userId });
      io.to(userId).emit('message-read-confirmed');
    } catch (err) {
      console.error('❌ Mark read error:', err.message);
    }
  });

  // Disconnect handler
  socket.on('disconnect', () => {
    console.log(`Socket disconnected: ${socket.id}`);
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
app.use('/api/videos', require('./routes/videoRoutes'));
app.use('/api/presentations', require('./routes/presentationRoutes'));
app.use('/api/image-categories', require('./routes/imageCategoryRoutes'));
app.use('/api/resume', require('./routes/resumeRoutes'));
app.use('/api/', require('./routes/resumeRoutes'));

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