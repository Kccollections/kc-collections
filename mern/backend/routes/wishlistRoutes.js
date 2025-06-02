const express = require('express');
const router = express.Router();
const wishlistController = require('../controllers/wishlistController.js');
const { authenticate } = require('../middleware/auth.js');

router.post('/add', authenticate, wishlistController.addToWishlist);
router.get('/get', authenticate, wishlistController.getWishlist);
router.post('/remove', authenticate, wishlistController.removeFromWishlist);
router.get('/', authenticate, wishlistController.getWishlist);

module.exports = router;