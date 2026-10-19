import React, { useState, useEffect, useCallback } from 'react';
import { Flag, Eye, CheckCircle, AlertCircle, Trash2, Edit2, MessageSquare } from 'lucide-react';
import { adminService } from '../../services/adminService';
import {
  AdminPageHeader,
  AdminSearchBar,
  AdminPagination,
  AdminConfirmDialog,
  AdminEmptyState,
  AdminLoadingRows,
  StatusBadge
} from '../../components/admin/AdminComponents';

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });

  const [viewingReport, setViewingReport] = useState(null);
  const [editingReport, setEditingReport] = useState(null);
  const [deletingReport, setDeletingReport] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getReports({
        search,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        page,
        limit: 15
      });
      setReports(res.data || []);
      setPagination({
        total: res.total || 0,
        totalPages: res.totalPages || 1,
        limit: res.limit || 15
      });
    } catch (err) {
      console.error('Error fetching reports:', err);
      showNotification(err.response?.data?.message || 'Failed to load reports', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, priorityFilter, page]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateReport = async (e) => {
    e.preventDefault();
    if (!editingReport) return;
    try {
      setActionLoading(true);
      await adminService.updateReport(editingReport._id, {
        status: editingReport.status,
        priority: editingReport.priority,
        adminNotes: editingReport.adminNotes,
        resolutionDetails: editingReport.resolutionDetails
      });
      showNotification('Report status updated successfully');
      setEditingReport(null);
      fetchReports();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update report', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteReport = async () => {
    if (!deletingReport) return;
    try {
      setActionLoading(true);
      await adminService.deleteReport(deletingReport._id);
      showNotification('Report deleted successfully');
      setDeletingReport(null);
      fetchReports();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete report', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Reports & Feedback"
        description={`Manage user-reported AI discrepancies, issue tickets, and feedback items (${pagination.total} total)`}
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
          placeholder="Search reports or submitter..."
        />

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="open">Open</option>
            <option value="investigating">Investigating</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => {
              setPriorityFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      {/* Reports Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Report / Issue</th>
                <th className="px-4 py-3.5">Submitter</th>
                <th className="px-4 py-3.5">Priority</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Date</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <AdminLoadingRows cols={6} rows={8} />
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState
                      title="No reports found"
                      description="There are currently no tickets matching your filter criteria."
                    />
                  </td>
                </tr>
              ) : (
                reports.map((r) => (
                  <tr key={r._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 max-w-sm">
                      <div className="font-bold text-slate-900 dark:text-white truncate">
                        {r.subject || r.type?.replace('_', ' ')}
                      </div>
                      <div className="text-xs text-slate-400 line-clamp-1">{r.description}</div>
                    </td>
                    <td className="px-4 py-3.5 text-xs">
                      <div className="font-semibold text-slate-700 dark:text-slate-300">
                        {r.userId?.name || 'Anonymous'}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate max-w-[150px]">
                        {r.userId?.email || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={r.priority || 'medium'} />
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={r.status || 'open'} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingReport(r)}
                          title="View report"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingReport({ ...r })}
                          title="Update status"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingReport(r)}
                          title="Delete report"
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

      {/* View Detail Modal */}
      {viewingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingReport(null)} />
          <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-slate-900 dark:text-white">Ticket Details</h3>
              <div className="flex items-center gap-2">
                <StatusBadge status={viewingReport.priority || 'medium'} />
                <StatusBadge status={viewingReport.status || 'open'} />
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-semibold">Submitter</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {viewingReport.userId?.name} ({viewingReport.userId?.email})
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Subject</span>
                <p className="font-bold text-slate-900 dark:text-white">
                  {viewingReport.subject || viewingReport.type}
                </p>
              </div>

              <div>
                <span className="text-slate-400 font-semibold block mb-1">Description</span>
                <p className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {viewingReport.description}
                </p>
              </div>

              {viewingReport.adminNotes && (
                <div>
                  <span className="text-slate-400 font-semibold block mb-1">Internal Admin Notes</span>
                  <p className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border border-amber-200/50 dark:border-amber-900/40">
                    {viewingReport.adminNotes}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingReport(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit / Resolve Modal */}
      {editingReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingReport(null)} />
          <form
            onSubmit={handleUpdateReport}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-slate-900 dark:text-white">Update Report Status</h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Status</label>
                  <select
                    value={editingReport.status}
                    onChange={(e) => setEditingReport({ ...editingReport, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="open">Open</option>
                    <option value="investigating">Investigating</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Priority</label>
                  <select
                    value={editingReport.priority}
                    onChange={(e) => setEditingReport({ ...editingReport, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Internal Admin Notes</label>
                <textarea
                  rows={3}
                  value={editingReport.adminNotes || ''}
                  onChange={(e) => setEditingReport({ ...editingReport, adminNotes: e.target.value })}
                  placeholder="Notes on investigation or root cause..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Resolution Details (Sent to user)</label>
                <textarea
                  rows={2}
                  value={editingReport.resolutionDetails || ''}
                  onChange={(e) => setEditingReport({ ...editingReport, resolutionDetails: e.target.value })}
                  placeholder="Summary of fix or explanation..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingReport(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? 'Updating...' : 'Update Report'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Delete Confirmation */}
      <AdminConfirmDialog
        isOpen={Boolean(deletingReport)}
        title="Delete Report"
        message="Are you sure you want to permanently delete this report from the system?"
        confirmLabel="Delete"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDeleteReport}
        onCancel={() => setDeletingReport(null)}
      />
    </div>
  );
}
