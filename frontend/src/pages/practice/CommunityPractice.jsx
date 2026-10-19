import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Users,
  ArrowLeft,
  Plus,
  Play,
  Globe,
  Lock,
  Edit2,
  Trash2,
  Sparkles,
  BookOpen,
  Loader2,
  AlertCircle
} from 'lucide-react';
import PracticeRunner from '../../components/practice/PracticeRunner';
import CommunitySetModal from '../../components/practice/CommunitySetModal';
import { interviewService } from '../../services/interviewService';
import { useAuth } from '../../context/AuthContext';

export default function CommunityPractice() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [sets, setSets] = useState([]);
  const [activeTab, setActiveTab] = useState('public'); // 'public' | 'my'
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSet, setEditingSet] = useState(null);

  // Active Practice Session
  const [activeSession, setActiveSession] = useState(null);
  const [isStarting, setIsStarting] = useState(false);
  const [selectedSetTitle, setSelectedSetTitle] = useState('');

  const loadSets = async () => {
    try {
      setIsLoading(true);
      const res = await interviewService.getCommunitySets();
      setSets(res.sets || []);
    } catch (err) {
      console.error('[Load Community Sets Error]', err);
      setErrorMessage('Could not load community question sets.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSets();
  }, []);

  const handleStartPractice = async (set) => {
    try {
      setIsStarting(true);
      setErrorMessage('');
      setSelectedSetTitle(set.title);

      const res = await interviewService.startPracticeSession({
        sessionType: 'community',
        questionSetId: set._id
      });

      setActiveSession(res.session);
    } catch (err) {
      console.error('[Start Community Practice Error]', err);
      setErrorMessage(err.response?.data?.message || 'Could not start practice with this set.');
    } finally {
      setIsStarting(false);
    }
  };

  const handleDelete = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this question set?')) return;

    try {
      await interviewService.deleteCommunitySet(id);
      setSets((prev) => prev.filter((s) => s._id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Could not delete question set.');
    }
  };

  const handleEdit = (set, e) => {
    e.stopPropagation();
    setEditingSet(set);
    setIsModalOpen(true);
  };

  const publicSets = sets.filter((s) => s.isPublic);
  const mySets = sets.filter((s) => s.ownerId === user?.id || s.ownerId?._id === user?.id || s.isOwner);

  const displayedSets = activeTab === 'public' ? publicSets : mySets;

  if (activeSession) {
    return (
      <div className="space-y-6 animate-in fade-in duration-300">
        <button
          onClick={() => setActiveSession(null)}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Community Sets</span>
        </button>

        <PracticeRunner
          session={activeSession}
          modeTitle={`Community Set: ${selectedSetTitle}`}
          modeIcon={Users}
          contextBadge={selectedSetTitle}
          onRestart={() => setActiveSession(null)}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Breadcrumb & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          to="/interview/practice"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Practice Modes</span>
        </Link>

        <button
          onClick={() => {
            setEditingSet(null);
            setIsModalOpen(true);
          }}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all flex items-center justify-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          <span>Create Question Set</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-cyan-50 dark:bg-cyan-950/60 border border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 flex items-center justify-center font-bold">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Community Question Sets
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Practice using curated question sets created by the community or assemble your own custom sets.
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('public')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'public'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            <span>Public Sets ({publicSets.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('my')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
              activeTab === 'my'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>My Sets ({mySets.length})</span>
          </button>
        </div>

        {/* Sets Grid */}
        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-2 text-cyan-500" />
            <span className="text-xs">Loading question sets...</span>
          </div>
        ) : displayedSets.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
            <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-400" />
            <p className="text-sm font-semibold">
              {activeTab === 'public' ? 'No public sets available yet.' : 'You have not created any question sets yet.'}
            </p>
            <p className="text-xs mt-1">
              Create your own customized question set to practice or share with others.
            </p>
            <button
              onClick={() => {
                setEditingSet(null);
                setIsModalOpen(true);
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold inline-flex items-center gap-1.5 shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create Question Set</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayedSets.map((set) => {
              const isOwner = set.ownerId === user?.id || set.ownerId?._id === user?.id || set.isOwner;

              return (
                <div
                  key={set._id}
                  className="bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-4"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {set.category || 'Technical'}
                      </span>

                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                        {set.isPublic ? (
                          <span className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400">
                            <Globe className="w-3 h-3" /> Public
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        )}

                        {isOwner && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={(e) => handleEdit(set, e)}
                              className="p-1 text-slate-400 hover:text-sky-600 dark:hover:text-cyan-400 transition-colors"
                              title="Edit set"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={(e) => handleDelete(set._id, e)}
                              className="p-1 text-slate-400 hover:text-rose-500 transition-colors"
                              title="Delete set"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {set.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 line-clamp-2">
                      {set.description || 'Community practice question set.'}
                    </p>

                    <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      <span>{set.questions?.length || 0} questions</span>
                      <span>•</span>
                      <span>Practiced {set.practiceCount || 0} times</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={() => handleStartPractice(set)}
                      disabled={isStarting}
                      className="w-full py-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-cyan-50 dark:hover:bg-slate-750 text-cyan-700 dark:text-cyan-400 border border-slate-200 dark:border-slate-700 font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Practice With This Set</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Set Creation & Edit Modal */}
      <CommunitySetModal
        isOpen={isModalOpen}
        editSet={editingSet}
        onClose={() => {
          setIsModalOpen(false);
          setEditingSet(null);
        }}
        onSuccess={() => {
          loadSets();
        }}
      />
    </div>
  );
}
