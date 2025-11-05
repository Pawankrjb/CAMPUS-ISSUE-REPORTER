const multer = require('multer');
const { v4: uuidv4 } = require('uuid');

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// For now, we'll just add a mock URL for the uploaded image
// In a real implementation, you would upload to a cloud storage service
const uploadImage = async (req, res, next) => {
  if (!req.file) {
    return next();
  }
  
  try {
    // Mock URL for demonstration
    // In a real implementation, you would upload to a cloud storage service
    req.file.firebaseUrl = `https://example.com/images/${uuidv4()}-${req.file.originalname}`;
    next();
  } catch (error) {
    console.error('Error in uploadImage:', error);
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { upload, uploadImage };