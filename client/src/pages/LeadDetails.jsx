import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, Building2, Globe, Tag,
  Clock, Pencil, Trash2, Check, X, Plus, Bell, BellOff,
  CheckCircle2, Circle, Save, User, MessageSquare, Calendar,
} from 'lucide-react';
import { leadsAPI } from '../services/api';
import StatusBadge from '../components/leads/StatusBadge';
import { ConfirmModal } from '../components/ui/Modal';
import Skeleton from '../components/ui/Skeleton';
import {
  formatDate, formatDateTime, formatRelativeTime,
  getPriorityClass, getStatusColor,
  getErrorMessage, STATUS_OPTIONS, SOURCE_OPTIONS, PRIORITY_OPTIONS,
} from '../utils/helpers';
import toast from 'react-hot-toast';

function InfoRow({ icon: Icon, label, value, href }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-border/50 last:border-0">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: '#1A1A26' }}>
        <Icon size={13} className="text-text-faint" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-text-faint mb-0.5">{label}</p>
        {href ? (
          <a href={href} target="_blank" rel="noreferrer" className="text-sm text-accent hover:underline truncate block">{value || '—'}</a>
        ) : (
          <p className="text-sm text-text-primary truncate">{value || '—'}</p>
        )}
      </div>
    </div>
  );
}

