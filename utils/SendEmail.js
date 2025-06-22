const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.GMAIL_USER,      // Your Gmail address
        pass: process.env.GMAIL_PASS       // Your Gmail app password
    }
});

const SendEmail = async (to, subject, html) => {
    await transporter.sendMail({
        from: `"Your App Name" <${process.env.GMAIL_USER}>`,
        to,
        subject,
        html
    });
};

module.exports = SendEmail;