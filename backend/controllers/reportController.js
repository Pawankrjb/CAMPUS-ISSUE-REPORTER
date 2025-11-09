const Report = require('../models/Report');
const FakeReport = require('../models/FakeReport');
const User = require('../models/User');
const { sendEmail } = require('../services/emailService');

// Submit a new report
const submitReport = async (req, res) => {
  try {
    const { title, description, category, location, reporterId, reporterName } = req.body;
    
    // Create report
    const report = new Report({
      title,
      description,
      category,
      location,
      imageUrl: req.file ? req.file.firebaseUrl : '',
      reporterId,
      reporterName,
      department: category// Assign department from the user
    });
    
    await report.save();
    
    // Get all maintainers to notify
    const maintainers = await User.find({ role: 'maintainer' });

    // Notify maintainers
    maintainers.forEach(async (maintainer) => {
      if (maintainer.email) {
        await sendEmail(
          maintainer.email,
          'New Issue Reported',
          `A new issue has been reported: ${title}. Please review and verify.`
        );
      }
      if (maintainer.phone) {
        await sendSMS(
          maintainer.phone,
          `New issue reported: ${title}. Please review and verify.`
        );
      }
    });
    
    res.status(201).json({
      message: 'Report submitted successfully',
      reportId: report._id
    });
  } catch (error) {
    console.error('Error in submitReport:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all reports (for maintainers and field heads)
const getAllReports = async (req, res) => {
  try {
    const { status, category, view } = req.query;
    const user = req.user;
    let query = {};

    if (category) {
      query.category = category;
    }

    // Filter reports based on user role
    if (user.role === 'field_head') {
      // Field heads can READ reports in their department
      query.category = user.department;
      if (view === 'verify_section') {
        // For verify section, show only pending reports
        query.status = 'pending';
      } else if (status) {
        if (status === 'fake') {
          // Fake reports are in a separate collection, return empty for this query
          return res.status(200).json({ reports: [] });
        } else {
          query.status = status;
        }
      } else {
        query.status = 'pending';
      }
    } else if (user.role === 'maintainer') {
      // Maintainers see all reports except fake and pending ones
      
        query.category = user.department;
      
      if (status) {
        query.status = status;
      } else {
        query.status = { $in: ['assigned', 'verified',  'in_progress'] };
      }
    } else if (user.role === 'user') {
      // Users can only see their own reports
      query.reporterId = user._id;
      if (status) {
        query.status = status;
      } else {
        query.status = { $ne: 'fake' };
      }
    }

    const reports = await Report.find(query)
      .sort({ createdAt: -1 })
      .populate('reporterId', 'name phone')
      .populate('maintainerId', 'name phone')
      .populate('fieldHeadId', 'name phone');

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error in getAllReports:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get reports by user
const getReportsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const reports = await Report.find({ reporterId: userId, status: { $ne: 'fake' } })
      .sort({ createdAt: -1 })
      .populate('maintainerId', 'name phone')
      .populate('fieldHeadId', 'name phone');

    console.log('Fetching reports for userId:', userId, 'Found:', reports.length);

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error in getReportsByUser:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get report by ID
const getReportById = async (req, res) => {
  try {
    const { reportId } = req.params;

    if (!reportId || reportId === 'undefined') {
      return res.status(400).json({ error: 'Invalid report ID' });
    }

    const report = await Report.findById(reportId)
      .populate('reporterId', 'name phone')
      .populate('maintainerId', 'name phone')
      .populate('fieldHeadId', 'name phone');

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.status(200).json({ report });
  } catch (error) {
    console.error('Error in getReportById:', error);
    res.status(500).json({ error: error.message });
  }
};

// Verify report (mark as valid or fake)
const verifyReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, maintainerId, maintainerName, department } = req.body;

    if (!['verified', 'fake'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    if (status === 'fake') {
      // Create a copy in FakeReport collection
      const fakeReport = new FakeReport({
        title: report.title,
        description: report.description,
        category: report.category,
        location: report.location,
        imageUrl: report.imageUrl,
        status: 'fake',
        reporterId: report.reporterId,
        reporterName: report.reporterName,
        maintainerId: maintainerId,
        maintainerName: maintainerName,
        fieldHeadId: report.fieldHeadId,
        fieldHeadName: report.fieldHeadName,
        department: department,
        verifiedAt: new Date(),
        assignedAt: report.assignedAt,
        inProgressAt: report.inProgressAt,
        resolvedAt: report.resolvedAt,
        closureImageUrl: report.closureImageUrl,
        originalReportId: report._id
      });

      await fakeReport.save();

      // Remove the original report from the main collection
      await Report.findByIdAndDelete(reportId);

      // Notify reporter that their report was marked as fake
      const reporter = await User.findById(report.reporterId);
      if (reporter) {
        if (reporter.email) {
          await sendEmail(
            reporter.email,
            'Your Report Has Been Marked as Fake',
            `Your report "${report.title}" has been reviewed and marked as fake.`
          );
        }
        if (reporter.phone) {
          await sendSMS(
            reporter.phone,
            `Your report "${report.title}" has been marked as fake.`
          );
        }
      }
    } else if (status === 'verified') {
      // Update report
      report.status = status;
      report.maintainerId = null; // Leave null so maintainers in the department can pick
      report.maintainerName = null;
      report.department = department;
      report.verifiedAt = new Date();

      await report.save();

      // Notify all maintainers that a verified report is ready
      const maintainers = await User.find({ role: 'maintainer' });

      maintainers.forEach(async (maintainer) => {
        if (maintainer.email) {
          await sendEmail(
            maintainer.email,
            'New Verified Issue Ready',
            `A new issue has been verified and is ready for maintenance: ${report.title}. Please review and start work.`
          );
        }
        if (maintainer.phone) {
          await sendSMS(
            maintainer.phone,
            `New verified issue ready: ${report.title}. Please review and start work.`
          );
        }
      });

      // Notify reporter
      const reporter = await User.findById(report.reporterId);
      if (reporter) {
        if (reporter.email) {
          await sendEmail(
            reporter.email,
            'Your Report Has Been Verified',
            `Your report "${report.title}" has been verified and forwarded to maintenance.`
          );
        }
        if (reporter.phone) {
          await sendSMS(
            reporter.phone,
            `Your report "${report.title}" has been verified and forwarded to maintenance.`
          );
        }
      }
    }

    res.status(200).json({ message: 'Report verified successfully' });
  } catch (error) {
    console.error('Error in verifyReport:', error);
    res.status(500).json({ error: error.message });
  }
};

// Assign report to field head
const assignReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { fieldHeadId, fieldHeadName } = req.body;
    
    const report = await Report.findById(reportId);
    
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    
    // Update report
    report.status = 'assigned';
    report.fieldHeadId = fieldHeadId;
    report.fieldHeadName = fieldHeadName;
    report.assignedAt = new Date();

    // If the report was previously verified, we can keep it as assigned
    // The frontend will now show verified reports in the assigned section
    
    await report.save();
    
    // Notify field head
    const fieldHead = await User.findById(fieldHeadId);
    if (fieldHead) {
      if (fieldHead.email) {
        await sendEmail(
          fieldHead.email,
          'New Issue Assigned',
          `A new issue has been assigned to you: ${report.title}. Please review and update the status.`
        );
      }
      if (fieldHead.phone) {
        await sendSMS(
          fieldHead.phone,
          `New issue assigned: ${report.title}. Please review and update status.`
        );
      }
    }
    
    // Notify reporter
    const reporter = await User.findById(report.reporterId);
    if (reporter) {
      if (reporter.email) {
        await sendEmail(
          reporter.email,
          'Your Report Has Been Assigned',
          `Your report "${report.title}" has been assigned to a field head for resolution.`
        );
      }
      if (reporter.phone) {
        await sendSMS(
          reporter.phone,
          `Your report "${report.title}" has been assigned to a field head for resolution.`
        );
      }
    }
    
    res.status(200).json({ message: 'Report assigned successfully' });
  } catch (error) {
    console.error('Error in assignReport:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update report status
const updateReportStatus = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { status, fieldHeadId } = req.body;
    const user = req.user;

    if (!['in_progress', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status' });
    }

    const report = await Report.findById(reportId);

    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    // Check permissions: only maintainers can update status (start work, resolve)
    if (user.role !== 'maintainer') {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Maintainers can update assigned, verified, or in_progress reports
    if (!['assigned', 'verified', 'in_progress'].includes(report.status)) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update report
    report.status = status;

    if (status === 'in_progress') {
      report.inProgressAt = new Date();
    } else if (status === 'resolved') {
      report.resolvedAt = new Date();
      if (req.file) {
        report.closureImageUrl = req.file.firebaseUrl;
      }
    }

    await report.save();

    // Notify reporter
    const reporter = await User.findById(report.reporterId);
    if (reporter) {
      const statusText = status === 'in_progress' ? 'is being worked on' : 'has been resolved';

      if (reporter.email) {
        await sendEmail(
          reporter.email,
          `Report Status Update`,
          `Your report "${report.title}" ${statusText}.`
        );
      }
      if (reporter.phone) {
        await sendSMS(
          reporter.phone,
          `Your report "${report.title}" ${statusText}.`
        );
      }
    }

    res.status(200).json({ message: 'Report status updated successfully' });
  } catch (error) {
    console.error('Error in updateReportStatus:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  submitReport,
  getAllReports,
  getReportsByUser,
  getReportById,
  verifyReport,
  assignReport,
  updateReportStatus
};