export default function LeadDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit lead state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Notes state
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editNoteContent, setEditNoteContent] = useState('');
  const [deletingNoteId, setDeletingNoteId] = useState(null);

  // Follow-ups state
  const [showFollowUpForm, setShowFollowUpForm] = useState(false);
  const [followUpForm, setFollowUpForm] = useState({ date: '', description: '', reminder: false });
  const [addingFollowUp, setAddingFollowUp] = useState(false);

  const fetchLead = useCallback(async () => {
    setLoading(true);
    try {
      const res = await leadsAPI.getById(id);
      setLead(res.data.lead);
      setEditForm({
        name: res.data.lead.name,
        email: res.data.lead.email,
        phone: res.data.lead.phone || '',
        company: res.data.lead.company || '',
        website: res.data.lead.website || '',
        source: res.data.lead.source,
        status: res.data.lead.status,
        priority: res.data.lead.priority,
        message: res.data.lead.message || '',
      });
    } catch {
      toast.error('Failed to load lead details');
      navigate('/leads');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => { fetchLead(); }, [fetchLead]);

  const handleSaveEdit = async () => {
    setSaving(true);
    try {
      const res = await leadsAPI.update(id, editForm);
      setLead(res.data.lead);
      setEditing(false);
      toast.success('Lead updated');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (status) => {
    try {
      const res = await leadsAPI.updateStatus(id, status);
      setLead(res.data.lead);
      toast.success(`Status changed to ${status}`);
    } catch {
      toast.error('Failed to update status');
    }
  };

  // Notes
  const handleAddNote = async () => {
    if (!newNote.trim()) return;
    setAddingNote(true);
    try {
      const res = await leadsAPI.addNote(id, newNote.trim());
      setLead(res.data.lead);
      setNewNote('');
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  const handleEditNote = async (noteId) => {
    if (!editNoteContent.trim()) return;
    try {
      const res = await leadsAPI.updateNote(id, noteId, editNoteContent.trim());
      setLead(res.data.lead);
      setEditingNoteId(null);
      toast.success('Note updated');
    } catch {
      toast.error('Failed to update note');
    }
  };

  const handleDeleteNote = async (noteId) => {
    setDeletingNoteId(noteId);
    try {
      const res = await leadsAPI.deleteNote(id, noteId);
      setLead(res.data.lead);
      toast.success('Note deleted');
    } catch {
      toast.error('Failed to delete note');
    } finally {
      setDeletingNoteId(null);
    }
  };

  // Follow-ups
  const handleAddFollowUp = async () => {
    if (!followUpForm.date || !followUpForm.description.trim()) {
      toast.error('Date and description are required');
      return;
    }
    setAddingFollowUp(true);
    try {
      const res = await leadsAPI.addFollowUp(id, followUpForm);
      setLead(res.data.lead);
      setFollowUpForm({ date: '', description: '', reminder: false });
      setShowFollowUpForm(false);
      toast.success('Follow-up scheduled');
    } catch {
      toast.error('Failed to add follow-up');
    } finally {
      setAddingFollowUp(false);
    }
  };

  const handleToggleFollowUp = async (followUpId, completed) => {
    try {
      const res = await leadsAPI.updateFollowUp(id, followUpId, { completed: !completed });
      setLead(res.data.lead);
    } catch {
      toast.error('Failed to update follow-up');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col gap-5 animate-fade-in">
        <div className="flex items-center gap-3">
          <Skeleton width={32} height={32} style={{ borderRadius: 8 }} />
          <Skeleton width={200} height={24} />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2 flex flex-col gap-5">
            {[1, 2, 3].map(i => <div key={i} className="glass-card p-6"><Skeleton height={120} /></div>)}
          </div>
          <div className="flex flex-col gap-5">
            {[1, 2].map(i => <div key={i} className="glass-card p-6"><Skeleton height={160} /></div>)}
          </div>
        </div>
      </div>
    );
  }

  if (!lead) return null;

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Back + Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div className="flex items-start gap-4">
          <button
            onClick={() => navigate('/leads')}
            className="p-2 rounded-lg border border-border hover:bg-surface2 transition-colors text-text-muted hover:text-text-primary"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-xl font-bold text-text-primary">{lead.name}</h2>
              <StatusBadge status={lead.status} />
              <span className={`status-badge ${getPriorityClass(lead.priority)}`}>
                {lead.priority} Priority
              </span>
            </div>
            <p className="text-text-faint text-sm mt-1">
              {lead.company && `${lead.company} · `}
              Added {formatRelativeTime(lead.createdAt)}
            </p>
          </div>
        </div>
        {!editing && (
          <button className="btn-primary text-sm" onClick={() => setEditing(true)}>
            <Pencil size={14} />
            Edit Lead
          </button>
        )}
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left: Lead info + Notes + Follow-ups */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Lead Information */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <User size={16} className="text-accent" /> Lead Information
              </h3>
              {editing && (
                <div className="flex gap-2">
                  <button className="btn-ghost text-xs" onClick={() => setEditing(false)}>
                    <X size={13} /> Cancel
                  </button>
                  <button className="btn-primary text-xs" onClick={handleSaveEdit} disabled={saving}>
                    <Save size={13} /> {saving ? 'Saving...' : 'Save'}
                  </button>
                </div>
              )}
            </div>

            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: 'name', label: 'Name', required: true },
                  { key: 'email', label: 'Email', type: 'email', required: true },
                  { key: 'phone', label: 'Phone' },
                  { key: 'company', label: 'Company' },
                  { key: 'website', label: 'Website' },
                ].map(({ key, label, type = 'text', required }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text-muted">
                      {label}{required && <span className="text-accent ml-1">*</span>}
                    </label>
                    <input
                      type={type}
                      className="input-field"
                      value={editForm[key] || ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                {[
                  { key: 'source', label: 'Source', opts: SOURCE_OPTIONS },
                  { key: 'priority', label: 'Priority', opts: PRIORITY_OPTIONS },
                ].map(({ key, label, opts }) => (
                  <div key={key} className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium text-text-muted">{label}</label>
                    <select
                      className="input-field appearance-none"
                      value={editForm[key] || ''}
                      onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    >
                      {opts.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
                <div className="sm:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-medium text-text-muted">Message</label>
                  <textarea
                    className="input-field resize-none"
                    rows={3}
                    value={editForm.message || ''}
                    onChange={(e) => setEditForm((f) => ({ ...f, message: e.target.value }))}
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8">
                <div>
                  <InfoRow icon={Mail} label="Email" value={lead.email} href={`mailto:${lead.email}`} />
                  <InfoRow icon={Phone} label="Phone" value={lead.phone} href={lead.phone ? `tel:${lead.phone}` : undefined} />
                  <InfoRow icon={Building2} label="Company" value={lead.company} />
                  <InfoRow icon={Globe} label="Website" value={lead.website} href={lead.website} />
                </div>
                <div>
                  <InfoRow icon={Tag} label="Source" value={lead.source} />
                  <InfoRow icon={User} label="Assigned To" value={lead.assignedTo} />
                  <InfoRow icon={Clock} label="Created" value={formatDateTime(lead.createdAt)} />
                  <InfoRow icon={Clock} label="Updated" value={formatDateTime(lead.updatedAt)} />
                </div>
                {lead.message && (
                  <div className="sm:col-span-2 mt-4 p-3 rounded-lg bg-surface2 border border-border">
                    <p className="text-xs text-text-faint mb-1">Original Message</p>
                    <p className="text-sm text-text-muted">{lead.message}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-text-primary flex items-center gap-2 mb-5">
              <MessageSquare size={16} className="text-accent" />
              Notes
              <span className="text-xs text-text-faint font-normal">({lead.notes?.length || 0})</span>
            </h3>

            {/* Note list */}
            {lead.notes?.length === 0 ? (
              <div className="text-center py-8 text-text-faint text-sm">
                No notes yet. Add one below.
              </div>
            ) : (
              <div className="flex flex-col gap-3 mb-5">
                {[...(lead.notes || [])].reverse().map((note) => (
                  <div key={note._id} className="rounded-lg bg-surface2 border border-border p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ background: '#EAB30820', color: '#EAB308' }}
                        >
                          {note.createdBy?.charAt(0) || 'A'}
                        </div>
                        <span className="text-xs font-medium text-text-muted">{note.createdBy}</span>
                        <span className="text-xs text-text-faint">·</span>
                        <span className="text-xs text-text-faint">{formatRelativeTime(note.updatedAt || note.createdAt)}</span>
                        {note.updatedAt && <span className="text-xs text-text-faint">(edited)</span>}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => { setEditingNoteId(note._id); setEditNoteContent(note.content); }}
                          className="p-1 rounded text-text-faint hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                          title="Edit note"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteNote(note._id)}
                          disabled={deletingNoteId === note._id}
                          className="p-1 rounded text-text-faint hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Delete note"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>

                    {editingNoteId === note._id ? (
                      <div className="flex flex-col gap-2">
                        <textarea
                          className="input-field resize-none text-sm"
                          rows={3}
                          value={editNoteContent}
                          onChange={(e) => setEditNoteContent(e.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2 justify-end">
                          <button className="btn-ghost text-xs" onClick={() => setEditingNoteId(null)}>
                            <X size={12} /> Cancel
                          </button>
                          <button className="btn-primary text-xs" onClick={() => handleEditNote(note._id)}>
                            <Check size={12} /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-text-muted leading-relaxed">{note.content}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Add note */}
            <div className="flex flex-col gap-2 pt-4 border-t border-border">
              <textarea
                className="input-field resize-none text-sm"
                rows={3}
                placeholder="Add a note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
              />
              <div className="flex justify-end">
                <button
                  className="btn-primary text-sm"
                  onClick={handleAddNote}
                  disabled={addingNote || !newNote.trim()}
                >
                  <Plus size={14} />
                  {addingNote ? 'Adding...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>

          {/* Follow-ups */}
          <div className="glass-card p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-semibold text-text-primary flex items-center gap-2">
                <Calendar size={16} className="text-accent" />
                Follow-ups
                <span className="text-xs text-text-faint font-normal">({lead.followUps?.length || 0})</span>
              </h3>
              <button
                onClick={() => setShowFollowUpForm(!showFollowUpForm)}
                className="btn-secondary text-xs"
              >
                <Plus size={13} /> Schedule
              </button>
            </div>

            {/* Add follow-up form */}
            {showFollowUpForm && (
              <div className="mb-4 p-4 rounded-lg bg-surface2 border border-border animate-slide-up">
                <p className="text-sm font-medium text-text-muted mb-3">New Follow-up</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-text-faint">Date <span className="text-accent">*</span></label>
                    <input
                      type="date"
                      className="input-field text-sm"
                      value={followUpForm.date}
                      onChange={(e) => setFollowUpForm((f) => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer text-sm text-text-muted">
                      <input
                        type="checkbox"
                        checked={followUpForm.reminder}
                        onChange={(e) => setFollowUpForm((f) => ({ ...f, reminder: e.target.checked }))}
                        className="w-4 h-4 rounded accent-yellow-500"
                      />
                      Set reminder
                    </label>
                  </div>
                </div>
                <textarea
                  className="input-field resize-none text-sm mb-3"
                  rows={2}
                  placeholder="Follow-up description... *"
                  value={followUpForm.description}
                  onChange={(e) => setFollowUpForm((f) => ({ ...f, description: e.target.value }))}
                />
                <div className="flex gap-2 justify-end">
                  <button className="btn-ghost text-xs" onClick={() => setShowFollowUpForm(false)}>Cancel</button>
                  <button className="btn-primary text-xs" onClick={handleAddFollowUp} disabled={addingFollowUp}>
                    {addingFollowUp ? 'Scheduling...' : 'Schedule Follow-up'}
                  </button>
                </div>
              </div>
            )}

            {lead.followUps?.length === 0 ? (
              <div className="text-center py-8 text-text-faint text-sm">
                No follow-ups scheduled yet.
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {[...(lead.followUps || [])].sort((a, b) => new Date(a.date) - new Date(b.date)).map((fu) => {
                  const isOverdue = new Date(fu.date) < new Date() && !fu.completed;
                  return (
                    <div
                      key={fu._id}
                      className={`flex items-start gap-3 p-3 rounded-lg border transition-colors ${
                        fu.completed
                          ? 'bg-green-500/5 border-green-500/20'
                          : isOverdue
                          ? 'bg-red-500/5 border-red-500/20'
                          : 'bg-surface2 border-border'
                      }`}
                    >
                      <button
                        onClick={() => handleToggleFollowUp(fu._id, fu.completed)}
                        className="mt-0.5 flex-shrink-0 transition-colors"
                      >
                        {fu.completed ? (
                          <CheckCircle2 size={18} className="text-green-400" />
                        ) : (
                          <Circle size={18} className="text-text-faint hover:text-accent transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm ${fu.completed ? 'line-through text-text-faint' : 'text-text-primary'}`}>
                          {fu.description}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs font-medium ${isOverdue ? 'text-red-400' : 'text-text-faint'}`}>
                            {formatDate(fu.date)}{isOverdue && ' · Overdue'}
                          </span>
                          {fu.reminder && (
                            <Bell size={11} className="text-accent" title="Reminder set" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right: Status + Quick Info */}
        <div className="flex flex-col gap-5">
          {/* Status Card */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-text-primary mb-4">Lead Status</h3>
            <div className="flex flex-col gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => lead.status !== s && handleStatusChange(s)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                    lead.status === s
                      ? 'border-current'
                      : 'border-border hover:border-border-light bg-surface2 hover:bg-surface3'
                  }`}
                  style={
                    lead.status === s
                      ? { background: getStatusColor(s) + '15', borderColor: getStatusColor(s) + '50', color: getStatusColor(s) }
                      : {}
                  }
                >
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: lead.status === s ? getStatusColor(s) : '#475569' }}
                  />
                  <span className={`text-sm font-medium ${lead.status === s ? '' : 'text-text-muted'}`}>{s}</span>
                  {lead.status === s && <Check size={14} className="ml-auto" />}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-text-primary mb-4">Quick Info</h3>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Notes', value: lead.notes?.length || 0 },
                { label: 'Follow-ups', value: lead.followUps?.length || 0 },
                {
                  label: 'Completed Follow-ups',
                  value: lead.followUps?.filter((f) => f.completed).length || 0,
                },
                {
                  label: 'Pending Follow-ups',
                  value: lead.followUps?.filter((f) => !f.completed).length || 0,
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-sm text-text-muted">{label}</span>
                  <span className="text-sm font-semibold text-text-primary">{value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="glass-card p-6">
            <h3 className="font-semibold text-text-primary mb-4">Activity</h3>
            <div className="relative">
              <div className="absolute left-3.5 top-0 bottom-0 w-px bg-border" />
              <div className="flex flex-col gap-4">
                <div className="flex items-start gap-3 relative">
                  <div className="w-7 h-7 rounded-full bg-accent/20 border border-accent/40 flex items-center justify-center flex-shrink-0 z-10">
                    <Plus size={12} className="text-accent" />
                  </div>
                  <div className="pt-0.5">
                    <p className="text-xs font-medium text-text-primary">Lead created</p>
                    <p className="text-xs text-text-faint">{formatDateTime(lead.createdAt)}</p>
                  </div>
                </div>

                {(lead.notes || []).slice(-3).map((note) => (
                  <div key={note._id} className="flex items-start gap-3 relative">
                    <div className="w-7 h-7 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center flex-shrink-0 z-10">
                      <MessageSquare size={11} className="text-blue-400" />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-xs font-medium text-text-primary">Note added</p>
                      <p className="text-xs text-text-faint line-clamp-1">{note.content}</p>
                      <p className="text-xs text-text-faint">{formatRelativeTime(note.createdAt)}</p>
                    </div>
                  </div>
                ))}

                {(lead.followUps || []).slice(-2).map((fu) => (
                  <div key={fu._id} className="flex items-start gap-3 relative">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${fu.completed ? 'bg-green-500/20 border border-green-500/40' : 'bg-purple-500/20 border border-purple-500/40'}`}>
                      <Calendar size={11} className={fu.completed ? 'text-green-400' : 'text-purple-400'} />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-xs font-medium text-text-primary">
                        Follow-up {fu.completed ? 'completed' : 'scheduled'}
                      </p>
                      <p className="text-xs text-text-faint line-clamp-1">{fu.description}</p>
                      <p className="text-xs text-text-faint">{formatDate(fu.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
