const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
const app = express();

// ✅ Allow all origins to avoid CORS issues
app.use(cors());
app.use(express.json());

// ✅ Confirm the server is running in browser
app.get('/', (req, res) => {
  res.send('<h2>✅ Server is up and running.</h2>');
});
app.get('/api/projects', (req, res) => {
  res.send('<h2>✅ Projects is up and running.</h2>');
});

// ✅ Use your actual projectRoutes
app.use('/api/projects', require('./routes/projectRoutes'));

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('🟢 MongoDB connected'))
.catch(err => console.error('🔴 MongoDB connection error:', err));

// ✅ Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
