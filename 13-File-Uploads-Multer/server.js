/**
 * Section 13: File Uploads & Multipart Form Handling with Multer
 * --------------------------------------------------------------
 * Demonstrates how to securely handle file uploads in Express APIs using Multer:
 * 1. Disk storage configuration with custom filenames to avoid collisions.
 * 2. MIME type filtering (e.g., restricting avatars to image files only).
 * 3. File size limit enforcement (e.g., 2MB limit per file).
 * 4. Handling single vs. multiple file uploads cleanly.
 */
const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3005;

// Ensure upload directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Serve static client files and uploaded media
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(uploadDir));

// 1. Configure Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and prepend unique timestamp to prevent overwriting
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_');
    cb(null, `${baseName}-${uniqueSuffix}${ext}`);
  }
});

// 2. File Filter for Images (Avatars)
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only JPEG, PNG, WEBP, and GIF images are allowed.'), false);
  }
};

// 3. File Filter for General Documents
const docFilter = (req, file, cb) => {
  const allowedMimes = [
    'image/jpeg', 'image/png', 'application/pdf',
    'text/plain', 'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid document type! Only PDF, Word DOCX, TXT, and Images are allowed.'), false);
  }
};

// Initialize Multer Upload Instances with size limits
const uploadAvatar = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: imageFilter
});

const uploadDocuments = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max per file
  fileFilter: docFilter
});

// Route 1: Single Avatar Image Upload Endpoint
app.post('/api/upload/avatar', (req, res) => {
  uploadAvatar.single('avatar')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading (e.g., File too large)
      return res.status(400).json({ status: 'fail', message: `Upload Error: ${err.message}` });
    } else if (err) {
      // An unknown error occurred (e.g., Custom fileFilter error)
      return res.status(400).json({ status: 'fail', message: err.message });
    }

    if (!req.file) {
      return res.status(400).json({ status: 'fail', message: 'Please select an image file to upload!' });
    }

    res.status(200).json({
      status: 'success',
      message: '🎉 Avatar uploaded successfully!',
      file: {
        originalName: req.file.originalname,
        filename: req.file.filename,
        size: `${(req.file.size / 1024).toFixed(2)} KB`,
        mimetype: req.file.mimetype,
        url: `/uploads/${req.file.filename}`
      }
    });
  });
});

// Route 2: Multiple Document Upload Endpoint (Max 5 files)
app.post('/api/upload/documents', (req, res) => {
  uploadDocuments.array('documents', 5)(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(400).json({ status: 'fail', message: `Upload Error: ${err.message}` });
    } else if (err) {
      return res.status(400).json({ status: 'fail', message: err.message });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ status: 'fail', message: 'Please select at least one document to upload!' });
    }

    const fileDetails = req.files.map(file => ({
      originalName: file.originalname,
      filename: file.filename,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      mimetype: file.mimetype,
      url: `/uploads/${file.filename}`
    }));

    res.status(200).json({
      status: 'success',
      message: `🎉 Successfully uploaded ${req.files.length} document(s)!`,
      files: fileDetails
    });
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`\n🚀 Multer File Upload Server running on http://localhost:${PORT}`);
    console.log(`👉 Open your browser to test dragging & dropping file uploads!`);
  });
}

module.exports = app;
