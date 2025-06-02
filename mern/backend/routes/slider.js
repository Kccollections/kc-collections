const express = require('express');
const router = express.Router();
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const Slider = require('../models/slider');
const { uploadToCloudinary, deleteFromCloudinary, storeFileLocally } = require('../config/cloudinary');

const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads', 'temp');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for multer - temporary storage before Cloudinary upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Save files in the temporary uploads directory
  },
  filename: (req, file, cb) => {
    // Create unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB file size limit
});
  
router.get('/', async (req, res) => {
  try {
    const sliders = await Slider.find();
    res.json(sliders); // Return JSON data
  } catch (err) {
    console.error('Error fetching sliders:', err);
    res.status(500).json({ error: 'Failed to fetch slider data' });
  }
});

router.post('/add', upload.single('img'), async (req, res) => {
  try {
    console.log('File:', req.file);
    console.log('Body:', req.body);
    
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required' });
    }

    const { alt, title, description, link } = req.body;

    // Ensure required fields are present
    if (!title || !description || !link) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Upload image to Cloudinary
    let imageUrl = '';
    let uploadError = null;

    try {
      // Try to upload to Cloudinary first
      const uploadResult = await uploadToCloudinary(
        req.file.path, 
        `sliders/${title.replace(/\s+/g, '_')}`
      );
      imageUrl = uploadResult.url;
      console.log('Successfully uploaded to Cloudinary:', imageUrl);
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      uploadError = error;

      // Fallback to local storage if Cloudinary fails
      imageUrl = storeFileLocally(req.file.path, `slider_${title.replace(/\s+/g, '_')}`);
      console.log('Used local storage fallback:', imageUrl);
    }

    // Create new slider with the image URL (either from Cloudinary or local)
    const newSlide = new Slider({
      img: imageUrl,
      alt,
      title,
      description,
      link
    });

    await newSlide.save();

    // Clean up temporary file
    try {
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (e) {
      console.error(`Failed to delete temporary file ${req.file.path}:`, e);
    }

    res.status(201).json({
      message: uploadError ? 'Slide added successfully (using local storage)' : 'Slide added successfully',
      slide: newSlide
    });
  } catch (err) {
    console.error('Error occurred while saving slider:', err);
    res.status(500).json({ error: 'Failed to add slide' });
  }
});

// PUT update a slider
router.put('/edit/:id', upload.single('img'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, link, alt } = req.body;
    const updatedData = { title, description, link, alt };
    
    // Find the existing slider to get the current image URL
    const existingSlider = await Slider.findById(id);
    if (!existingSlider) {
      return res.status(404).json({ error: 'Slider not found' });
    }

    // If a new image is uploaded, update the image path
    if (req.file) {
      try {
        // Try to upload to Cloudinary
        const uploadResult = await uploadToCloudinary(
          req.file.path,
          `sliders/${title.replace(/\s+/g, '_')}`
        );
        updatedData.img = uploadResult.url;
        
        // If the existing image is from Cloudinary, try to delete it
        if (existingSlider.img && existingSlider.img.includes('cloudinary.com')) {
          try {
            // Extract public_id from the URL
            const urlParts = existingSlider.img.split('/');
            const filenamePart = urlParts[urlParts.length - 1];
            const filename = filenamePart.split('.')[0];
            const folder = urlParts[urlParts.length - 2];
            const public_id = `${folder}/${filename}`;
            
            await deleteFromCloudinary(public_id);
            console.log('Successfully deleted old image from Cloudinary');
          } catch (deleteErr) {
            console.error('Error deleting old image from Cloudinary:', deleteErr);
          }
        }
      } catch (uploadError) {
        console.error('Error uploading to Cloudinary:', uploadError);
        
        // Fallback to local storage
        updatedData.img = storeFileLocally(req.file.path, `slider_${title.replace(/\s+/g, '_')}`);
        console.log('Used local storage fallback for update:', updatedData.img);
      }
      
      // Clean up temporary file
      try {
        if (fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
        }
      } catch (e) {
        console.error(`Failed to delete temporary file ${req.file.path}:`, e);
      }
    }

    // Update the slider in the database
    const updatedSlider = await Slider.findByIdAndUpdate(id, updatedData, { new: true });
    
    res.status(200).json({
      message: 'Slider updated successfully',
      slider: updatedSlider
    });
  } catch (err) {
    console.error('Error updating slider:', err);
    res.status(500).json({ error: 'Error updating slider' });
  }
});

router.get('/edit/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const slider = await Slider.findById(id);
    if (!slider) {
      return res.status(404).json({ error: 'Slider not found' });
    }
    res.status(200).json(slider);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching slider' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the slider before deleting to get its image URL
    const slider = await Slider.findById(id);
    if (!slider) {
      return res.status(404).json({ error: 'Slider not found' });
    }
    
    // If the image is from Cloudinary, delete it
    if (slider.img && slider.img.includes('cloudinary.com')) {
      try {
        // Extract public_id from the URL
        const urlParts = slider.img.split('/');
        const filenamePart = urlParts[urlParts.length - 1];
        const filename = filenamePart.split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        const public_id = `${folder}/${filename}`;
        
        await deleteFromCloudinary(public_id);
        console.log('Successfully deleted image from Cloudinary');
      } catch (deleteErr) {
        console.error('Error deleting image from Cloudinary:', deleteErr);
      }
    }
    
    // Delete the slider from the database
    await Slider.findByIdAndDelete(id);
    
    res.status(200).json({ message: 'Slide deleted successfully' });
  } catch (err) {
    console.error('Error deleting slider:', err);
    res.status(500).json({ error: 'Failed to delete slide' });
  }
});

module.exports = router;