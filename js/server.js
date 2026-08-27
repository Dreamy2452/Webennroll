const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use(cors());

// Nodemailer Transporter Setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// API Endpoint para sa Email Request
app.post('/api/send-email', async (req, res) => {
    const { email, college } = req.body;

    if (!email || !college) {
        return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    const mailOptions = {
        from: `"WebEnroll Support" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Admission Form Request - ${college}`,
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h2>WebEnroll Admission Request</h2>
                <p>Hello!</p>
                <p>Nareceive namin ang request mo para sa admission form ng <strong>${college}</strong>.</p>
                <p>Maaari mong bisitahin ang opisyal na portal o hintayin ang susunod na mga tagubilin para sa iyong pag-apply.</p>
                <br>
                <p>Salamat,<br><strong>WebEnroll Team</strong></p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.status(200).json({ success: true, message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Email error:', error);
        res.status(500).json({ success: false, message: 'Failed to send email' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
