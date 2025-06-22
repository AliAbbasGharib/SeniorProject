const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,          // smtp.gmail.com
    port: process.env.EMAIL_PORT,          // 587
    secure: false,                         // use TLS (false = STARTTLS)
    auth: {
        user: process.env.EMAIL_USER,      // your Gmail
        pass: process.env.EMAIL_PASS,      // app password
    },
    tls: {
        rejectUnauthorized: false          // allow self-signed certs (optional for development)
    }
});

const SendEmail = async (to, subject, html) => {
    await transport.sendMail({
        from: `"My App" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html
    });
};

module.exports = SendEmail;
