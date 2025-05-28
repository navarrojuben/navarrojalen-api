const Project = require('../models/projectModel');

// GET all
exports.getProjects = async (req, res) => {
  const projects = await Project.find();
  res.json(projects);
};

// POST new
exports.createProject = async (req, res) => {
  const project = new Project(req.body);
  const saved = await project.save();
  res.status(201).json(saved);
};

// PUT update
exports.updateProject = async (req, res) => {
  const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(project);
};

// DELETE
exports.deleteProject = async (req, res) => {
  await Project.findByIdAndDelete(req.params.id);
  res.json({ message: 'Deleted successfully' });
};
