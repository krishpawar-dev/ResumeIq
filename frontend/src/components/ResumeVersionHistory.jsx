import React, { useState, useEffect } from 'react';
import { History, Copy, Check, Calendar, ArrowRight, ShieldCheck, Tag } from 'lucide-react';
import { resumeService } from '../services/resumeService';

export default function ResumeVersionHistory({ resumeId, refreshTrigger }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState(null);

  const fetchVersions = async () => {
    try {
      setLoading(true);
      const data = await resumeService.getVersions(resumeId);
      setVersions(data.versions || []);
    } catch (err) {
      console.error('[Fetch Versions Error]', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resumeId) {
      fetchVersions();
    }
  }, [resumeId, refreshTrigger]);

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  if (loading && versions.length === 0) {
    return (
      <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 animate-pulse text-xs text-slate-400">
        Loading version history...
      </div>
    );
  }

  if (versions.length === 0) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">
              Saved Version History ({versions.length})
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Audit trail of AI-assisted improvements. Originals remain fully preserved.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {versions.map((ver) => (
          <div
            key={ver._id}
            className="rounded-xl border border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-950/40 p-4 space-y-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-[11px] uppercase tracking-wider">
                  {ver.sectionId}
                </span>
                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3 h-3" />
                  {new Date(ver.createdAt).toLocaleString()}
                </span>
              </div>

              <button
                onClick={() => handleCopy(ver._id, ver.acceptedText)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold text-sky-600 dark:text-cyan-400 hover:bg-sky-50 dark:hover:bg-sky-950/60 transition cursor-pointer"
              >
                {copiedId === ver._id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>

            {/* Reasons Badges */}
            {ver.reasons && ver.reasons.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ver.reasons.map((r, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/40"
                  >
                    <Tag className="w-2.5 h-2.5" />
                    {r}
                  </span>
                ))}
              </div>
            )}

            {/* Before / After comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-lg bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                  Original Text
                </span>
                <p className="text-xs text-slate-600 dark:text-slate-300 italic line-clamp-3">
                  "{ver.originalText}"
                </p>
              </div>

              <div className="p-3 rounded-lg bg-sky-50/40 dark:bg-sky-950/20 border border-sky-100 dark:border-sky-900/50">
                <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-cyan-400 block mb-1">
                  Accepted / Edited Text
                </span>
                <p className="text-xs font-medium text-slate-800 dark:text-slate-100 line-clamp-3">
                  {ver.acceptedText}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
