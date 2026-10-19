import React, { useState, useEffect, useCallback } from 'react';
import { Briefcase, Plus, Edit2, Trash2, CheckCircle, AlertCircle, ToggleLeft, ToggleRight } from 'lucide-react';
import { adminService } from '../../services/adminService';
import {
  AdminPageHeader,
  AdminSearchBar,
  AdminPagination,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminLoadingRows
} from '../../components/admin/AdminComponents';

export default function AdminJobCategories() {
  const [jobCategories, setJobCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState(null);
  const [deletingCat, setDeletingCat] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentCategory: '',
    isActive: true
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchJobCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getJobCategories({ search, page, limit: 15 });
      setJobCategories(res.data || []);
      setPagination({
        total: res.total || 0,
        totalPages: res.totalPages || 1,
        limit: res.limit || 15
      });
    } catch (err) {
      console.error('Error fetching job categories:', err);
      showNotification(err.response?.data?.message || 'Failed to load job categories', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    fetchJobCategories();
  }, [fetchJobCategories]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingCat(null);
    setFormData({ name: '', description: '', parentCategory: '', isActive: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (c) => {
    setEditingCat(c);
    setFormData({
      name: c.name || '',
      description: c.description || '',
      parentCategory: c.parentCategory?._id || c.parentCategory || '',
      isActive: c.isActive !== false
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
        parentCategory: formData.parentCategory || null,
        isActive: formData.isActive
      };

      if (editingCat) {
        await adminService.updateJobCategory(editingCat._id, payload);
        showNotification('Job category updated successfully');
      } else {
        await adminService.createJobCategory(payload);
        showNotification('Job category created successfully');
      }
      setModalOpen(false);
      fetchJobCategories();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save job category', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleActive = async (c) => {
    try {
      await adminService.updateJobCategory(c._id, { isActive: !c.isActive });
      showNotification(`Job category marked as ${!c.isActive ? 'Active' : 'Inactive'}`);
      fetchJobCategories();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to toggle status', 'error');
    }
  };

  const handleDelete = async () => {
    if (!deletingCat) return;
    try {
      setActionLoading(true);
      await adminService.deleteJobCategory(deletingCat._id);
      showNotification('Job category deleted successfully');
      setDeletingCat(null);
      fetchJobCategories();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete job category', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Job Categories"
        description={`Standard industry domains and role families for job matching and market salary benchmarking (${pagination.total} total)`}
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Job Category
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
        placeholder="Search job categories..."
      />

      {/* Job Categories Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Category Name</th>
                <th className="px-4 py-3.5">Parent Category</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <AdminLoadingRows cols={4} rows={6} />
              ) : jobCategories.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <AdminEmptyState
                      title="No job categories found"
                      description="Create a category to group jobs and roles."
                      action={
                        <button
                          onClick={handleOpenCreate}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer"
                        >
                          Add Job Category
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                jobCategories.map((c) => (
                  <tr key={c._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">{c.name}</div>
                      {c.description && (
                        <div className="text-xs text-slate-400 line-clamp-1">{c.description}</div>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      {c.parentCategory?.name || 'Top-level'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleActive(c)}
                        className="flex items-center gap-1.5 text-xs font-semibold cursor-pointer"
                      >
                        {c.isActive ? (
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
                          onClick={() => handleOpenEdit(c)}
                          title="Edit category"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingCat(c)}
                          title="Delete category"
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

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <form
            onSubmit={handleSave}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-slate-900 dark:text-white">
              {editingCat ? 'Edit Job Category' : 'Create Job Category'}
            </h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Category Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Software Engineering, Product Management"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Parent Category (Optional)</label>
                <select
                  value={formData.parentCategory}
                  onChange={(e) => setFormData({ ...formData, parentCategory: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="">None (Top-Level Category)</option>
                  {jobCategories
                    .filter((c) => !editingCat || c._id !== editingCat._id)
                    .map((c) => (
                      <option key={c._id} value={c._id}>
                        {c.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Brief description of this job category..."
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
                <span className="text-slate-700 dark:text-slate-300 font-semibold">Active Category</span>
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
                {actionLoading ? 'Saving...' : 'Save Category'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={Boolean(deletingCat)}
        title="Delete Job Category"
        message="Are you sure you want to delete this job category?"
        confirmLabel="Delete Category"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDelete}
        onCancel={() => setDeletingCat(null)}
      />
    </div>
  );
}
