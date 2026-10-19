import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Plus, RefreshCw, AlertCircle, Sparkles } from 'lucide-react';
import { resumeService } from '../services/resumeService';
import ResumeUploadZone from '../components/ResumeUploadZone';
import ResumeCard from '../components/ResumeCard';
import EmptyState from '../components/EmptyState';

export default function Resumes() {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showUploadZone, setShowUploadZone] = useState(true);

  const navigate = useNavigate();

  const fetchResumes = async () => {
    try {
      setIsLoading(true);
      const data = await resumeService.getResumes();
      setResumes(data.resumes || []);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Failed to load resumes.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResumes();
  }, []);

  const handleUpload = async (file) => {
    setIsUploading(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('resume', file);

      const response = await resumeService.uploadResume(formData);
      const createdResume = response.resume;

      // If analyzed, navigate directly to resume intelligence detail view!
      if (createdResume && createdResume._id) {
        navigate(`/resumes/${createdResume._id}`);
      } else {
        await fetchResumes();
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || err.message || 'Resume upload and analysis failed.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (id, fileName) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This will remove all associated ATS diagnostic records.`)) {
      return;
    }

    try {
      await resumeService.deleteResume(id);
      setResumes((prev) => prev.filter((r) => r._id !== id));
    } catch (err) {
      alert(`Deletion failed: ${err.response?.data?.message || err.message}`);
    }
  };

  const handleAnalyze = async (id) => {
    try {
      navigate(`/resumes/${id}`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Resume Intelligence Workspace
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
            Resume Documents & ATS Diagnostic
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Upload PDF or Word documents to extract clean text and execute 7-factor weighted ATS calibration.
          </p>
        </div>

        <button
          onClick={fetchResumes}
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 transition self-start sm:self-auto cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Global Error Banner */}
      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-start gap-3 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold">Error: </span>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* Prominent Upload Zone */}
      <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-900/40 p-6 sm:p-8 backdrop-blur-sm shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-sky-600 dark:text-cyan-400" />
            <h2 className="text-base font-bold text-slate-900 dark:text-white m-0">
              Ingest Document For Diagnostic
            </h2>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400">PDF / DOCX supported</span>
        </div>

        <ResumeUploadZone
          onUpload={handleUpload}
          isUploading={isUploading}
        />
      </div>

      {/* User's Resumes Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between pb-2">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white m-0">
            Your Uploaded Resumes ({resumes.length})
          </h2>
          <span className="text-xs text-slate-400">Chronological Archive</span>
        </div>

        {isLoading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 rounded-full border-2 border-sky-500/20 border-t-sky-500 animate-spin"></div>
            <div className="text-xs text-slate-400">Loading your resumes...</div>
          </div>
        ) : resumes.length === 0 ? (
          <EmptyState
            icon={FileText}
            badge="Awaiting First Document"
            title="No resumes uploaded yet"
            description="Drag and drop your current PDF or Word DOCX resume above to generate your initial 7-factor ATS diagnostic and actionable feedback."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume._id}
                resume={resume}
                onDelete={handleDelete}
                onAnalyze={handleAnalyze}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
