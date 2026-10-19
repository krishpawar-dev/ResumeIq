import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  Kanban,
  List,
  Calendar,
  Clock,
  ExternalLink,
  MapPin,
  Building2,
  FileText,
  Trash2,
  Edit3,
  X,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  DollarSign,
  User,
  Mail,
  Loader2
} from 'lucide-react';
import { applicationService } from '../services/applicationService';
import { resumeService } from '../services/resumeService';

const STATUSES = ['Applied', 'Screening', 'Interview', 'Technical', 'HR', 'Offer', 'Rejected'];

const STATUS_COLORS = {
  Applied: {
    bg: 'bg-sky-50 dark:bg-sky-950/40',
    text: 'text-sky-700 dark:text-cyan-400',
    border: 'border-sky-200 dark:border-sky-800/60',
    pill: 'bg-sky-500'
  },
  Screening: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/40',
    text: 'text-indigo-700 dark:text-indigo-400',
    border: 'border-indigo-200 dark:border-indigo-800/60',
    pill: 'bg-indigo-500'
  },
  Interview: {
    bg: 'bg-amber-50 dark:bg-amber-950/40',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-200 dark:border-amber-800/60',
    pill: 'bg-amber-500'
  },
  Technical: {
    bg: 'bg-cyan-50 dark:bg-cyan-950/40',
    text: 'text-cyan-700 dark:text-cyan-400',
    border: 'border-cyan-200 dark:border-cyan-800/60',
    pill: 'bg-cyan-500'
  },
  HR: {
    bg: 'bg-teal-50 dark:bg-teal-950/40',
    text: 'text-teal-700 dark:text-teal-400',
    border: 'border-teal-200 dark:border-teal-800/60',
    pill: 'bg-teal-500'
  },
  Offer: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/40',
    text: 'text-emerald-700 dark:text-emerald-400',
    border: 'border-emerald-200 dark:border-emerald-800/60',
    pill: 'bg-emerald-500'
  },
  Rejected: {
    bg: 'bg-slate-100 dark:bg-slate-800/80',
    text: 'text-slate-600 dark:text-slate-400',
    border: 'border-slate-200 dark:border-slate-700',
    pill: 'bg-slate-400'
  }
};

