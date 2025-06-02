const nodemailer = require('nodemailer');

exports.sendContactMessage = async (req, res) => {
  const { name, email, message } = req.body;
  try {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.ADMIN_EMAIL_PASSWORD,
      },
    });

    const mailOptions = {
      from: email,
      to: process.env.ADMIN_EMAIL,
      subject: `Contact Message from ${name}`,
      text: message,
    };

    await transporter.sendMail(mailOptions);
    res.json({ success: 'Message sent successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error sending message' });
  }
};