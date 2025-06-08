require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const helmet = require('helmet');
require('dotenv').config();
mongoose.connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("connected succufully");
    }).catch((err) => {
        console.log(err)
    })


const authApi = require("./Routes/api");
const app = express();

app.use(express.json());
app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' })); // X-Frame-Options: DENY
app.use(helmet.referrerPolicy({ policy: 'no-referrer' })); // Referrer-Policy
app.use(helmet.hsts({ // Strict-Transport-Security
    maxAge: 31536000, // 1 year in seconds
    includeSubDomains: true,
    preload: true
}));

// Permissions-Policy is not fully supported by helmet yet, set it manually:
app.use((req, res, next) => {
    res.setHeader("Permissions-Policy", "geolocation=(), microphone=(), camera=()");
    next();
});
app.use(cors({
    origin: ['https://seniorproject-1-3rbo.onrender.com', 'http://localhost:3000',
        'https://683a0af09e510200081644d4--redlink12.netlify.app'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use("/api", authApi);
const port = process.env.PORT || 3001;
app.listen(port, () => {
    console.log(`I am listening in port ${port}`);
});