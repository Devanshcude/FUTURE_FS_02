const express = require('express');
const router = express.Router();
const protect = require('../middleware/auth');
const {
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
} = require('../controllers/leadController');

// Stats route MUST be before /:id to avoid conflict
router.get('/stats', protect, getStats);

// Lead CRUD
router.get('/', protect, getLeads);
router.post('/', createLead); // Public: contact form submissions
router.get('/:id', protect, getLead);
router.put('/:id', protect, updateLead);
router.delete('/:id', protect, deleteLead);

// Status update
router.patch('/:id/status', protect, updateStatus);

// Notes
router.post('/:id/notes', protect, addNote);
router.put('/:id/notes/:noteId', protect, updateNote);
router.delete('/:id/notes/:noteId', protect, deleteNote);

// Follow-ups
router.post('/:id/followups', protect, addFollowUp);
router.put('/:id/followups/:followUpId', protect, updateFollowUp);

module.exports = router;
