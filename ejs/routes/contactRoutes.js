const express = require('express');
const router = express.Router();

const Contact = require('../models/contact');

const { authenticate, authorizeAdmin } = require('../middleware/auth');



// Route to render contact form page
router.get('/', function(req, res) {
    res.render('help/contact', { message: null, page:"contact" });
});



// Route to handle form submission
router.post('/', async (req, res) => {
    try {
      const { name, email, message } = req.body;
      const newContact = new Contact({ name, email, message });
      await newContact.save();
      res.status(201).render('help/contact', { message: "Message sent successfully. Our team will contact you shortly!",page:'contact' });
    } catch (error) {
      res.status(500).render('help/contact', { message: "Failed to send message. Please try again later." });
    }
  });
  

// Optional: Route to fetch all messages (for admin use)
router.get('/messages',authenticate,authorizeAdmin, async (req, res) => {
  try {
    const messages = await Contact.find();
    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

module.exports = router;


// module.exports = router;