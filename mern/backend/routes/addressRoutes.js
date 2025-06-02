const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');



// Create a new address
// routes/address.js

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, mobile, streetAddress, city, state, postalCode, country } = req.body;

    // Ensure `req.user` is populated
    if (!req.user || !req.user.id) {
      return res.status(400).json({ success: false, message: 'User not authenticated.' });
    }

    // Create a new address object
    const address = new Address({
      name,
      mobile,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      userId: req.user.id, // Authenticated user's ID
    });

    await address.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { addresses: address._id }
    });
    

    // Return the created address
    res.status(201).json({
      success: true,
      data: address
    });

  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

  
  

// routes/address.js

router.get('/', authenticate, async (req, res) => {
  try {
    const addresses = await Address.find({ userId: req.user.id });
    res.status(200).json({
      success: true,
      data: addresses
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.delete('/:id', authenticate, async (req, res) => {
  try {
    const deletedAddress = await Address.findByIdAndDelete(req.params.id);
    if (!deletedAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { addresses: req.params.id }
    });

    res.json({ success: true, message: 'Address deleted successfully' });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



router.post('/add', authenticate, async (req, res) => {
  try {
    const { name, mobile, streetAddress, city, state, postalCode, country,} = req.body;

    // Ensure `req.user` is populated
    if (!req.user || !req.user.id) {
      return res.status(400).json({ success: false, message: 'User not authenticated.' });
    }

    // Create a new address object
    const address = new Address({
      name,
      mobile,
      streetAddress,
      city,
      state,
      postalCode,
      country,
      userId: req.user.id, // Authenticated user's ID
    });

    await address.save();

    await User.findByIdAndUpdate(req.user.id, {
      $push: { addresses: address._id }
    });
    

    // Redirect to an order placement route, passing order data
    res.redirect('/address/user');


  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});




router.get('/get/:id', async (req, res) => {
  try {
      const address = await Address.findById(req.params.id);
      res.json(address);
  } catch (error) {
      console.error('Error fetching address:', error);
      res.status(500).send('Internal Server Error');
  }
});


router.post('/edit/:id',authenticate, async (req, res) => {
  try {
    const { name, mobile, streetAddress, city, state, postalCode, country } = req.body;

    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      { name, mobile, streetAddress, city, state, postalCode, country },
      { new: true } // Return the updated document
    );
    
    if (!updatedAddress) {
      return res.status(404).send('Address not found');
    }

    // Redirect to the address list after updating
    res.redirect('/address/user');

  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});



// routes/address.js

// Route to render the address edit form
router.get('/edit/:id', authenticate, async (req, res) => {
  try {
    const address = await Address.findById(req.params.id);
    if (!address) {
      return res.status(404).send('Address not found');
    }
    res.render('user/editAddress', { address });
  } catch (error) {
    console.error('Error fetching address for editing:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


// routes/address.js

// Handle the address update
router.put('/:id', authenticate, async (req, res) => {
  try {
    const { name, mobile, streetAddress, city, state, postalCode, country } = req.body;
    
    const updatedAddress = await Address.findByIdAndUpdate(
      req.params.id,
      { name, mobile, streetAddress, city, state, postalCode, country },
      { new: true } // Return the updated document
    );
    
    if (!updatedAddress) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    res.json(updatedAddress);
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


module.exports = router;
