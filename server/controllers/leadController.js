const Lead = require('../models/Lead');

// @desc    Get all leads with filtering, sorting, pagination
// @route   GET /api/leads
// @access  Private
const getLeads = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      source,
      priority,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      startDate,
      endDate,
    } = req.query;

    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;

    // Build query
    const query = {};

    // Search
    if (search && search.trim()) {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { company: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Filters
    if (status) query.status = status;
    if (source) query.source = source;
    if (priority) query.priority = priority;

    // Date range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        query.createdAt.$lte = end;
      }
    }

    // Sort
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [leads, total] = await Promise.all([
      Lead.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limitNum)
        .select('-notes -followUps'),
      Lead.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      leads,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get CRM stats
// @route   GET /api/leads/stats
// @access  Private
const getStats = async (req, res, next) => {
  try {
    // Status counts
    const statusAggregation = await Lead.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]);

    const statusCounts = {
      New: 0,
      Contacted: 0,
      Qualified: 0,
      Converted: 0,
      Closed: 0,
    };
    statusAggregation.forEach(({ _id, count }) => {
      if (statusCounts.hasOwnProperty(_id)) statusCounts[_id] = count;
    });

    const total = Object.values(statusCounts).reduce((a, b) => a + b, 0);
    const conversionRate =
      total > 0 ? Math.round((statusCounts.Converted / total) * 1000) / 10 : 0;

    // Monthly data (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
    twelveMonthsAgo.setDate(1);
    twelveMonthsAgo.setHours(0, 0, 0, 0);

    const monthlyAggregation = await Lead.aggregate([
      { $match: { createdAt: { $gte: twelveMonthsAgo } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    // Fill in all 12 months (including zeros)
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const year = d.getFullYear();
      const month = d.getMonth() + 1;
      const found = monthlyAggregation.find(
        (m) => m._id.year === year && m._id.month === month
      );
      monthlyData.push({
        month: monthNames[month - 1],
        year,
        count: found ? found.count : 0,
      });
    }

    // Source counts
    const sourceAggregation = await Lead.aggregate([
      { $group: { _id: '$source', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const sourceCounts = sourceAggregation.map(({ _id, count }) => ({
      source: _id,
      count,
    }));

    // Recent leads
    const recentLeads = await Lead.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email status source createdAt company');

    res.status(200).json({
      success: true,
      stats: {
        total,
        statusCounts,
        conversionRate,
        monthlyData,
        sourceCounts,
        recentLeads,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead
// @route   GET /api/leads/:id
// @access  Private
const getLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new lead
// @route   POST /api/leads
// @access  Public (contact form) / Private
const createLead = async (req, res, next) => {
  try {
    const lead = await Lead.create(req.body);
    res.status(201).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead
// @route   PUT /api/leads/:id
// @access  Private
const updateLead = async (req, res, next) => {
  try {
    // Don't allow direct notes/followUps update via this endpoint
    const { notes, followUps, ...updateData } = req.body;

    const lead = await Lead.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lead
// @route   DELETE /api/leads/:id
// @access  Private
const deleteLead = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }
    await lead.deleteOne();
    res.status(200).json({ success: true, message: 'Lead deleted successfully' });
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead status
// @route   PATCH /api/leads/:id/status
// @access  Private
const updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const validStatuses = ['New', 'Contacted', 'Qualified', 'Converted', 'Closed'];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    const lead = await Lead.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Add note to lead
// @route   POST /api/leads/:id/notes
// @access  Private
const addNote = async (req, res, next) => {
  try {
    const { content, createdBy } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.notes.push({
      content: content.trim(),
      createdBy: createdBy || req.user?.name || 'Admin',
    });

    await lead.save();
    res.status(201).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Update note
// @route   PUT /api/leads/:id/notes/:noteId
// @access  Private
const updateNote = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Note content is required' });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const note = lead.notes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.content = content.trim();
    note.updatedAt = new Date();
    await lead.save();

    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete note
// @route   DELETE /api/leads/:id/notes/:noteId
// @access  Private
const deleteNote = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const note = lead.notes.id(req.params.noteId);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.deleteOne();
    await lead.save();

    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Add follow-up
// @route   POST /api/leads/:id/followups
// @access  Private
const addFollowUp = async (req, res, next) => {
  try {
    const { date, description, reminder } = req.body;

    if (!date || !description) {
      return res.status(400).json({
        success: false,
        message: 'Date and description are required',
      });
    }

    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    lead.followUps.push({ date, description, reminder: reminder || false });
    await lead.save();

    res.status(201).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

// @desc    Update follow-up
// @route   PUT /api/leads/:id/followups/:followUpId
// @access  Private
const updateFollowUp = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ success: false, message: 'Lead not found' });
    }

    const followUp = lead.followUps.id(req.params.followUpId);
    if (!followUp) {
      return res.status(404).json({ success: false, message: 'Follow-up not found' });
    }

    const { date, description, reminder, completed } = req.body;
    if (date !== undefined) followUp.date = date;
    if (description !== undefined) followUp.description = description;
    if (reminder !== undefined) followUp.reminder = reminder;
    if (completed !== undefined) followUp.completed = completed;

    await lead.save();
    res.status(200).json({ success: true, lead });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeads,
  getStats,
  getLead,
  createLead,
  updateLead,
  deleteLead,
  updateStatus,
  addNote,
  updateNote,
  deleteNote,
  addFollowUp,
  updateFollowUp,
};
