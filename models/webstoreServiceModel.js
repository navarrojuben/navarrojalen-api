const mongoose = require('mongoose');
const slugify = require('slugify');

const webstoreServiceSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Web Development',
        'SEO',
        'Graphic Design',
        'Hosting',
        'Maintenance',
        'Consultation',
        // add more as needed
      ],
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    deliveryTime: {
      type: Number,
      default: 3, // in days
    },
    images: {
      type: [String], // Now an array of image URLs
      default: [],
      validate: {
        validator: function (arr) {
          return Array.isArray(arr) && arr.every(url => typeof url === 'string');
        },
        message: 'Each image must be a URL string',
      },
    },
    tags: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Auto-generate slug before saving
webstoreServiceSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = slugify(this.title, { lower: true, strict: true });
  }
  next();
});

module.exports = mongoose.model('WebstoreService', webstoreServiceSchema);
