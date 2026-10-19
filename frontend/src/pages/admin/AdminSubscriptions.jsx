import React, { useState, useEffect, useCallback } from 'react';
import { CreditCard, Eye, CheckCircle, AlertCircle, Edit2, Shield, Calendar } from 'lucide-react';
import { adminService } from '../../services/adminService';
import {
  AdminPageHeader,
  AdminSearchBar,
  AdminPagination,
  AdminEmptyState,
  AdminLoadingRows,
  StatusBadge
} from '../../components/admin/AdminComponents';

export default function AdminSubscriptions() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });

  const [viewingSub, setViewingSub] = useState(null);
  const [editingSub, setEditingSub] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getSubscriptions({
        search,
        plan: planFilter || undefined,
        status: statusFilter || undefined,
        page,
        limit: 15
      });
      setSubscriptions(res.data || []);
      setPagination({
        total: res.total || 0,
        totalPages: res.totalPages || 1,
        limit: res.limit || 15
      });
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
      showNotification(err.response?.data?.message || 'Failed to load subscriptions', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, planFilter, statusFilter, page]);

  useEffect(() => {
    fetchSubscriptions();
  }, [fetchSubscriptions]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleUpdateSubscription = async (e) => {
    e.preventDefault();
    if (!editingSub) return;
    try {
      setActionLoading(true);
      await adminService.updateSubscription(editingSub._id, {
        plan: editingSub.plan,
        status: editingSub.status,
        billingCycle: editingSub.billingCycle
      });
      showNotification('Subscription updated successfully');
      setEditingSub(null);
      fetchSubscriptions();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to update subscription', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Subscription Billing"
        description={`Manage user tiers, billing cycles, active statuses, and entitlements (${pagination.total} total)`}
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
          placeholder="Search by customer name or email..."
        />

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={planFilter}
            onChange={(e) => {
              setPlanFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Plans</option>
            <option value="free">Free Tier</option>
            <option value="pro">Pro Plan</option>
            <option value="enterprise">Enterprise</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past Due</option>
            <option value="cancelled">Cancelled</option>
            <option value="expired">Expired</option>
          </select>
        </div>
      </div>

      {/* Subscriptions Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-4 py-3.5">Plan</th>
                <th className="px-4 py-3.5">Billing Cycle</th>
                <th className="px-4 py-3.5">Status</th>
                <th className="px-4 py-3.5">Next Renewal</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <AdminLoadingRows cols={6} rows={8} />
              ) : subscriptions.length === 0 ? (
                <tr>
                  <td colSpan={6}>
                    <AdminEmptyState
                      title="No subscriptions found"
                      description="There are currently no records matching your criteria."
                    />
                  </td>
                </tr>
              ) : (
                subscriptions.map((s) => (
                  <tr key={s._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {s.userId?.name || 'Customer'}
                      </div>
                      <div className="text-xs text-slate-400">{s.userId?.email || '—'}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {s.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-600 dark:text-slate-400 capitalize">
                      {s.billingCycle || 'monthly'}
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={s.status || 'active'} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400 font-mono">
                      {s.currentPeriodEnd ? new Date(s.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingSub(s)}
                          title="View subscription"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingSub({ ...s })}
                          title="Modify subscription"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
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

      {/* View Modal */}
      {viewingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingSub(null)} />
          <div className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">{viewingSub.userId?.name}</h3>
                <p className="text-xs text-slate-400">{viewingSub.userId?.email}</p>
              </div>
              <StatusBadge status={viewingSub.status || 'active'} />
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-semibold">Tier Plan</span>
                <p className="font-bold uppercase text-slate-900 dark:text-white">{viewingSub.plan}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-semibold">Billing Cycle</span>
                <p className="font-bold capitalize text-slate-900 dark:text-white">{viewingSub.billingCycle || 'monthly'}</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-semibold">Period Start</span>
                <p className="font-mono text-slate-700 dark:text-slate-300">
                  {viewingSub.currentPeriodStart ? new Date(viewingSub.currentPeriodStart).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1">
                <span className="text-slate-400 font-semibold">Period End / Renewal</span>
                <p className="font-mono text-slate-700 dark:text-slate-300">
                  {viewingSub.currentPeriodEnd ? new Date(viewingSub.currentPeriodEnd).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingSub(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setEditingSub(null)} />
          <form
            onSubmit={handleUpdateSubscription}
            className="relative z-10 w-full max-w-md rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 animate-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-slate-900 dark:text-white">Modify User Subscription</h3>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Plan</label>
                <select
                  value={editingSub.plan}
                  onChange={(e) => setEditingSub({ ...editingSub, plan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="free">Free Tier</option>
                  <option value="pro">Pro Plan</option>
                  <option value="enterprise">Enterprise</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Status</label>
                <select
                  value={editingSub.status}
                  onChange={(e) => setEditingSub({ ...editingSub, status: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="active">Active</option>
                  <option value="trialing">Trialing</option>
                  <option value="past_due">Past Due</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Billing Cycle</label>
                <select
                  value={editingSub.billingCycle || 'monthly'}
                  onChange={(e) => setEditingSub({ ...editingSub, billingCycle: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                >
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="lifetime">Lifetime</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={actionLoading}
                className="px-4 py-2 rounded-xl bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90 disabled:opacity-50 cursor-pointer"
              >
                {actionLoading ? 'Saving...' : 'Update Subscription'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
