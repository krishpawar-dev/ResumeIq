import React, { useState, useEffect, useCallback } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  AlertCircle,
  Eye,
  Filter
} from 'lucide-react';
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

export default function AdminQuestions() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 15 });

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [viewingQuestion, setViewingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [formData, setFormData] = useState({
    questionText: '',
    category: 'technical',
    difficulty: 'medium',
    expectedKeywords: '',
    idealAnswerOutline: '',
    sampleAnswer: '',
    targetRoles: ''
  });
  const [actionLoading, setActionLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const fetchQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const res = await adminService.getQuestions({
        search,
        category: categoryFilter || undefined,
        difficulty: difficultyFilter || undefined,
        page,
        limit: 15
      });
      setQuestions(res.data || []);
      setPagination({
        total: res.total || 0,
        totalPages: res.totalPages || 1,
        limit: res.limit || 15
      });
    } catch (err) {
      console.error('Error fetching questions:', err);
      showNotification(err.response?.data?.message || 'Failed to load questions', 'error');
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, difficultyFilter, page]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const showNotification = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleOpenCreate = () => {
    setEditingQuestion(null);
    setFormData({
      questionText: '',
      category: 'technical',
      difficulty: 'medium',
      expectedKeywords: '',
      idealAnswerOutline: '',
      sampleAnswer: '',
      targetRoles: ''
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (q) => {
    setEditingQuestion(q);
    setFormData({
      questionText: q.questionText || '',
      category: q.category || 'technical',
      difficulty: q.difficulty || 'medium',
      expectedKeywords: Array.isArray(q.expectedKeywords) ? q.expectedKeywords.join(', ') : '',
      idealAnswerOutline: q.idealAnswerOutline || '',
      sampleAnswer: q.sampleAnswer || '',
      targetRoles: Array.isArray(q.targetRoles) ? q.targetRoles.join(', ') : ''
    });
    setModalOpen(true);
  };

  const handleSaveQuestion = async (e) => {
    e.preventDefault();
    try {
      setActionLoading(true);
      const payload = {
        questionText: formData.questionText,
        category: formData.category,
        difficulty: formData.difficulty,
        idealAnswerOutline: formData.idealAnswerOutline,
        sampleAnswer: formData.sampleAnswer,
        expectedKeywords: formData.expectedKeywords
          ? formData.expectedKeywords.split(',').map((s) => s.trim()).filter(Boolean)
          : [],
        targetRoles: formData.targetRoles
          ? formData.targetRoles.split(',').map((s) => s.trim()).filter(Boolean)
          : []
      };

      if (editingQuestion) {
        await adminService.updateQuestion(editingQuestion._id, payload);
        showNotification('Question updated successfully');
      } else {
        await adminService.createQuestion(payload);
        showNotification('Question created successfully');
      }
      setModalOpen(false);
      fetchQuestions();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to save question', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteQuestion = async () => {
    if (!deletingQuestion) return;
    try {
      setActionLoading(true);
      await adminService.deleteQuestion(deletingQuestion._id);
      showNotification('Question deleted successfully');
      setDeletingQuestion(null);
      fetchQuestions();
    } catch (err) {
      showNotification(err.response?.data?.message || 'Failed to delete question', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <AdminPageHeader
        title="Interview Question Bank"
        description={`Curate and maintain interview questions, ideal response rubrics, and difficulty tiers (${pagination.total} total)`}
        action={
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 dark:bg-cyan-500 text-white dark:text-slate-950 text-xs font-bold transition hover:opacity-90 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Question
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
          placeholder="Search question text or keywords..."
        />

        <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Categories</option>
            <option value="technical">Technical</option>
            <option value="behavioral">Behavioral</option>
            <option value="situational">Situational</option>
            <option value="project">Project-based</option>
            <option value="hr">HR & Culture</option>
          </select>

          <select
            value={difficultyFilter}
            onChange={(e) => {
              setDifficultyFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="junior">Junior</option>
            <option value="medium">Medium</option>
            <option value="senior">Senior</option>
            <option value="lead">Lead</option>
          </select>
        </div>
      </div>

      {/* Questions Table */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-700/60 bg-white dark:bg-slate-900/60 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-700/60 text-xs font-bold uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3.5">Question</th>
                <th className="px-4 py-3.5">Category</th>
                <th className="px-4 py-3.5">Difficulty</th>
                <th className="px-4 py-3.5">Target Roles</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <AdminLoadingRows cols={5} rows={8} />
              ) : questions.length === 0 ? (
                <tr>
                  <td colSpan={5}>
                    <AdminEmptyState
                      title="No interview questions found"
                      description="Try clearing your filters or create a new question."
                      action={
                        <button
                          onClick={handleOpenCreate}
                          className="px-3 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold cursor-pointer"
                        >
                          Create Question
                        </button>
                      }
                    />
                  </td>
                </tr>
              ) : (
                questions.map((q) => (
                  <tr key={q._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition">
                    <td className="px-5 py-3.5 max-w-md">
                      <div className="font-semibold text-slate-900 dark:text-white line-clamp-2">
                        {q.questionText}
                      </div>
                      {q.expectedKeywords?.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {q.expectedKeywords.slice(0, 3).map((kw, i) => (
                            <span
                              key={i}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono"
                            >
                              {kw}
                            </span>
                          ))}
                          {q.expectedKeywords.length > 3 && (
                            <span className="text-[10px] text-slate-400">
                              +{q.expectedKeywords.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {q.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <StatusBadge status={q.difficulty || 'medium'} />
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-500 dark:text-slate-400">
                      {q.targetRoles?.join(', ') || 'All Roles'}
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewingQuestion(q)}
                          title="View question details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(q)}
                          title="Edit question"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingQuestion(q)}
                          title="Delete question"
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

        {/* Pagination Bar */}
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

      {/* Create / Edit Question Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <form
            onSubmit={handleSaveQuestion}
            className="relative z-10 w-full max-w-2xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150"
          >
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              {editingQuestion ? 'Edit Interview Question' : 'Create Interview Question'}
            </h3>

            <div className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Question Text *</label>
                <textarea
                  rows={3}
                  value={formData.questionText}
                  onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                  placeholder="e.g. Explain how event loops and the microtask queue operate in Javascript."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Category *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="technical">Technical</option>
                    <option value="behavioral">Behavioral</option>
                    <option value="situational">Situational</option>
                    <option value="project">Project-based</option>
                    <option value="hr">HR & Culture</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Difficulty *</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                  >
                    <option value="junior">Junior</option>
                    <option value="medium">Medium</option>
                    <option value="senior">Senior</option>
                    <option value="lead">Lead</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Target Roles (comma-separated)</label>
                <input
                  type="text"
                  value={formData.targetRoles}
                  onChange={(e) => setFormData({ ...formData, targetRoles: e.target.value })}
                  placeholder="e.g. Frontend Engineer, Fullstack Developer, React Specialist"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Expected Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={formData.expectedKeywords}
                  onChange={(e) => setFormData({ ...formData, expectedKeywords: e.target.value })}
                  placeholder="e.g. Call Stack, Task Queue, Promise, setTimeout, V8"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Ideal Answer Outline / Evaluation Rubric</label>
                <textarea
                  rows={3}
                  value={formData.idealAnswerOutline}
                  onChange={(e) => setFormData({ ...formData, idealAnswerOutline: e.target.value })}
                  placeholder="Key concepts the candidate must cover..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold text-slate-700 dark:text-slate-300">Sample Model Answer</label>
                <textarea
                  rows={3}
                  value={formData.sampleAnswer}
                  onChange={(e) => setFormData({ ...formData, sampleAnswer: e.target.value })}
                  placeholder="A high scoring sample response..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
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
                {actionLoading ? 'Saving...' : 'Save Question'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* View Question Detail Modal */}
      {viewingQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setViewingQuestion(null)} />
          <div className="relative z-10 w-full max-w-xl rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xl p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Question Rubric Details</span>
              <div className="flex items-center gap-2">
                <StatusBadge status={viewingQuestion.difficulty || 'medium'} />
                <span className="text-xs px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                  {viewingQuestion.category}
                </span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <h4 className="font-bold text-slate-900 dark:text-white mb-1">Question Text:</h4>
                <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl leading-relaxed">
                  {viewingQuestion.questionText}
                </p>
              </div>

              {viewingQuestion.expectedKeywords?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Target Keywords:</h4>
                  <div className="flex flex-wrap gap-1">
                    {viewingQuestion.expectedKeywords.map((kw, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-cyan-400 text-[11px] font-mono"
                      >
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {viewingQuestion.idealAnswerOutline && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Ideal Rubric / Outline:</h4>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl whitespace-pre-line leading-relaxed">
                    {viewingQuestion.idealAnswerOutline}
                  </p>
                </div>
              )}

              {viewingQuestion.sampleAnswer && (
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white mb-1">Sample Answer:</h4>
                  <p className="text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl whitespace-pre-line leading-relaxed">
                    {viewingQuestion.sampleAnswer}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setViewingQuestion(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Question Confirmation */}
      <AdminConfirmDialog
        isOpen={Boolean(deletingQuestion)}
        title="Delete Interview Question"
        message="Are you sure you want to permanently remove this question from the question repository? This will not affect past completed interview sessions."
        confirmLabel="Delete Question"
        confirmVariant="danger"
        isLoading={actionLoading}
        onConfirm={handleDeleteQuestion}
        onCancel={() => setDeletingQuestion(null)}
      />
    </div>
  );
}
