const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  name: {
    type: String,
    default: 'Alexis Navarro',
  },
  title: {
    type: String,
    default: 'Full Stack Developer',
  },
  summary: {
    type: String,
    default: "I'm a passionate web developer specializing in the MERN stack.",
  },

  avatarUrl: { 
    type: String, 
    default: 'https://res.cloudinary.com/navarrojalen/image/upload/v1750839937/mern_uploads/vsqm7giemjopf9s0kub4.jpg' 
   }, // ✅ Add this line

   logoUrl: { 
    type: String, 
    default: 'https://res.cloudinary.com/navarrojalen/image/upload/v1750365010/mern_uploads/p4jnb0cyp373mf9i4mhq.png' 
   }, // ✅ Add this line

  contact: {
    email: {
      type: String,
      default: 'alex@example.com',
    },
    phone: {
      type: String,
      default: '+63 912 345 6789',
    },
    location: {
      type: String,
      default: 'Philippines',
    },
  },
  skills: {
    type: [String],
    default: ['React', 'Node.js', 'MongoDB', 'SCSS', 'Socket.IO'],
  },
  experience: {
    type: [
      {
        company: { type: String, default: 'TechCorp' },
        position: { type: String, default: 'Frontend Developer' },
        period: { type: String, default: '2022 - 2023' },
        description: {
          type: String,
          default: 'Built responsive UIs with React and SCSS.',
        },
      },
    ],
    default: [],
  },
  education: {
    type: [
      {
        institution: { type: String, default: 'University of Something' },
        degree: { type: String, default: 'BS in Computer Science' },
        year: { type: String, default: '2020' },
      },
    ],
    default: [],
  },
  projects: {
    type: [
      {
        name: { type: String, default: 'Portfolio Site' },
        link: { type: String, default: 'https://alexisnavarro.dev' },
        description: {
          type: String,
          default: 'Personal portfolio built with React and Node.js',
        },
      },
    ],
    default: [],
  },
}, { timestamps: true });

module.exports = mongoose.model('Resume', resumeSchema);
