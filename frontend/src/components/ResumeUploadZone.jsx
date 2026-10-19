import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = ['.pdf', '.docx'];

export default function ResumeUploadZone({ onUpload, isUploading }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [clientError, setClientError] = useState('');
  const fileInputRef = useRef(null);

  const validateFile = (file) => {
    if (!file) return false;

    const ext = '.' + file.name.split('.').pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      setClientError(`Unsupported file format "${ext}". Please upload a .pdf or .docx document.`);
      return false;
    }

    if (file.size > MAX_FILE_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setClientError(`File is too large (${sizeMb} MB). Maximum allowed size is 5 MB.`);
      return false;
    }

    if (file.size === 0) {
      setClientError('The selected file appears to be empty (0 bytes).');
      return false;
    }

    setClientError('');
    return true;
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    if (isUploading) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (!isUploading) setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (validateFile(file)) {
        setSelectedFile(file);
      }
    }
  };

  const handleStartUpload = () => {
    if (!selectedFile || isUploading) return;
    onUpload(selectedFile);
  };

  const handleClearSelection = () => {
    setSelectedFile(null);
    setClientError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="w-full">
      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        onChange={handleFileChange}
        className="hidden"
        disabled={isUploading}
      />

      {/* Dropzone container */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isUploading && !selectedFile && fileInputRef.current?.click()}
        className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-200 text-center p-8 sm:p-12 cursor-pointer ${
          isUploading
            ? 'border-sky-500/50 bg-sky-50/20 dark:bg-sky-950/10 cursor-wait'
            : isDragOver
            ? 'border-sky-500 bg-sky-50 dark:bg-sky-950/30 scale-[1.008]'
            : selectedFile
            ? 'border-emerald-500/60 bg-emerald-50/20 dark:bg-emerald-950/10 cursor-default'
            : 'border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/40 hover:border-slate-400 dark:hover:border-slate-700'
        }`}
      >
        {isUploading ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-4 animate-in fade-in duration-200">
            <div className="relative w-14 h-14">
              <div className="absolute inset-0 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin"></div>
              <div className="absolute inset-2 rounded-full border-4 border-cyan-400/10 border-b-cyan-400 animate-spin reverse"></div>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Uploading & Analyzing Resume...
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
                Extracting raw text, evaluating formatting, and calculating your 7-factor weighted ATS score.
              </p>
            </div>
          </div>
        ) : selectedFile ? (
          <div className="flex flex-col items-center justify-center space-y-4 py-2 animate-in zoom-in-95 duration-150">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-md">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                Document Ready For Intelligence Processing
              </div>
              <div className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                {selectedFile.name}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {(selectedFile.size / 1024).toFixed(1)} KB &bull; {selectedFile.name.endsWith('.pdf') ? 'PDF Document' : 'Word DOCX'}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleStartUpload();
                }}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-xs sm:text-sm tracking-wide shadow-md shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 cursor-pointer"
              >
                <span>Process & Analyze Resume</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClearSelection();
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition cursor-pointer"
              >
                Choose Different File
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-sky-50 dark:bg-slate-800 border border-sky-100 dark:border-slate-700/80 text-sky-600 dark:text-cyan-400 flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <UploadCloud className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Drag and drop your resume here, or <span className="text-sky-600 dark:text-cyan-400 underline underline-offset-4">browse</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Supports PDF and DOCX files up to 5 MB
              </p>
            </div>

            <div className="inline-flex items-center gap-3 pt-2 text-[11px] text-slate-400 dark:text-slate-500 font-mono">
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-sky-500" /> .PDF
              </span>
              <span>&bull;</span>
              <span className="flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-blue-500" /> .DOCX
              </span>
              <span>&bull;</span>
              <span>Cloudinary Stored</span>
            </div>
          </div>
        )}
      </div>

      {/* Client validation error message */}
      {clientError && (
        <div className="mt-3 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex items-center gap-2 text-xs text-rose-700 dark:text-rose-300 animate-in fade-in duration-150">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{clientError}</span>
        </div>
      )}
    </div>
  );
}
