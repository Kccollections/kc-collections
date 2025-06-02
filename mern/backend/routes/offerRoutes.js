const express = require('express');
const mongoose = require('mongoose');
const Offer = require('../models/Offers'); // Path to the Offer model
const Product = require('../models/Product'); // Path to the Product model
const router = express.Router();

// CREATE a new offer
router.post('/offers/add', async (req, res) => {
    try {
      const {
        title,
        description,
        discountPercentage,
        validFrom,
        validUntil,
        applicableProducts,
        termsAndConditions,
      } = req.body;
  
      // Ensure `applicableProducts` is an array
      if (!Array.isArray(applicableProducts)) {
        return res.status(400).json({ error: 'applicableProducts must be an array' });
      }
  
      // Validate discountPercentage
      if (discountPercentage < 0 || discountPercentage > 100) {
        return res.status(400).json({ error: 'Discount percentage must be between 0 and 100.' });
      }
  
      // Apply discount to applicable products
      const updatePromises = applicableProducts.map(async (productId) => {
        const product = await Product.findById(productId);
        if (!product) {
          throw new Error(`Product with ID ${productId} not found.`);
        }
  
        const updatedPrice = product.startingPrice * (1 - discountPercentage / 100);
  
        return Product.findByIdAndUpdate(
          productId,
          {
            price: updatedPrice,
            sale: true,
          },
          { new: true }
        );
      });
  
      // Wait for all updates to complete
      await Promise.all(updatePromises);
  
      // Save the offer
      const newOffer = new Offer({
        title,
        description,
        discountPercentage,
        validFrom,
        validUntil,
        applicableProducts,
        termsAndConditions,
      });
      await newOffer.save();
  
      res.status(201).json({ message: 'Offer added and products updated successfully!' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
    }
  });
  

// GET all offers
router.get('/', async (req, res) => {
  try {
    const offers = await Offer.find().populate('applicableProducts'); // Populates product details
    
    // Always return JSON for API requests - removing the view rendering
    return res.status(200).json(offers);
  } catch (error) {
    console.error('Error fetching offers:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET a single offer by ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const offer = await Offer.findById(id).populate('applicableProducts');

    if (!offer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json(offer);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// UPDATE an offer by ID
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedOffer = await Offer.findByIdAndUpdate(
      id,
      req.body,
      { new: true, runValidators: true }
    ).populate('applicableProducts');

    if (!updatedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json({ message: 'Offer updated successfully', offer: updatedOffer });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// DELETE an offer by ID
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedOffer = await Offer.findByIdAndDelete(id);

    if (!deletedOffer) {
      return res.status(404).json({ message: 'Offer not found' });
    }

    res.status(200).json({ message: 'Offer deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
