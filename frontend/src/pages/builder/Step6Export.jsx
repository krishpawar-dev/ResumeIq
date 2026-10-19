import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Download,
  Printer,
  CheckCircle2,
  FileText,
  ShieldCheck,
  ArrowLeft,
  AlertCircle
} from 'lucide-react';
import { useBuilder } from '../../context/BuilderContext';
import ResumeTemplateRenderer from '../../components/builder/ResumeTemplateRenderer';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// html2canvas 1.4.x cannot parse the OKLCH colors emitted by Tailwind CSS v4.
// Convert OKLCH colors to sRGB only inside the cloned document used for export.
// This keeps the application's UI/styles unchanged while making PDF rendering reliable.
const oklchToRgb = (match, lightness, chroma, hue, alpha) => {
  try {
    const L = lightness.trim().endsWith('%')
      ? parseFloat(lightness) / 100
      : parseFloat(lightness);
    const C = chroma.trim().endsWith('%')
      ? parseFloat(chroma) / 100
      : parseFloat(chroma);
    let H = parseFloat(hue);
    if (!Number.isFinite(L) || !Number.isFinite(C) || !Number.isFinite(H)) return match;

    H = ((H % 360) + 360) % 360;
    const h = (H * Math.PI) / 180;
    const a = C * Math.cos(h);
    const b = C * Math.sin(h);

    const l_ = L + 0.3963377774 * a + 0.2158037573 * b;
    const m_ = L - 0.1055613458 * a - 0.0638541728 * b;
    const s_ = L - 0.0894841775 * a - 1.291485548 * b;

    const l = l_ * l_ * l_;
    const m = m_ * m_ * m_;
    const s = s_ * s_ * s_;

    const toSrgb = (value) => (
      value <= 0.0031308
        ? 12.92 * value
        : 1.055 * Math.pow(Math.max(value, 0), 1 / 2.4) - 0.055
    );

    let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
    let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
    let blue = -0.0041960863 * l - 0.7034186173 * m + 1.7076147010 * s;

    r = Math.min(1, Math.max(0, toSrgb(r)));
    g = Math.min(1, Math.max(0, toSrgb(g)));
    blue = Math.min(1, Math.max(0, toSrgb(blue)));

    const aValue = alpha == null
      ? 1
      : (alpha.trim().endsWith('%') ? parseFloat(alpha) / 100 : parseFloat(alpha));
    const safeAlpha = Number.isFinite(aValue) ? Math.min(1, Math.max(0, aValue)) : 1;

    return `rgba(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(blue * 255)}, ${safeAlpha})`;
  } catch {
    return match;
  }
};

const sanitizeClonedStylesForHtml2Canvas = (clonedDoc) => {
  const replaceUnsupportedColors = (cssText) => cssText.replace(
    /oklch\(\s*([+-]?(?:\d*\.)?\d+%?)\s+([+-]?(?:\d*\.)?\d+%?)\s+([+-]?(?:\d*\.)?\d+)(?:deg)?(?:\s*\/\s*([+-]?(?:\d*\.)?\d+%?))?\s*\)/gi,
    oklchToRgb
  );

  clonedDoc.querySelectorAll('style').forEach((style) => {
    if (style.textContent?.includes('oklch(')) {
      style.textContent = replaceUnsupportedColors(style.textContent);
    }
  });

  // In production Vite may load the generated CSS through a <link>. Walk
  // same-origin CSS rules as well, so the fix also works after deployment.
  const sanitizeStyleSheet = (styleSheet) => {
    try {
      Array.from(styleSheet.cssRules || []).forEach((rule) => {
        if (rule.style?.cssText?.includes('oklch(')) {
          rule.style.cssText = replaceUnsupportedColors(rule.style.cssText);
        }
        if (rule.cssRules) {
          sanitizeStyleSheet(rule);
        }
      });
    } catch {
      // Ignore cross-origin stylesheets; the resume itself uses same-origin CSS.
    }
  };

  Array.from(clonedDoc.styleSheets || []).forEach(sanitizeStyleSheet);

  // Also normalize inline styles copied into the clone by the browser.
  clonedDoc.querySelectorAll('[style]').forEach((node) => {
    const styleText = node.getAttribute('style');
    if (styleText?.includes('oklch(')) {
      node.setAttribute('style', replaceUnsupportedColors(styleText));
    }
  });
};

