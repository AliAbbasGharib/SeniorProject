require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const helmet = require('helmet');

const app = express();

// === Connect to MongoDB ===
mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.error("MongoDB connection error:", err));


// Middleware
app.use(express.json());
app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.referrerPolicy({ policy: 'no-referrer' }));
app.use(helmet.hsts({
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
}));

// Permissions-Policy (manual)
app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
});

// CORS
app.use(cors({
    origin: [
        'https://seniorproject-1-3rbo.onrender.com', 
        'http://localhost:3000',
        'https://69d512f73dd43951e4dab2e5--redlink7.netlify.app'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Permissions-Policy is not fully supported by helmet yet, set it manually:
app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
});
app.use(cors({
    origin: ['https://seniorproject-1-3rbo.onrender.com', 'http://localhost:3000',
        'https://685d9d0fea6ff10008835ca0--redlink12.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

const authApi = require("./Routes/api");
app.use("/api", authApi);

// Test route
app.get("/", (req, res) => {
    res.send("Server is running!");
});
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});