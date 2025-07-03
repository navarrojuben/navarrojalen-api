const mongoose = require('mongoose');

const webstoreOrderSchema = new mongoose.Schema(
  {
    user: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WebstoreUser',
        required: true,
      },
      username: { type: String, required: true },
      name: { type: String },
      email: { type: String, required: true },
      contactNumber: { type: String },
      address: { type: String },
    },

    items: [
      {
        _id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'WebstoreService',
          required: true,
        },
        title: { type: String, required: true },
        category: {
          type: String,
          enum: [
            'Web Development',
            'SEO',
            'Graphic Design',
            'Hosting',
            'Maintenance',
            'Consultation',
            // Match WebstoreService categories
          ],
        },
        price: { type: Number, required: true },
        deliveryTime: { type: Number }, // Optional snapshot of original service delivery time
        images: {
          type: [String],
          default: [],
          validate: {
            validator: function (arr) {
              return Array.isArray(arr) && arr.every(url => typeof url === 'string');
            },
            message: 'Each image must be a URL string',
          },
        },
      },
    ],

    note: { type: String },

    total: { type: Number, required: true },

    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('WebstoreOrder', webstoreOrderSchema);
