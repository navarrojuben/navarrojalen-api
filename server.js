require('dotenv').config();

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;



const corsOptions = {
  origin: '*', // Allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true,
};

app.get('/', (req, res) => {
  res.send('<h2>✅ Server is up and running.</h2>');
});

// Apply CORS middleware
app.use(cors());

// Middleware for handling JSON
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`Request made to: ${req.method} ${req.url}`);
  next();
});

// Define routes
const projectRoutes  = require('./routes/projectRoutes');


// Routes
app.use('/api/projects',   projectRoutes);



// Connect to the database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(PORT, () => {
      console.log('Connected to DB & listening on port', PORT);
    });
  })
  .catch((error) => {
    console.log('Database connection error:', error);
  });
