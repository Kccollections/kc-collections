// controllers/cartController.js
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const Wishlist = require('../models/Wishlist'); // Adjust the path as needed

const mongoose = require('mongoose'); // Ensure this is imported for ObjectId

exports.addToCart = async (req, res, next) => {
  const { productId, quantity } = req.body;

  try {
    // Validate input data
    if (!productId || !quantity || quantity < 1) {
      return res.status(400).json({ error: 'Product ID and valid quantity are required' });
    }

    // Find or create the cart
    let cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      cart = new Cart({ userId: req.user.id, items: [{ productId, quantity }] });
    } else {
      // Check if the product already exists in the cart
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex > -1) {
        // Update the quantity if it exists
        cart.items[itemIndex].quantity = quantity;
      } else {
        // Add a new item if it doesn't exist
        cart.items.push({ productId, quantity });
      }
    }

    // Save the cart
    await cart.save();

    // Remove the product from the wishlist, if it exists
    const wishlist = await Wishlist.findOneAndUpdate(
      { userId: req.user.id },
      { $pull: { items: { productId: new mongoose.Types.ObjectId(productId) } } },
      { new: true }
    );

    // Delete the wishlist if it's empty
    if (wishlist && wishlist.items.length === 0) {
      await Wishlist.deleteOne({ userId: req.user.id });
    }

    // Populate product details before returning the response
    await cart.populate('items.productId');

    // Respond with the updated cart
    res.status(200).json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error.message);
    res.status(500).json({ error: 'Error adding item to cart' });
  }
};


// Get user's cart
exports.getCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id }).populate('items.productId');
    
    // Check if cart exists, otherwise pass an empty array
    if (!cart) {
      return res.render('user/cart', { cart: { items: [] }, page:"cart" });
    }

    console.log(cart);
    res.render('user/cart', { cart: cart , page:"cart"});
  } catch (error) {
    res.status(500).json({ error: 'Error fetching cart' });
  }
};


// Update cart item quantity
exports.updateCartItem = async (req, res) => {
  const { productId, quantity } = req.body;
  try {
    // console.log('Request Body:', req.body);

    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) {
      console.log('Cart not found for user:', req.user.id);
      return res.status(404).json({ error: 'Cart not found' });
    }

    const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = quantity;
      await cart.save();

      // console.log('Cart updated, populating product details...');
      await cart.populate('items.productId');

      // console.log('Rendering updated cart');
      res.json({ success: true, cart });
    } else {
      // console.log('Product not found in cart:', productId);
      res.status(404).json({ error: 'Product not found in cart' });
    }
  } catch (error) {
    console.error('Error updating cart item:', error);
    res.status(500).json({ error: 'Error updating cart item', details: error.message });
  }
};


// Remove item from cart
exports.removeFromCart = async (req, res) => {
  const { productId } = req.params;
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (!cart) return res.status(404).json({ error: 'Cart not found' });

    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    // res.json({ message: 'Item removed from cart', cart });
    // res.render('user/cart', { cart: cart });
    res.json({ success: true, cart }); 
  } catch (error) {
    res.status(500).json({ error: 'Error removing item from cart' });
  }
};

// Clear cart
exports.clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    // res.json({ message: 'Cart cleared' });
    res.render('user/cart', { cart: cart });
  } catch (error) {
    res.status(500).json({ error: 'Error clearing cart' });
  }
};
