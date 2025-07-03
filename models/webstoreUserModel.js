const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  name: {
    type: String,
    trim: true,
    default: '', // Full name for customer info
  },

  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },

  contactNumber: {
    type: String,
    trim: true,
    default: '', // Phone or mobile number
  },

  address: {
    type: String,
    trim: true,
    default: '', // Shipping or contact address
  },

  password: {
    type: String,
    required: true,
  },

  avatar: {
    type: String,
    default: '', // Cloudinary URL or placeholder image
  },

  role: {
    type: String,
    enum: ['buyer', 'admin'],
    default: 'buyer',
  },

  njCredits: {
    type: Number,
    default: 0,
    min: 0,
  },

  orderHistory: [
    {
      orderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Order',
      },
      purchasedAt: Date,
    }
  ],

  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'MessageThread',
    }
  ],

  isBanned: {
    type: Boolean,
    default: false,
  }

}, { timestamps: true });


// 🔒 Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔑 Compare password method
userSchema.methods.comparePassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('WebstoreUser', userSchema);
