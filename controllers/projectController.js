const Project = require('../models/projectModel');

// Helper function to process imageUrl
// This now expects an array of objects from the frontend
const processImageUrlsForDb = (imageUrlsInput) => {
  if (Array.isArray(imageUrlsInput)) {
    // Map each item to ensure it has 'url' and 'description' properties,
    // and filter out entries that don't have a valid URL.
    return imageUrlsInput.map(img => ({
      url: (typeof img.url === 'string' && img.url.trim() !== '') ? img.url.trim() : null, // Ensure URL is string and not empty after trim
      description: (typeof img.description === 'string') ? img.description.trim() : '', // Ensure description is string
    })).filter(img => img.url !== null); // Filter out entries where URL is invalid or empty
  }
  // If input is not an array, or is empty, return an empty array
  return [];
};

// GET all
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find();
    res.json(projects);
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({ message: 'Error fetching projects' });
  }
};

// POST new
exports.createProject = async (req, res) => {
  try {
    const { title, description, techStack, githubUrl, liveUrl, imageUrl } = req.body;

    // Process imageUrl array of objects for saving
    const processedImageUrls = processImageUrlsForDb(imageUrl);

    const project = new Project({
      title,
      description,
      techStack,
      githubUrl,
      liveUrl,
      imageUrl: processedImageUrls, // Use the processed array of objects
    });

    const saved = await project.save();
    res.status(201).json(saved);
  } catch (error) {
    console.error('Error creating project:', error);
    // Provide more specific error details if validation fails
    if (error.name === 'ValidationError') {
        res.status(400).json({ message: 'Validation Error', errors: error.errors });
    } else {
        res.status(400).json({ message: 'Error creating project', error: error.message });
    }
  }
};

// PUT update
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { imageUrl, ...otherUpdates } = req.body;

    let updates = { ...otherUpdates };

    // Process imageUrl if it's part of the update
    if (imageUrl !== undefined) {
      updates.imageUrl = processImageUrlsForDb(imageUrl); // Use the processed array of objects
    }

    // `runValidators: true` ensures the schema's validation rules are applied to updates
    const project = await Project.findByIdAndUpdate(id, updates, { new: true, runValidators: true });

    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    console.error('Error updating project:', error);
    if (error.name === 'ValidationError') {
        res.status(400).json({ message: 'Validation Error', errors: error.errors });
    } else {
        res.status(400).json({ message: 'Error updating project', error: error.message });
    }
  }
};

// DELETE
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Deleted successfully', project: deletedProject });
  } catch (error) {
    console.error('Error deleting project:', error);
    res.status(500).json({ message: 'Error deleting project' });
  }
};