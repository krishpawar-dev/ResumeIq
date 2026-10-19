import React, { useState, useEffect, useCallback } from 'react';
import { Database, Plus, Edit2, Trash2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import {
  AdminPageHeader,
  AdminSearchBar,
  AdminPagination,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminLoadingRows
} from '../../components/admin/AdminComponents';

const SKILL_CATEGORIES = [
  { value: 'programming_language', label: 'Programming Language' },
  { value: 'framework', label: 'Framework / Library' },
  { value: 'database', label: 'Database' },
  { value: 'cloud', label: 'Cloud Services' },
  { value: 'devops', label: 'DevOps & CI/CD' },
  { value: 'tool', label: 'Tool / Utility' },
  { value: 'soft_skill', label: 'Soft Skill' },
  { value: 'methodology', label: 'Methodology' },
  { value: 'other', label: 'Other' }
];

export default function AdminSkills() {
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState(null);
  const [deletingSkill, setDeletingSkill] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'programming_language',
    subCategory: '',
    aliases: '',
    description: '',
    isActive: true
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchSkills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getSkills({
        search,
        category: categoryFilter || undefined,
        page,
        limit: 15
      });
      setSkills(res.data || []);
      setPagination({
        total: res.total || 0,
        totalPages: res.totalPages || 1,
        limit: res.limit || 15
      });
    } catch (err) {
      console.error('Error fetching skills:', err);
      showNotification(err.response?.data?.message || 'Failed to load skills', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, page]);

  useEffect(() => {
    fetchSkills();
  }, [fetchSkills]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingSkill(null);
    setFormData({
      name: '',
      category: 'programming_language',
      subCategory: '',
      aliases: '',
      description: '',
      isActive: true
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingSkill(s);
    setFormData({
      name: s.name || '',
      category: s.category || 'programming_language',
      subCategory: s.subCategory || '',
      aliases: Array.isArray(s.aliases) ? s.aliases.join(', ') : '',
      description: s.description || '',
      isActive: s.isActive !== false
    });
    setModalOpen(true);
  };

  const handleSaveSkill = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        name: formData.name.trim(),
        category: formData.category,
        subCategory: formData.subCategory.trim(),
        description: formData.description.trim(),
        isActive: formData.isActive,
        aliases: formData.aliases
          ? formData.aliases.split(',').map((a) => a.trim()).filter(Boolean)
          : []
      };

      if (editingSkill) {
        await adminService.updateSkill(editingSkill._id, payload);
        showNotification('Skill updated successfully');
      } else {
        await adminService.createSkill(payload);
        showNotification('Skill created successfully');
      }
      setModalOpen(false);
      fetchSkills();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save skill', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (s) => {
    try {
      await adminService.updateSkill(s._id, { isActive: !s.isActive });
      showNotification(`Skill marked as ${!s.isActive ? 'Active' : 'Inactive'}`);
      fetchSkills();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to toggle status', 'error');
    }
  };

  const handleDeleteSkill = async () => {
    if (!deletingSkill) return;
    try {
      setActionLoading(true);
      await adminService.deleteSkill(deletingSkill._id);
      showNotification('Skill deleted successfully');
      setDeletingSkill(null);
      fetchSkills();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete skill', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Skill Database"
        description={`Standardized ontology used for ATS scoring, job matching, and career path discovery (${pagination.total} total)`}
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Skill
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

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <AdminSearchBar
          value={search}
          onChange={(val) => {
            setSearch(val);
            setPage(1);
          }}
          placeholder="Search skill name or alias..."
        />

        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none w-full sm:w-auto"
        >
          <option value="">All Categories</option>
          {SKILL_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Skills Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Skill Name</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Aliases</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <AdminLoadingRows cols={5} rows={8} />
              ) : skills.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <AdminEmptyState
                      title="No skills found"
                      description="Add a skill or adjust your keyword filters."
                      action={
                        <button
                          onClick={handleOpenCreate}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer"
                        >
                          Add Skill
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                skills.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 font-bold text-slate-900 dark:text-white">
                      {s.name}
                      {s.subCategory && (
                        <span className="ml-2 text-[10px] font-normal text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                          {s.subCategory}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs capitalize text-slate-600 dark:text-slate-300">
                      {s.category.replace('_', ' ')}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {s.aliases?.length > 0 ? s.aliases.join(', ') : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleActive(s)}
                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      >
                        {s.isActive ? (
                          <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                            <ToggleRight className="w-5 h-5 text-emerald-500" /> Active
                          </span>
                        ) : (
                          <span className="text-slate-400 flex items-center gap-1">
                            <ToggleLeft className="w-5 h-5 text-slate-400" /> Inactive
                          </span>
                        )}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenEdit(s)}
                          title="Edit skill"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingSkill(s)}
                          title="Delete skill"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="px-5 pb-4">
          <AdminPagination
            page={page}
            totalPages={pagination.totalPages}
            total={pagination.total}
            limit={pagination.limit}
            onPageChange={setPage}
          />
        </div>
      </div>

      {/* Create / Edit Skill Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <form
            onSubmit={handleSaveSkill}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-slate-900 dark:text-white">
              {editingSkill ? 'Edit Skill' : 'Create Standardized Skill'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Skill Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Kubernetes, Python, React.js"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  {SKILL_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Sub-Category (Optional)</label>
                <input
                  type="text"
                  value={formData.subCategory}
                  onChange={(e) => setFormData({ ...formData, subCategory: e.target.value })}
                  placeholder="e.g. Container Orchestration, Backend, NoSQL"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Aliases (comma-separated)</label>
                <input
                  type="text"
                  value={formData.aliases}
                  onChange={(e) => setFormData({ ...formData, aliases: e.target.value })}
                  placeholder="e.g. k8s, kube, k8"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description..."
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
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Active Skill</span>
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
                {actionLoading ? 'Saving...' : 'Save Skill'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={Boolean(deletingSkill)}
        title="Delete Skill"
        message="Are you sure you want to delete this skill from the platform database? This will remove standard synonym matching for this term."
        confirmLabel="Delete Skill"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDeleteSkill}
        onCancel={() => setDeletingSkill(null)}
      />
    </div>
  );
}
