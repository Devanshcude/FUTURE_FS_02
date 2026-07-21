import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Download, Eye, Pencil, Trash2, ChevronUp, ChevronDown,
  ChevronsLeft, ChevronLeft, ChevronRight, ChevronsRight, Users,
} from 'lucide-react';
import { leadsAPI } from '../services/api';
import LeadFilters from '../components/leads/LeadFilters';
import StatusBadge from '../components/leads/StatusBadge';
import Modal, { ConfirmModal } from '../components/ui/Modal';
import { SkeletonTable } from '../components/ui/Skeleton';
import {
  formatDate, getPriorityClass,
  getErrorMessage, STATUS_OPTIONS, SOURCE_OPTIONS, PRIORITY_OPTIONS,
} from '../utils/helpers';
import { exportToCSV } from '../utils/csvExport';
import { useDebounce } from '../hooks/useDebounce';
import toast from 'react-hot-toast';

const SORT_FIELDS = ['name', 'email', 'company', 'status', 'source', 'priority', 'createdAt'];

const defaultForm = {
  name: '', email: '', phone: '', company: '', source: 'Website',
  status: 'New', priority: 'Medium', message: '', website: '',
};

function LeadForm({ form, onChange, errors }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-muted">Name <span className="text-accent">*</span></label>
        <input className={`input-field ${errors?.name ? 'input-field-error' : ''}`} value={form.name} onChange={(e) => onChange('name', e.target.value)} placeholder="Full name" />
        {errors?.name && <p className="text-xs text-red-400">{errors.name}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-muted">Email <span className="text-accent">*</span></label>
        <input className={`input-field ${errors?.email ? 'input-field-error' : ''}`} type="email" value={form.email} onChange={(e) => onChange('email', e.target.value)} placeholder="email@example.com" />
        {errors?.email && <p className="text-xs text-red-400">{errors.email}</p>}
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-muted">Phone</label>
        <input className="input-field" value={form.phone} onChange={(e) => onChange('phone', e.target.value)} placeholder="+1 (555) 000-0000" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-muted">Company</label>
        <input className="input-field" value={form.company} onChange={(e) => onChange('company', e.target.value)} placeholder="Company name" />
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-muted">Source</label>
        <select className="input-field appearance-none" value={form.source} onChange={(e) => onChange('source', e.target.value)}>
          {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-muted">Status</label>
        <select className="input-field appearance-none" value={form.status} onChange={(e) => onChange('status', e.target.value)}>
          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-muted">Priority</label>
        <select className="input-field appearance-none" value={form.priority} onChange={(e) => onChange('priority', e.target.value)}>
          {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-muted">Website</label>
        <input className="input-field" value={form.website} onChange={(e) => onChange('website', e.target.value)} placeholder="https://example.com" />
      </div>
      <div className="sm:col-span-2 flex flex-col gap-1.5">
        <label className="text-sm font-medium text-text-muted">Message</label>
        <textarea className="input-field resize-none" rows={3} value={form.message} onChange={(e) => onChange('message', e.target.value)} placeholder="Initial message or notes..." />
      </div>
    </div>
  );
}

function SortIcon({ field, sortBy, sortOrder }) {
  if (sortBy !== field) return <ChevronUp size={12} className="opacity-20" />;
  return sortOrder === 'asc' ? <ChevronUp size={12} className="text-accent" /> : <ChevronDown size={12} className="text-accent" />;
}

export default function LeadList() {
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', status: '', source: '', priority: '', startDate: '', endDate: '' });
  const [sort, setSort] = useState({ sortBy: 'createdAt', sortOrder: 'desc' });
  const [selected, setSelected] = useState([]);

  // Modals
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(null); // lead object
  const [deleteModal, setDeleteModal] = useState(null); // lead id
  const [formData, setFormData] = useState(defaultForm);
  const [formErrors, setFormErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const debouncedSearch = useDebounce(filters.search, 400);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        ...sort,
        ...(debouncedSearch && { search: debouncedSearch }),
        ...(filters.status && { status: filters.status }),
        ...(filters.source && { source: filters.source }),
        ...(filters.priority && { priority: filters.priority }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
      };
      const res = await leadsAPI.getAll(params);
      setLeads(res.data.leads);
      setPagination((p) => ({ ...p, ...res.data.pagination }));
      setSelected([]);
    } catch {
      toast.error('Failed to load leads');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, sort, debouncedSearch, filters.status, filters.source, filters.priority, filters.startDate, filters.endDate]);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  const handleFilterChange = (key, val) => {
    setFilters((f) => ({ ...f, [key]: val }));
    if (key !== 'search') setPagination((p) => ({ ...p, page: 1 }));
  };

  const handleSort = (field) => {
    setSort((s) => ({
      sortBy: field,
      sortOrder: s.sortBy === field && s.sortOrder === 'asc' ? 'desc' : 'asc',
    }));
  };

  const validateForm = () => {
    const errs = {};
    if (!formData.name?.trim()) errs.name = 'Name is required';
    if (!formData.email?.trim()) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) errs.email = 'Invalid email';
    return errs;
  };

  const handleSave = async () => {
    const errs = validateForm();
    if (Object.keys(errs).length > 0) { setFormErrors(errs); return; }
    setFormErrors({});
    setSaving(true);
    try {
      if (editModal) {
        await leadsAPI.update(editModal._id, formData);
        toast.success('Lead updated');
        setEditModal(null);
      } else {
        await leadsAPI.create(formData);
        toast.success('Lead created');
        setAddModal(false);
      }
      setFormData(defaultForm);
      fetchLeads();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await leadsAPI.delete(deleteModal);
      toast.success('Lead deleted');
      setDeleteModal(null);
      fetchLeads();
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await leadsAPI.updateStatus(id, status);
      setLeads((ls) => ls.map((l) => (l._id === id ? { ...l, status } : l)));
      toast.success('Status updated');
    } catch {
      toast.error('Failed to update status');
    }
  };

  const handleExport = async () => {
    try {
      const res = await leadsAPI.getAll({ ...filters, limit: 1000 });
      exportToCSV(res.data.leads);
      toast.success('CSV exported successfully');
    } catch {
      toast.error('Export failed');
    }
  };

  const toggleSelect = (id) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const toggleSelectAll = () =>
    setSelected(selected.length === leads.length ? [] : leads.map((l) => l._id));

  const openEdit = (lead) => {
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || 'Website',
      status: lead.status || 'New',
      priority: lead.priority || 'Medium',
      message: lead.message || '',
      website: lead.website || '',
    });
    setFormErrors({});
    setEditModal(lead);
  };

  const openAdd = () => {
    setFormData(defaultForm);
    setFormErrors({});
    setAddModal(true);
  };

  const Page = ({ n }) => (
    <button
      onClick={() => setPagination((p) => ({ ...p, page: n }))}
      className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
        pagination.page === n
          ? 'bg-accent text-black'
          : 'text-text-muted hover:bg-surface2 hover:text-text-primary'
      }`}
    >
      {n}
    </button>
  );

  const thClass = "px-4 py-3 text-left text-xs font-medium text-text-faint uppercase tracking-wider cursor-pointer hover:text-text-muted select-none";

  return (
    <div className="flex flex-col gap-5 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-text-primary">Leads</h2>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-accent/10 text-accent border border-accent/20">
            {pagination.total}
          </span>
        </div>
        <div className="flex gap-2">
          <button onClick={handleExport} className="btn-secondary text-sm">
            <Download size={15} />
            Export CSV
          </button>
          <button onClick={openAdd} className="btn-primary text-sm">
            <Plus size={15} />
            Add Lead
          </button>
        </div>
      </div>

      {/* Filters */}
      <LeadFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onReset={() => setFilters({ search: '', status: '', source: '', priority: '', startDate: '', endDate: '' })}
      />

      {/* Table */}
      {loading ? (
        <SkeletonTable rows={10} cols={7} />
      ) : leads.length === 0 ? (
        <div className="glass-card flex flex-col items-center justify-center py-20 gap-4">
          <Users size={48} className="text-text-faint" />
          <p className="text-text-muted font-medium">No leads found</p>
          <p className="text-text-faint text-sm">Try adjusting your filters or add a new lead.</p>
          <button onClick={openAdd} className="btn-primary mt-2">
            <Plus size={15} />
            Add Lead
          </button>
        </div>
      ) : (
        <div className="table-container">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-4 py-3 w-10">
                    <input
                      type="checkbox"
                      checked={selected.length === leads.length && leads.length > 0}
                      onChange={toggleSelectAll}
                      className="w-4 h-4 rounded accent-yellow-500"
                    />
                  </th>
                  <th className={thClass} onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1">Name <SortIcon field="name" {...sort} /></div>
                  </th>
                  <th className={`${thClass} hidden md:table-cell`}>Email</th>
                  <th className={`${thClass} hidden lg:table-cell`}>Phone</th>
                  <th className={`${thClass} hidden xl:table-cell`} onClick={() => handleSort('source')}>
                    <div className="flex items-center gap-1">Source <SortIcon field="source" {...sort} /></div>
                  </th>
                  <th className={thClass} onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-1">Status <SortIcon field="status" {...sort} /></div>
                  </th>
                  <th className={`${thClass} hidden sm:table-cell`} onClick={() => handleSort('priority')}>
                    <div className="flex items-center gap-1">Priority <SortIcon field="priority" {...sort} /></div>
                  </th>
                  <th className={`${thClass} hidden lg:table-cell`} onClick={() => handleSort('createdAt')}>
                    <div className="flex items-center gap-1">Created <SortIcon field="createdAt" {...sort} /></div>
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-text-faint uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead._id} className="table-row">
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selected.includes(lead._id)}
                        onChange={() => toggleSelect(lead._id)}
                        className="w-4 h-4 rounded accent-yellow-500"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{lead.name}</p>
                        <p className="text-xs text-text-faint">{lead.company || '—'}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-text-muted truncate max-w-[180px]">{lead.email}</p>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <p className="text-sm text-text-muted">{lead.phone || '—'}</p>
                    </td>
                    <td className="px-4 py-3 hidden xl:table-cell">
                      <span className="text-sm text-text-muted">
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge
                        status={lead.status}
                        editable
                        onStatusChange={(s) => handleStatusChange(lead._id, s)}
                      />
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className={`status-badge ${getPriorityClass(lead.priority)}`}>
                        {lead.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-xs text-text-faint">{formatDate(lead.createdAt)}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/leads/${lead._id}`)}
                          className="p-1.5 rounded-lg text-text-faint hover:text-accent hover:bg-accent/10 transition-colors"
                          title="View details"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => openEdit(lead)}
                          className="p-1.5 rounded-lg text-text-faint hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                          title="Edit lead"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteModal(lead._id)}
                          className="p-1.5 rounded-lg text-text-faint hover:text-red-400 hover:bg-red-400/10 transition-colors"
                          title="Delete lead"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-border flex-wrap gap-3">
            <div className="flex items-center gap-2 text-sm text-text-faint">
              <span>Rows:</span>
              <select
                value={pagination.limit}
                onChange={(e) => setPagination((p) => ({ ...p, limit: Number(e.target.value), page: 1 }))}
                className="bg-surface2 border border-border rounded-lg px-2 py-1 text-text-muted text-xs"
              >
                {[10, 25, 50].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>
                {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPagination((p) => ({ ...p, page: 1 }))}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg text-text-faint hover:text-text-primary hover:bg-surface2 disabled:opacity-30 transition-colors"
              >
                <ChevronsLeft size={15} />
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg text-text-faint hover:text-text-primary hover:bg-surface2 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={15} />
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(pagination.page - 2, pagination.totalPages - 4));
                return start + i;
              }).map((n) => <Page key={n} n={n} />)}
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded-lg text-text-faint hover:text-text-primary hover:bg-surface2 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={15} />
              </button>
              <button
                onClick={() => setPagination((p) => ({ ...p, page: p.totalPages }))}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded-lg text-text-faint hover:text-text-primary hover:bg-surface2 disabled:opacity-30 transition-colors"
              >
                <ChevronsRight size={15} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Lead Modal */}
      <Modal
        isOpen={addModal}
        onClose={() => setAddModal(false)}
        title="Add New Lead"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setAddModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Create Lead'}
            </button>
          </>
        }
      >
        <LeadForm form={formData} onChange={(k, v) => setFormData((f) => ({ ...f, [k]: v }))} errors={formErrors} />
      </Modal>

      {/* Edit Lead Modal */}
      <Modal
        isOpen={!!editModal}
        onClose={() => setEditModal(null)}
        title="Edit Lead"
        size="lg"
        footer={
          <>
            <button className="btn-secondary" onClick={() => setEditModal(null)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </>
        }
      >
        <LeadForm form={formData} onChange={(k, v) => setFormData((f) => ({ ...f, [k]: v }))} errors={formErrors} />
      </Modal>

      {/* Delete Confirm Modal */}
      <ConfirmModal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        onConfirm={handleDelete}
        loading={deleting}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
        confirmLabel="Delete Lead"
      />
    </div>
  );
}
