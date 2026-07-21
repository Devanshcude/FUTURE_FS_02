const mongoose = require('mongoose');

// Note subdocument schema
const NoteSchema = new mongoose.Schema({
  content: {
    type: String,
    required: [true, 'Note content is required'],
    trim: true,
  },
  createdBy: {
    type: String,
    default: 'Admin',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

// Follow-up subdocument schema
const FollowUpSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Follow-up date is required'],
  },
  description: {
    type: String,
    required: [true, 'Follow-up description is required'],
    trim: true,
  },
  reminder: {
    type: Boolean,
    default: false,
  },
  completed: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Main Lead schema
const LeadSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Lead name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    phone: {
      type: String,
      trim: true,
    },
    company: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    source: {
      type: String,
      enum: [
        'Website',
        'Referral',
        'Social Media',
        'Email Campaign',
        'Phone Call',
        'Trade Show',
        'Other',
      ],
      default: 'Website',
    },
    status: {
      type: String,
      enum: ['New', 'Contacted', 'Qualified', 'Converted', 'Closed'],
      default: 'New',
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    message: {
      type: String,
      trim: true,
    },
    assignedTo: {
      type: String,
      default: 'Admin',
    },
    tags: [String],
    notes: [NoteSchema],
    followUps: [FollowUpSchema],
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
LeadSchema.index({ email: 1 });
LeadSchema.index({ status: 1 });
LeadSchema.index({ createdAt: -1 });
LeadSchema.index({ name: 'text', email: 'text', company: 'text' });

module.exports = mongoose.model('Lead', LeadSchema);