export default function Applications() {
  const [applications, setApplications] = useState([]);
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('All');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState(null); // null = new, obj = edit/view
  const [isSaving, setIsSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  // Form Fields
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    jobUrl: '',
    resumeId: '',
    status: 'Applied',
    appliedAt: new Date().toISOString().split('T')[0],
    nextActionDate: '',
    notes: '',
    salaryRange: '',
    contactName: '',
    contactEmail: '',
    source: ''
  });

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [appsRes, resumesRes] = await Promise.all([
        applicationService.getApplications().catch(() => ({ data: { applications: [] } })),
        resumeService.getResumes().catch(() => ({ resumes: [] }))
      ]);

      setApplications(appsRes.data?.applications || []);
      setResumes(resumesRes.resumes || []);
    } catch (err) {
      console.error('[Load Applications Error]', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setSelectedApplication(null);
    setFormData({
      company: '',
      role: '',
      location: '',
      jobUrl: '',
      resumeId: resumes[0]?._id || '',
      status: 'Applied',
      appliedAt: new Date().toISOString().split('T')[0],
      nextActionDate: '',
      notes: '',
      salaryRange: '',
      contactName: '',
      contactEmail: '',
      source: ''
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const openEditModal = (app) => {
    setSelectedApplication(app);
    setFormData({
      company: app.company || '',
      role: app.role || '',
      location: app.location || '',
      jobUrl: app.jobUrl || '',
      resumeId: app.resumeId?._id || app.resumeId || '',
      status: app.status || 'Applied',
      appliedAt: app.appliedAt ? new Date(app.appliedAt).toISOString().split('T')[0] : '',
      nextActionDate: app.nextActionDate ? new Date(app.nextActionDate).toISOString().split('T')[0] : '',
      notes: app.notes || '',
      salaryRange: app.salaryRange || '',
      contactName: app.contactName || '',
      contactEmail: app.contactEmail || '',
      source: app.source || ''
    });
    setModalError('');
    setIsModalOpen(true);
  };

  const handleSaveApplication = async (e) => {
    e.preventDefault();
    if (!formData.company.trim() || !formData.role.trim() || isSaving) return;

    try {
      setIsSaving(true);
      setModalError('');

      const payload = {
        ...formData,
        resumeId: formData.resumeId || undefined,
        appliedAt: formData.appliedAt || undefined,
        nextActionDate: formData.nextActionDate || undefined
      };

      if (selectedApplication?._id) {
        const res = await applicationService.updateApplication(selectedApplication._id, payload);
        setApplications((prev) =>
          prev.map((a) => (a._id === selectedApplication._id ? res.data.application : a))
        );
      } else {
        const res = await applicationService.createApplication(payload);
        setApplications((prev) => [res.data.application, ...prev]);
      }

      setIsModalOpen(false);
    } catch (err) {
      console.error('[Save Application Error]', err);
      setModalError(err.response?.data?.message || 'Failed to save application.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id, e) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this job application?')) return;

    try {
      await applicationService.deleteApplication(id);
      setApplications((prev) => prev.filter((a) => a._id !== id));
      if (selectedApplication?._id === id) {
        setIsModalOpen(false);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete application.');
    }
  };

  const handleStatusChange = async (appId, newStatus, e) => {
    if (e) e.stopPropagation();
    try {
      setApplications((prev) =>
        prev.map((a) => (a._id === appId ? { ...a, status: newStatus } : a))
      );
      await applicationService.updateApplication(appId, { status: newStatus });
    } catch (err) {
      console.error('[Change Status Error]', err);
      loadData();
    }
  };

  // Filtered applications
  const filteredApplications = applications.filter((app) => {
    const matchesStatus =
      selectedStatusFilter === 'All' || app.status === selectedStatusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      app.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.location && app.location.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-mono tracking-wider font-semibold text-sky-600 dark:text-cyan-400">
              Pipeline Management
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2.5">
            <Briefcase className="w-7 h-7 text-sky-500" />
            <span>Application Tracker</span>
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Track your job applications in one place and see where every opportunity stands across your pipeline.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={openCreateModal}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs sm:text-sm font-semibold shadow-md shadow-sky-600/20 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      </div>

      {/* Control Bar: Search, Status Filter & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-3 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex flex-1 items-center gap-2">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter by company, role, location..."
              className="w-full pl-9 pr-4 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="All">All Statuses ({applications.length})</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {st} ({applications.filter((a) => a.status === st).length})
              </option>
            ))}
          </select>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
          <button
            type="button"
            onClick={() => setViewMode('kanban')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'kanban'
                ? 'bg-white dark:bg-[#0f172a] text-sky-700 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Kanban</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
              viewMode === 'list'
                ? 'bg-white dark:bg-[#0f172a] text-sky-700 dark:text-cyan-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">List</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div className="py-24 flex flex-col items-center justify-center text-slate-400">
          <Loader2 className="w-10 h-10 animate-spin text-sky-500 mb-3" />
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
            Loading your applications pipeline...
          </p>
        </div>
      ) : applications.length === 0 ? (
        /* Empty State */
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center mx-auto mb-2">
            <Briefcase className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            No applications yet.
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Track your job applications in one place and see where every opportunity stands.
          </p>
          <button
            onClick={openCreateModal}
            className="mt-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add Application</span>
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* KANBAN VIEW (Horizontally scrollable on desktop, stacked on mobile) */
        <div className="flex gap-4 overflow-x-auto pb-4 select-none min-h-[500px]">
          {STATUSES.map((status) => {
            const statusApps = filteredApplications.filter((a) => a.status === status);
            const style = STATUS_COLORS[status] || STATUS_COLORS.Applied;

            return (
              <div
                key={status}
                className="w-72 sm:w-80 shrink-0 bg-slate-100/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800/80 p-3.5 flex flex-col"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${style.pill}`} />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {status}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {statusApps.length}
                  </span>
                </div>

                {/* Application Cards Container */}
                <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                  {statusApps.map((app) => (
                    <div
                      key={app._id}
                      onClick={() => openEditModal(app)}
                      className="bg-white dark:bg-[#0f172a] rounded-xl border border-slate-200 dark:border-slate-800 p-4 shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-sky-700 transition-all cursor-pointer space-y-2.5 group"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                            {app.company}
                          </h4>
                          <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                            {app.role}
                          </h3>
                        </div>

                        <select
                          value={app.status}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => handleStatusChange(app._id, e.target.value, e)}
                          className="text-[10px] font-semibold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        >
                          {STATUSES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>

                      {app.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                          <MapPin className="w-3 h-3 text-slate-400" />
                          <span>{app.location}</span>
                        </div>
                      )}

                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>
                            {new Date(app.appliedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        </div>

                        {app.nextActionDate && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                            Next: {new Date(app.nextActionDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 uppercase font-mono">
                <tr>
                  <th className="py-3.5 px-4 font-semibold">Company & Role</th>
                  <th className="py-3.5 px-4 font-semibold">Status</th>
                  <th className="py-3.5 px-4 font-semibold">Location</th>
                  <th className="py-3.5 px-4 font-semibold">Applied Date</th>
                  <th className="py-3.5 px-4 font-semibold">Next Action</th>
                  <th className="py-3.5 px-4 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredApplications.map((app) => {
                  const style = STATUS_COLORS[app.status] || STATUS_COLORS.Applied;
                  return (
                    <tr
                      key={app._id}
                      onClick={() => openEditModal(app)}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 cursor-pointer transition-colors"
                    >
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {app.role}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400">
                          {app.company}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className={`px-2.5 py-1 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${style.bg} ${style.text} ${style.border}`}>
                          {app.status}
                        </span>
                      </td>

                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">
                        {app.location || '—'}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-500 dark:text-slate-400">
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4">
                        {app.nextActionDate ? (
                          <span className="font-mono text-amber-600 dark:text-amber-400 font-semibold">
                            {new Date(app.nextActionDate).toLocaleDateString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={(e) => handleDelete(app._id, e)}
                          className="p-1.5 text-slate-400 hover:text-rose-500 rounded transition-colors"
                          title="Delete application"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE & EDIT APPLICATION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center font-bold">
                  <Briefcase className="w-4 h-4" />
                </div>
                <h2 className="text-base font-bold text-slate-900 dark:text-white">
                  {selectedApplication ? 'Application Details' : 'Add New Application'}
                </h2>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSaveApplication} className="flex-1 overflow-y-auto p-6 space-y-4">
              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{modalError}</span>
                </div>
              )}

              {/* Company & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g., Stripe, Google, Acme Corp"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Role Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g., Senior Full Stack Engineer"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Status & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Pipeline Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {STATUSES.map((st) => (
                      <option key={st} value={st}>{st}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Location
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., Remote / San Francisco, CA"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Job URL & Salary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Job Posting URL
                  </label>
                  <input
                    type="url"
                    value={formData.jobUrl}
                    onChange={(e) => setFormData({ ...formData, jobUrl: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Salary Range (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.salaryRange}
                    onChange={(e) => setFormData({ ...formData, salaryRange: e.target.value })}
                    placeholder="e.g., $160k - $185k + Equity"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              {/* Dates & Resume Used */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Applied Date
                  </label>
                  <input
                    type="date"
                    value={formData.appliedAt}
                    onChange={(e) => setFormData({ ...formData, appliedAt: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Next Action Date
                  </label>
                  <input
                    type="date"
                    value={formData.nextActionDate}
                    onChange={(e) => setFormData({ ...formData, nextActionDate: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                    Resume Used
                  </label>
                  <select
                    value={formData.resumeId}
                    onChange={(e) => setFormData({ ...formData, resumeId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">None selected</option>
                    {resumes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.title || r.fileName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Private Notes */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400 mb-1.5">
                  Private Application Notes
                </label>
                <textarea
                  rows={3}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Private notes about interview stages, interviewers, recruiter responses, follow-up items..."
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />
              </div>
            </form>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              {selectedApplication?._id ? (
                <button
                  type="button"
                  onClick={() => handleDelete(selectedApplication._id)}
                  className="text-xs text-rose-500 hover:text-rose-600 font-semibold flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Application</span>
                </button>
              ) : <div />}

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSaveApplication}
                  disabled={isSaving}
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-cyan-600 hover:from-sky-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-md shadow-sky-600/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{selectedApplication ? 'Save Changes' : 'Create Application'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
