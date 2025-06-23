const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// ✅ Fully open CORS (for development and deployment)
app.use(cors({
  origin: '*'
}));

app.use(express.json());




// ✅ Root route for tests
app.get('/', (req, res) => {
  res.send('<h2>✅ Backend is working and CORS is allowed.</h2>');
});




// ✅ Use project routes
app.use('/api/projects',          require('./routes/projectRoutes'));
app.use('/api/links',             require('./routes/linkRoutes'));
app.use('/api/codes',             require('./routes/codeRoutes'));
app.use('/api/messages',          require('./routes/messageRoutes'));
app.use('/api/dates',             require('./routes/dateRoutes'));
app.use('/api/notes',             require('./routes/noteRoutes'));
app.use('/api/images',            require('./routes/imageRoute'));
app.use('/api/presentations',      require('./routes/presentationRoutes'));
app.use('/api/image-categories',  require('./routes/imageCategoryRoutes'));

// ✅ MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('🟢 MongoDB connected'))
  .catch(err => console.error('🔴 MongoDB connection error:', err));

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
