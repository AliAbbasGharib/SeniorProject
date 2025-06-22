const nodemailer = require('nodemailer');

const SendEmail = async (email, subject, htmlContent) => {
    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for port 465, false for 587
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS, // Use Gmail App Password here
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        await transporter.verify();
        console.log('✅ Email server is ready to send messages');

        const mailOptions = {
            from: {
                name: 'Your App Name', // change to your app's name
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: subject,
            html: htmlContent,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Email sent successfully:', info.messageId);
        return info;

    } catch (error) {
        console.error('❌ Email sending failed:', error);
        throw new Error(`Failed to send email: ${error.message}`);
    }
};

module.exports = SendEmail;
