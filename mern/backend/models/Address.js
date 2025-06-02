const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    streetAddress: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, required: true },
    isDefault: { type: Boolean, default: false }, // Flag for the default address
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Link to the user
}, {
    timestamps: true, // Automatically manage createdAt and updatedAt fields
});

const Address = mongoose.model('Address', addressSchema);

module.exports = Address;
