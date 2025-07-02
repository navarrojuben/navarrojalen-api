const WebstoreService = require('../models/webstoreServiceModel');

// GET all services
const getServices = async (req, res) => {
  const services = await WebstoreService.find().sort({ createdAt: -1 });
  res.json(services);
};

// POST new service
const createService = async (req, res) => {
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).json({ message: 'Title and description are required' });
  }

  const newService = await WebstoreService.create({ title, description });
  res.status(201).json(newService);
};

// PUT update service
const updateService = async (req, res) => {
  const { id } = req.params;
  const updated = await WebstoreService.findByIdAndUpdate(id, req.body, {
    new: true,
  });

  if (!updated) {
    return res.status(404).json({ message: 'Service not found' });
  }

  res.json(updated);
};

// DELETE service
const deleteService = async (req, res) => {
  const { id } = req.params;
  const deleted = await WebstoreService.findByIdAndDelete(id);

  if (!deleted) {
    return res.status(404).json({ message: 'Service not found' });
  }

  res.json({ message: 'Service deleted' });
};

module.exports = {
  getServices,
  createService,
  updateService,
  deleteService,
};
