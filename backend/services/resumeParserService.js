const fs = require('fs');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

/**
 * Extract clean raw text from an uploaded resume file (PDF or DOCX)
 * @param {string} filePath - Absolute path to file on disk
 * @param {string} mimeType - MIME type of uploaded file
 * @param {string} originalName - Original filename
 * @returns {Promise<{ parsedText: string, metadata: object }>}
 */
const extractTextFromResume = async (filePath, mimeType, originalName) => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Resume file not found at path: ${filePath}`);
  }

  const ext = path.extname(originalName || filePath).toLowerCase();
  let rawText = '';

  try {
    if (ext === '.pdf' || mimeType === 'application/pdf') {
      const dataBuffer = fs.readFileSync(filePath);
      if (typeof pdfParse === 'function') {
        const parsedPdf = await pdfParse(dataBuffer);
        rawText = parsedPdf.text || '';
      } else if (pdfParse && pdfParse.PDFParse) {
        const parser = new pdfParse.PDFParse({ data: dataBuffer });
        const result = await parser.getText();
        rawText = result.text || result || '';
      } else {
        throw new Error('PDF parsing library could not be initialized.');
      }
    } else if (
      ext === '.docx' ||
      mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      rawText = result.value || '';
    } else {
      throw new Error(`Unsupported file type: ${ext}. Only PDF and DOCX are supported.`);
    }

    // Clean & normalize extracted text
    const cleanedText = rawText
      .replace(/\r\n/g, '\n')
      .replace(/\r/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    if (!cleanedText || cleanedText.length < 30) {
      throw new Error(
        'Could not extract meaningful text from this resume. Please ensure the document is not an empty or raster-image scanned PDF.'
      );
    }

    const words = cleanedText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const characterCount = cleanedText.length;

    return {
      parsedText: cleanedText,
      metadata: {
        wordCount,
        characterCount,
        pageCountEstimate: Math.max(1, Math.ceil(wordCount / 450))
      }
    };
  } catch (error) {
    console.error('[Resume Parser Error]', error.message);
    throw new Error(`Resume text extraction failed: ${error.message}`);
  }
};

module.exports = {
  extractTextFromResume
};
