require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

const app = express();

// === MongoDB Connection ===
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("MongoDB connected successfully"))
  .catch(err => console.error("MongoDB connection error:", err));

// === Middleware ===
app.use(express.json());
app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(cors({
  origin: [process.env.FRONTEND_URL],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// === Routes ===
const authApi = require('./Routes/api');
app.use('/api', authApi);

// Test route
app.get('/', (req, res) => {
  res.send('Server is running!');
});

// === Start server ===
const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`Server is listening on port ${port}`));