const express = require('express');
const router = express.Router();
const {
  submitReport,
  getAllReports,
  getReportsByUser,
  getReportById,
  verifyReport,
  assignReport,
  updateReportStatus
} = require('../controllers/reportController');
const { verifyToken, checkRole } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const Report = require('../models/Report');
// Submit a new report
router.post('/', verifyToken, upload.single('image'), submitReport);

// Get all reports (for maintainers and field heads)
router.get('/', verifyToken, getAllReports);

// Get reports by user
router.get('/user/:userId', verifyToken, getReportsByUser);

// Get report by ID
router.get('/:reportId', verifyToken, getReportById);

// Verify report (mark as valid or fake)
router.put('/:reportId/verify', verifyToken, checkRole(['field_head']), verifyReport);

// Assign report to field head
router.put('/:reportId/assign', verifyToken, assignReport);

// Update report status
router.put('/:reportId/status', verifyToken, checkRole(['maintainer']), upload.single('closureImage'), updateReportStatus);

// Get all reports for a specific department (for field heads)
router.get('/department/:department', verifyToken, checkRole(['field_head']), async (req, res) => {
  try {
    const { department } = req.params;
    const user = req.user;

    // Ensure field head can only access their own department
    if (user.department !== department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const reports = await Report.find({ department, status: { $ne: 'fake' } })
      .sort({ createdAt: -1 })
      .populate('reporterId', 'name phone')
      .populate('maintainerId', 'name phone')
      .populate('fieldHeadId', 'name phone');

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error in getReportsByDepartment:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get department history reports (for field heads)
router.get('/department-history/:department', verifyToken, checkRole(['field_head']), async (req, res) => {
  try {
    const { department } = req.params;
    const { status } = req.query;
    const user = req.user;

    // Ensure field head can only access their own department
    if (user.department !== department) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let reports = [];

    if (status === 'fake') {
      // Fetch from FakeReport collection for fake reports
      const FakeReport = require('../models/FakeReport');
      reports = await FakeReport.find({ department })
        .sort({ createdAt: -1 })
        .populate('reporterId', 'name phone')
        .populate('maintainerId', 'name phone')
        .populate('fieldHeadId', 'name phone');
    } else if (status === 'all') {
      // For "all" status, fetch from both Report and FakeReport collections
      const FakeReport = require('../models/FakeReport');

      const regularReports = await Report.find({ department })
        .sort({ createdAt: -1 })
        .populate('reporterId', 'name phone')
        .populate('maintainerId', 'name phone')
        .populate('fieldHeadId', 'name phone');

      const fakeReports = await FakeReport.find({ department })
        .sort({ createdAt: -1 })
        .populate('reporterId', 'name phone')
        .populate('maintainerId', 'name phone')
        .populate('fieldHeadId', 'name phone');

      // Combine and sort all reports by createdAt
      reports = [...regularReports, ...fakeReports].sort((a, b) =>
        new Date(b.createdAt) - new Date(a.createdAt)
      );
    } else {
      // Fetch from Report collection for other statuses
      reports = await Report.find({ department, status })
        .sort({ createdAt: -1 })
        .populate('reporterId', 'name phone')
        .populate('maintainerId', 'name phone')
        .populate('fieldHeadId', 'name phone');
    }

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error in getDepartmentHistory:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
