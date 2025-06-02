const mongoose = require('mongoose');

const sliderSchema = new mongoose.Schema({
    img: { type: String, required: true }, // URL or path to the image
    alt: { type: String, required: true }, // Alt text for accessibility
    title: { type: String, required: true }, // Title for the slide
    description: { type: String, required: true }, // Description for the slide
    link: { type: String, required: true }, // Link for the "Shop Now" button
  });
  

  module.exports = mongoose.model('Slider', sliderSchema);