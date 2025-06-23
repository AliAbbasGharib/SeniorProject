const nodemailer = require('nodemailer');

const transport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false,
    }
});

const SendEmail = async (to, subject, html) => {
    try {
        await transport.sendMail({
            from: `"My App" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html,
            text: 'Please view this email in an HTML-compatible client.',
        });
    } catch (err) {
        console.error("Email sending failed:", err);
        throw new Error("Could not send email");
    }
};

module.exports = SendEmail;
