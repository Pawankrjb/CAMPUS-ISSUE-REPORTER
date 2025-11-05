const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['road', 'electric', 'water', 'building', 'other'],
    required: true
  },
  location: {
    type: String,
    required: true
  },
  imageUrl: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'assigned', 'in_progress', 'resolved', 'fake'],
    default: 'pending'
  },
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporterName: {
    type: String,
    required: true
  },
  maintainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  maintainerName: {
    type: String,
    required: false
  },
  fieldHeadId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  fieldHeadName: {
    type: String,
    required: false
  },
  department: {
    type: String,
    required: false
  },
  verifiedAt: {
    type: Date,
    required: false
  },
  assignedAt: {
    type: Date,
    required: false
  },
  inProgressAt: {
    type: Date,
    required: false
  },
  resolvedAt: {
    type: Date,
    required: false
  },
  closureImageUrl: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Report', reportSchema);