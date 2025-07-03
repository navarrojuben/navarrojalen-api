const WebstoreService = require('../models/webstoreServiceModel');

// Utility: Check if request is from admin frontend
const isFromAdminFrontend = (req) => req.headers['x-admin-auth'] === 'navarrojuben';

// @desc    Get all services (Public)
// @route   GET /api/webstore-services
exports.getServices = async (req, res) => {
  try {
    const services = await WebstoreService.find().sort({ createdAt: -1 });
    res.status(200).json(services);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch services', error: err.message });
  }
};

// @desc    Create a new service (Admin only)
// @route   POST /api/webstore-services
exports.createService = async (req, res) => {
  if (!isFromAdminFrontend(req)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const {
    title,
    description,
    category,
    price,
    deliveryTime,
    images,
    tags,
    isActive,
  } = req.body;

  if (!title || !description || !category || price == null) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const newService = await WebstoreService.create({
      title,
      description,
      category,
      price,
      deliveryTime,
      images,
      tags,
      isActive,
    });

    res.status(201).json(newService);
  } catch (err) {
    res.status(500).json({ message: 'Failed to create service', error: err.message });
  }
};

// @desc    Update service (Admin only)
// @route   PUT /api/webstore-services/:id
exports.updateService = async (req, res) => {
  if (!isFromAdminFrontend(req)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { id } = req.params;

  try {
    const updatedService = await WebstoreService.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json(updatedService);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update service', error: err.message });
  }
};

// @desc    Delete service (Admin only)
// @route   DELETE /api/webstore-services/:id
exports.deleteService = async (req, res) => {
  if (!isFromAdminFrontend(req)) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { id } = req.params;

  try {
    const deletedService = await WebstoreService.findByIdAndDelete(id);

    if (!deletedService) {
      return res.status(404).json({ message: 'Service not found' });
    }

    res.status(200).json({ message: 'Service deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete service', error: err.message });
  }
};
