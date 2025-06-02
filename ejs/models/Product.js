const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['Necklace', 'Rings', 'Earrings', 'Bracelet', 'Pendant', 'Set'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be a positive value'],
  },
  startingPrice:{
    type: Number,
    required: [true, 'starting price is required'],
    min: [0, 'Current price must be a positive value'],
  },
  sale: {
    type: Boolean,
    default: false,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    },
  stock: {
    type: Number,
    required: [true, 'Stock is required'],
    min: [0, 'Stock must be a non-negative value'],
  },
  material: {
    type: String,
    enum: ['Gold', 'Silver', 'Platinum', 'Diamond', 'Gemstone'],
  },
  weight: {
    type: Number,
    min: [0, 'Weight must be a positive value'],
  },
  dimensions: {
    type: String,
    default: 'N/A',
  },
  rating: {
    type: Number,
    min: [0, 'Rating must be between 0 and 5'],
    max: [5, 'Rating must be between 0 and 5'],
    default: 0,
  },
  attentionLevel: {
    type: String,
    enum: ['High', 'Medium', 'Low'],
    default: 'Medium',
  },
  color: {
    type: String,
    required: [true, 'Color is required'],
  },
  images: [{type: String, required:true }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Product', ProductSchema);
