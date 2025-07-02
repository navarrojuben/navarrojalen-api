const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const session = require('express-session');  // Import session middleware

dotenv.config();

const app = express();

// ✅ Update this to your actual frontend production domain
const allowedOrigins = [
  'http://localhost:3000',
  'https://navarrojalen.netlify.app', // ✅ PRODUCTION FRONTEND
];

// CORS configuration for handling cross-origin requests with credentials
app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true, // Allow cookies to be sent with requests
}));

// ✅ Session middleware for managing user sessions
// Session middleware for managing user sessions
app.use(session({
  secret: process.env.SESSION_SECRET || 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'None', // Allow cross-origin cookies
  },
}));

// ✅ JSON body parser middleware
app.use(express.json());

// ✅ Root Route
app.get('/', (req, res) => {
  res.send('<h2>✅ Backend is working and CORS is allowed.</h2>');
});


// ✅ Other project routes
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
app.use('/api/', require('./routes/resumeRoutes'));

app.use('/api/webstore-users',    require('./routes/webstoreUserRoutes'));
app.use('/api/webstore-services', require('./routes/webstoreServiceRoutes'));


// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('🟢 MongoDB connected'))
  .catch(err => console.error('🔴 MongoDB connection error:', err));

// ✅ Start the server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
