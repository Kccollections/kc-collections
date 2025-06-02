const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true },
  mobile: { type: String, unique: true },
  password: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
  addresses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Address',default:null}],  // Updated this line to an array
});

// UserSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next();
//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });

// Method to compare password
UserSchema.methods.comparePassword = async function(password) {
  const match = await bcrypt.compare(password, this.password);
  console.log(`Comparing password: ${password} with hashed password: ${this.password} => Match: ${match}`);
  return match;
};

module.exports = mongoose.model('User', UserSchema);
