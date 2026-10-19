import React, { useState, useEffect, useCallback } from 'react';
import { FileEdit, Plus, Edit2, Trash2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight, Layout } from 'lucide-react';
import { adminService } from '../../services/adminService';
import {
  AdminPageHeader,
  AdminSearchBar,
  AdminPagination,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminLoadingRows
} from '../../components/admin/AdminComponents';

const TEMPLATE_LAYOUTS = [
  { value: 'single_column', label: 'Single Column (ATS Classic)' },
  { value: 'two_column', label: 'Two Column (Modern Split)' },
  { value: 'modern', label: 'Modern Minimalist' },
  { value: 'executive', label: 'Executive Leadership' },
  { value: 'timeline', label: 'Timeline Chronological' }
];

export default function AdminResumeTemplates() {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 12 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [deletingTemplate, setDeletingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    layout: 'single_column',
    previewImageUrl: '',
    tags: '',
    primaryColor: '#0ea5e9',
    isActive: true
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchTemplates = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getTemplates({ search, page, limit: 12 });
      setTemplates(res.data || []);
      setPagination({
        total: res.total || 0,
        totalPages: res.totalPages || 1,
        limit: res.limit || 12
      });
    } catch (err) {
      console.error('Error fetching resume templates:', err);
      showNotification(err.response?.data?.message || 'Failed to load templates', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingTemplate(null);
    setFormData({
      name: '',
      description: '',
      layout: 'single_column',
      previewImageUrl: '',
      tags: '',
      primaryColor: '#0ea5e9',
      isActive: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (t) => {
    setEditingTemplate(t);
    setFormData({
      name: t.name || '',
      description: t.description || '',
      layout: t.layout || 'single_column',
      previewImageUrl: t.previewImageUrl || '',
      tags: Array.isArray(t.tags) ? t.tags.join(', ') : '',
      primaryColor: t.style?.primaryColor || '#0ea5e9',
      isActive: t.isActive !== false
    });
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        layout: formData.layout,
        previewImageUrl: formData.previewImageUrl.trim(),
        tags: formData.tags
          ? formData.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
        style: {
          primaryColor: formData.primaryColor,
          fontFamily: 'Inter',
          fontSize: 'medium'
        },
        isActive: formData.isActive
      };

      if (editingTemplate) {
        await adminService.updateTemplate(editingTemplate._id, payload);
        showNotification('Template updated successfully');
      } else {
        await adminService.createTemplate(payload);
        showNotification('Template created successfully');
      }
      setModalOpen(false);
      fetchTemplates();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save template', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (t) => {
    try {
      await adminService.updateTemplate(t._id, { isActive: !t.isActive });
      showNotification(`Template marked as ${!t.isActive ? 'Active' : 'Inactive'}`);
      fetchTemplates();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to toggle status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingTemplate) return;
    try {
      setActionLoading(true);
      await adminService.deleteTemplate(deletingTemplate._id);
      showNotification('Template deleted successfully');
      setDeletingTemplate(null);
      fetchTemplates();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete template', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Resume Templates"
        description={`Configure typography, layouts, visual palettes, and template availability for the Resume Builder (${pagination.total} total)`}
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Template
          </button>
        }
      />

      {notification && (
        <div
          className={`p-4 rounded-xl flex items-center gap-3 text-sm animate-in fade-in duration-150 ${
            notification.type === 'error'
              ? 'bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300'
              : 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300'
          }`}
        >
          {notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 shrink-0" />
          )}
          <span>{notification.msg}</span>
        </div>
      )}

      <AdminSearchBar
        value={search}
        onChange={(val) => {
          setSearch(val);
          setPage(1);
        }}
        placeholder="Search resume templates..."
      />

      {/* Templates Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
          ))}
        </div>
      ) : templates.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 p-8">
          <AdminEmptyState
            title="No resume templates found"
            description="Add your first resume builder template design."
            action={
              <button
                onClick={handleOpenCreate}
                className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer"
              >
                Add Template
              </button>
            }
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {templates.map((t) => (
            <div
              key={t._id}
              className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm flex flex-col justify-between"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-4 h-4 rounded-full border border-slate-300 shadow-sm"
                      style={{ backgroundColor: t.style?.primaryColor || '#0ea5e9' }}
                    />
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white">{t.name}</h3>
                  </div>
                  <button
                    onClick={() => handleToggleActive(t)}
                    className="text-xs font-semibold cursor-pointer"
                  >
                    {t.isActive ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <ToggleRight className="w-5 h-5 text-emerald-500" /> Active
                      </span>
                    ) : (
                      <span className="text-slate-400 flex items-center gap-1">
                        <ToggleLeft className="w-5 h-5 text-slate-400" /> Inactive
                      </span>
                    )}
                  </button>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                  {t.description || 'Modern ATS-friendly resume template tailored for industry standards.'}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold capitalize">
                    {t.layout?.replace('_', ' ')}
                  </span>
                  {t.tags?.map((tag, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] px-1.5 py-0.5 rounded bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-cyan-400 font-mono"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">Used {t.usageCount || 0} times</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenEdit(t)}
                    className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 cursor-pointer"
                    title="Edit template"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeletingTemplate(t)}
                    className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                    title="Delete template"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <form
            onSubmit={handleSave}
            className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-slate-900 dark:text-white">
              {editingTemplate ? 'Edit Resume Template' : 'Create Resume Template'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Template Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Modern Tech Minimalist"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Layout Style *</label>
                  <select
                    value={formData.layout}
                    onChange={(e) => setFormData({ ...formData, layout: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    {TEMPLATE_LAYOUTS.map((l) => (
                      <option key={l.value} value={l.value}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Accent Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={formData.primaryColor}
                      onChange={(e) => setFormData({ ...formData, primaryColor: e.target.value })}
                      className="w-full px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-mono uppercase"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Preview Image URL (Optional)</label>
                <input
                  type="url"
                  value={formData.previewImageUrl}
                  onChange={(e) => setFormData({ ...formData, previewImageUrl: e.target.value })}
                  placeholder="https://cloudinary.com/..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g. ATS, Engineering, Clean, Two-Column"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of the template styling and best target audience..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="rounded text-sky-600 focus:ring-sky-500"
                />
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Active Template</span>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? 'Saving...' : 'Save Template'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={Boolean(deletingTemplate)}
        title="Delete Resume Template"
        message="Are you sure you want to delete this template from the platform? Existing resumes created with it will preserve their layout data."
        confirmLabel="Delete Template"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingTemplate(null)}
      />
    </div>
  );
}