export default function Step6Export() {
  const { draft, templateId, atsScore } = useBuilder();
  const navigate = useNavigate();
  const captureRef = useRef(null);

  const [isExporting, setIsExporting] = useState(false);
  const [exportSuccess, setExportSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const handleDownloadPDF = async () => {
    setIsExporting(true);
    setErrorMessage(null);
    setExportSuccess(false);

    try {
      const element = document.getElementById('resume-export-sheet');
      if (!element) {
        throw new Error('Resume preview element not found. Please go back to Preview and try again.');
      }

      // Ensure fonts are loaded
      if (document.fonts?.ready) {
        await document.fonts.ready;
      }

      // Brief settle time so layout is fully painted
      await new Promise((r) => setTimeout(r, 120));

      // Force the capture target into a clean, visible state
      const originalStyles = {
        position: element.style.position,
        left: element.style.left,
        top: element.style.top,
        width: element.style.width,
        maxWidth: element.style.maxWidth,
        transform: element.style.transform,
        boxShadow: element.style.boxShadow,
        margin: element.style.margin
      };

      // Temporarily normalize styles for reliable capture
      element.style.position = 'relative';
      element.style.left = '0';
      element.style.top = '0';
      element.style.width = '794px'; // ~A4 width at 96dpi
      element.style.maxWidth = '794px';
      element.style.transform = 'none';
      element.style.boxShadow = 'none';
      element.style.margin = '0 auto';

      let canvas;
      try {
        canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          logging: false,
          backgroundColor: '#ffffff',
          imageTimeout: 20000,
          removeContainer: true,
          foreignObjectRendering: false,
          windowWidth: 794,
          onclone: (clonedDoc) => {
            // Tailwind v4 emits OKLCH colors. html2canvas 1.4.x cannot parse
            // them, so convert only the export clone to browser-safe rgba().
            sanitizeClonedStylesForHtml2Canvas(clonedDoc);

            const cloned = clonedDoc.getElementById('resume-export-sheet');
            if (cloned) {
              cloned.style.backgroundColor = '#ffffff';
              cloned.style.color = '#0f172a';
              cloned.style.boxShadow = 'none';
              cloned.style.transform = 'none';
              cloned.style.width = '794px';
              cloned.style.maxWidth = '794px';

              // Keep intentional resume colors while neutralizing dark-mode
              // background overrides that may be inherited from the app.
              cloned.querySelectorAll('*').forEach((node) => {
                if (node.style) {
                  const bg = clonedDoc.defaultView?.getComputedStyle(node).backgroundColor;
                  if (bg && (bg.includes('rgb(15') || bg.includes('rgb(2,'))) {
                    node.style.backgroundColor = '#ffffff';
                  }
                }
              });
            }

            const body = clonedDoc.body;
            if (body) {
              body.style.background = '#ffffff';
            }
          }
        });
      } finally {
        // Always restore the live preview, even if html2canvas fails.
        Object.assign(element.style, originalStyles);
      }

      if (!canvas.width || !canvas.height) {
        throw new Error('Resume preview could not be rendered to canvas.');
      }

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'a4',
        compress: true
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const marginX = 28;
      const marginY = 28;
      const contentWidth = pageWidth - marginX * 2;
      const contentHeight = pageHeight - marginY * 2;

      // How many canvas pixels equal one PDF page height
      const pageCanvasHeight = Math.floor(
        canvas.width * (contentHeight / contentWidth)
      );

      let sourceY = 0;
      let pageNumber = 0;

      while (sourceY < canvas.height) {
        const sliceHeight = Math.min(pageCanvasHeight, canvas.height - sourceY);

        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = canvas.width;
        pageCanvas.height = sliceHeight;

        const ctx = pageCanvas.getContext('2d');
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, pageCanvas.width, pageCanvas.height);
        ctx.drawImage(
          canvas,
          0,
          sourceY,
          canvas.width,
          sliceHeight,
          0,
          0,
          canvas.width,
          sliceHeight
        );

        const pageImage = pageCanvas.toDataURL('image/jpeg', 0.92);
        const renderedHeight = (sliceHeight / canvas.width) * contentWidth;

        if (pageNumber > 0) {
          pdf.addPage();
        }

        pdf.addImage(
          pageImage,
          'JPEG',
          marginX,
          marginY,
          contentWidth,
          renderedHeight,
          undefined,
          'FAST'
        );

        sourceY += sliceHeight;
        pageNumber += 1;

        // Safety: avoid infinite loop
        if (pageNumber > 10) break;
      }

      const candidateName = (draft?.personalInfo?.fullName || 'ResumeIQ')
        .trim()
        .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
        .replace(/\s+/g, '_')
        .slice(0, 80) || 'ResumeIQ';

      const fileName = `${candidateName}_Resume.pdf`;

      // Prefer save() which triggers download more reliably in most browsers
      try {
        pdf.save(fileName);
      } catch {
        // Fallback: explicit blob download
        const pdfBlob = pdf.output('blob');
        const blobUrl = URL.createObjectURL(pdfBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = fileName;
        a.rel = 'noopener';
        a.style.display = 'none';
        document.body.appendChild(a);
        a.click();
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(blobUrl);
        }, 2000);
      }

      setExportSuccess(true);
    } catch (err) {
      console.error('[PDF Export Error]', err);
      setErrorMessage(
        err?.message ||
        'PDF download could not be generated. Please try again or use Print / Save via Browser.'
      );
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Top Banner */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold mb-1">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>ATS Optimized & Ready for Distribution</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
          Export Your Professional Resume
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Download as a high-fidelity PDF formatted according to international recruitment and ATS parsing guidelines.
        </p>
      </div>

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-xs text-amber-800 dark:text-amber-300 max-w-xl mx-auto flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Export Action Card */}
      <div className="max-w-xl mx-auto rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 p-6 sm:p-8 space-y-6 shadow-sm text-center">
        <div className="w-16 h-16 rounded-2xl bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 text-sky-600 dark:text-cyan-400 flex items-center justify-center mx-auto">
          <FileText className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {draft?.personalInfo?.fullName || 'Candidate'}'s Resume
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Template:{' '}
            <span className="capitalize font-semibold text-slate-700 dark:text-slate-300">
              {templateId} Professional
            </span>{' '}
            &bull; ATS Score:{' '}
            <span className="font-bold text-emerald-600">{atsScore}%</span>
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={isExporting}
            className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-sky-600 hover:bg-sky-500 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold text-sm tracking-wide shadow-lg shadow-sky-600/20 dark:shadow-cyan-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
            <span>{isExporting ? 'Generating PDF...' : 'Download PDF Document'}</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-sm transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print / Save via Browser</span>
          </button>
        </div>

        {exportSuccess && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold flex items-center justify-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4" />
            <span>PDF downloaded successfully! Ready to apply.</span>
          </div>
        )}
      </div>

      {/* Clean capture container – fixed width, light background, no overflow clipping */}
      <div
        ref={captureRef}
        className="p-4 sm:p-8 rounded-3xl bg-slate-100 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-inner flex justify-center print:p-0 print:bg-white print:border-0 print:shadow-none"
      >
        <div className="bg-white" style={{ width: '794px', maxWidth: '100%' }}>
          <ResumeTemplateRenderer
            draft={draft}
            templateId={templateId}
            isPrintMode={true}
          />
        </div>
      </div>

      {/* Navigation Controls */}
      <div className="flex items-center justify-between pt-4">
        <button
          type="button"
          onClick={() => navigate('/resume-builder/preview')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Preview</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-xs font-bold text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition cursor-pointer"
        >
          <span>Return to Dashboard</span>
        </button>
      </div>
    </div>
  );
}
