const Review = require('../models/Review');

const cloudinary = require('cloudinary').v2;

exports.addReview = async (req, res) => {
  const { productId, rating, comment } = req.body;
  try {
    const image = await cloudinary.uploader.upload(req.file.path); // Assuming image is uploaded from a form
    const review = new Review({
      userId: req.user.id,
      productId,
      rating,
      comment,
      imageUrl: image.secure_url,
    });
    await review.save();
    res.json({ message: 'Review added successfully!' });
  } catch (error) {
    res.status(500).json({ error: 'Error adding review' });
  }
};


// Get reviews for a product
exports.getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).populate('userId', 'name');
    res.render('product', { reviews });
  } catch (error) {
    res.status(500).json({ error: 'Error fetching reviews' });
  }
};
