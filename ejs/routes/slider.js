
const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const Slider = require('../models/slider');

const multer = require('multer');

const fs = require('fs');
const path = require('path');

const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}


// Configure storage for uploaded files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/uploads'); // Save files in the "public/uploads" directory
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    },
  });
  const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files are allowed!'), false);
      }
    },
  });
  
  


router.get('/', async (req, res) => {
    try {
      const sliders = await Slider.find();
    //   res.json(slides);
    res.render('admin/homePage', { sliders ,page: 'sliders' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to fetch slider data' });
    }
  });
  
  
  


  router.post('/add', upload.single('img'), async (req, res) => {
    try {
      console.log('File:', req.file);  // Check the uploaded file
      console.log('Body:', req.body);  // Check the form data
      
      if (!req.file) {
        return res.status(400).json({ error: 'Image file is required' });
      }
  
      const { alt, title, description, link } = req.body;
      const img = `/uploads/${req.file.filename}`;  // Construct the image path
  
      // Ensure required fields are present
      if (!title || !description || !link) {
        return res.status(400).json({ error: 'All fields are required' });
      }
  
      const newSlide = new Slider({ img, alt, title, description, link });
      await newSlide.save();
  
      res.status(201).json(newSlide); // Return the newly created slider
    } catch (err) {
      console.error('Error occurred while saving slider:', err);  // Log the error
      res.status(500).json({ error: 'Failed to add slide' });
    }
  });
  
  
  
  

  // PUT update a slider
  router.put('/edit/:id', upload.single('img'), async (req, res) => {
    try {
      const { title, description, link, alt } = req.body;
      const updatedData = { title, description, link, alt };
  
      // If a new image is uploaded, update the image path
      if (req.file) {
        updatedData.img = `/uploads/${req.file.filename}`;
      }
  
      await Slider.findByIdAndUpdate(req.params.id, updatedData);
      res.status(200).send('Slider updated successfully');
    } catch (err) {
      res.status(500).send('Error updating slider');
    }
  });
  


  router.get('/edit/:id', async (req, res) => {
    const { id } = req.params;
    try {
      const slider = await Slider.findById(id);
      if (!slider) {
        return res.status(404).send('Slider not found');
      }
      res.status(200).json(slider);
    } catch (err) {
      res.status(500).send('Error fetching slider');
    }
  });
  
  


  router.delete('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      await Slider.findByIdAndDelete(id);
      res.status(200).json({ message: 'Slide deleted successfully' });
    } catch (err) {
      res.status(500).json({ error: 'Failed to delete slide' });
    }
  });

  module.exports = router;