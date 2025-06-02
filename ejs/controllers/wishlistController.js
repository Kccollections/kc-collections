
const mongoose = require('mongoose');
const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product'); // Import the Product model

exports.getWishlist = async (req, res) => {
  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id }).populate({
      path: 'items.productId',
      model: 'Product'
    });

    if (!wishlist) {
      // If no wishlist exists for the user, create an empty wishlist object
      wishlist = { items: [] };
    } else {
      // Remove items where productId is null
      wishlist.items = wishlist.items.filter(item => item.productId !== null);
    }

    res.render('user/wishlist', { 
      wishlist, 
      user: req.user, 
      page: "wishlist"
    });
  } catch (error) {
    console.error('Error fetching wishlist:', error.message);
    res.status(500).json({ error: 'Error fetching wishlist' });
  }
};



exports.addToWishlist = async (req, res) => {
  const { productId } = req.body;

  try {
    let wishlist = await Wishlist.findOne({ userId: req.user.id });

    // If no wishlist exists, create a new one
    if (!wishlist) {
      wishlist = new Wishlist({
        userId: req.user.id,
        items: [{ productId }]
      });
    } else {
      // Check if the product is already in the wishlist
      const itemExists = wishlist.items.some(item => item.productId.toString() === productId);

      if (!itemExists) {
        wishlist.items.push({ productId });
      } else {
        // Optionally, show a message or redirect without modifying the wishlist
        return res.redirect('/wishlist'); // Avoid adding duplicate
      }
    }

    await wishlist.save();
    res.redirect('/wishlist'); // Redirect to wishlist after addition
  } catch (error) {
    console.error('Error adding to wishlist:', error.message);
    res.status(500).json({ error: 'Error adding to wishlist' });
  }
};



exports.removeFromWishlist = async (req, res) => {
  const { productId } = req.body; // Ensure productId is sent in the request

  try {
    // Update the wishlist by removing the specified productId
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { items: { productId: new mongoose.Types.ObjectId(productId) } } }, // Use 'new' keyword with ObjectId
      { new: true } // Return the updated wishlist
    );

    // If the wishlist is now empty, delete it
    if (!wishlist || wishlist.items.length === 0) {
      await Wishlist.deleteOne({ userId: req.user.id });
    }

    res.redirect('/wishlist'); // Redirect back to the wishlist page
  } catch (error) {
    console.error('Error removing from wishlist:', error.message);
    res.status(500).json({ error: 'Error removing from wishlist' });
  }
};

