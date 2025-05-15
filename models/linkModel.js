const mongoose = require('mongoose')

const Schema = mongoose.Schema

const linkSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  link: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  tags: {
    type: String,
    required: false
  }
  
//   ,
//   user_id: {
//     type: String,
//     required: true
//   }

}, { timestamps: true })

module.exports = mongoose.model('Link', linkSchema)