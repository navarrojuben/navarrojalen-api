const mongoose = require('mongoose');

const DateSchema = new mongoose.Schema({

  title: {   type: String, 
         required: true },

  classification: { type: String, 
                required: true },
        
  date: {       type: Date, 
            required: true },

  description: {    type: String, 
                required: false }, 

  isRecurring: { type: Boolean, 
              default: false }
              
}, { timestamps: true });

module.exports = mongoose.model('Date', DateSchema);
