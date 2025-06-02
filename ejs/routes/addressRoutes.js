const express = require('express');
const router = express.Router();
const Address = require('../models/Address');
const { authenticate, authorizeAdmin } = require('../middleware/auth');
const User = require('../models/User');



// Create a new address
// routes/address.js

router.post('/', authenticate, async (req, res) => {
  try {
    const { name, mobile, streetAddress, city, state, postalCode, country, totalProducts, totalAmount, productIds, productQuantities } = req.body;

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
    

    // Once the address is saved, redirect to the order placement route
    const orderData = {
      addressId: address._id,
      totalProducts,
      totalAmount,
      productIds: JSON.parse(productIds),
      productQuantities: JSON.parse(productQuantities)
    };

    // Redirect to an order placement route, passing order data
    res.redirect(`/order/checkout?addressId=${address._id}&totalProducts=${totalProducts}&totalAmount=${totalAmount}&productIds=${encodeURIComponent(productIds)}&productQuantities=${encodeURIComponent(productQuantities)}`);

  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

  
  

// routes/address.js

router.get('/', authenticate, async (req, res) => {
  try {
    const { totalProducts, totalAmount, productIds, productQuantities } = req.query;
    const addresses = await Address.find({ userId: req.user.id });

    res.render('user/address', { 
      addresses, 
      totalProducts,
      totalAmount,
      productIds: JSON.parse(decodeURIComponent(productIds)),
      productQuantities: JSON.parse(decodeURIComponent(productQuantities)),
      page: 'address'  // Pass the page name as a property to the view template
    });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});

router.get('/user', authenticate, async function (req, res) {
  try {
    const addresses = await Address.find({ userId: req.user.id });
    res.render('user/addresses', { addresses , page:'addressess'}); // Pass addresses as an object property
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).send('Internal Server Error');
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
router.post('/edit/:id', authenticate, async (req, res) => {
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
    res.redirect('/address');
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
});


module.exports = router;
