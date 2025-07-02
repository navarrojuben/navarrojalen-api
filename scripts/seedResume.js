// scripts/seedResume.js
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Resume = require('../models/resumeModel'); // Adjust path if needed

dotenv.config();

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URL); // or MONGODB_URI

    const existing = await Resume.findOne();
    if (existing) {
      console.log('Resume already exists. Skipping seed.');
      return process.exit(0);
    }

    const resume = new Resume({
      name: "Alexis Navarro",
      title: "Full Stack Developer",
      summary: "I'm a passionate web developer specializing in the MERN stack with real-time features and rich UI design.",
      contact: {
        email: "alex@example.com",
        phone: "+63 912 345 6789",
        location: "Philippines",
      },
      skills: ["React", "Node.js", "MongoDB", "SCSS", "Socket.IO"],
      experience: [
        {
          company: "TechCorp",
          position: "Frontend Developer",
          period: "2022 - 2023",
          description: "Built responsive UIs with React and SCSS.",
        },
      ],
      education: [
        {
          institution: "University of Something",
          degree: "BS in Computer Science",
          year: "2020",
        },
      ],
      projects: [
        {
          name: "Portfolio Site",
          link: "https://alexisnavarro.dev",
          description: "Personal portfolio built with React and Node.js",
        },
      ],
    });

    await resume.save();
    console.log('✅ Resume seeded successfully.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding failed:', err);
    process.exit(1);
  }
};

seed();
