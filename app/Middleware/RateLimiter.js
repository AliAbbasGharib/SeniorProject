const rateLimit = require('express-rate-limit');

const contactFormLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, 
    max: 5,
    message: {
        message: "Too many contact form submissions from this IP. Please try again after 1 hour."
    },
    standardHeaders: true,
    legacyHeaders: false, 
});

module.exports = contactFormLimiter;
