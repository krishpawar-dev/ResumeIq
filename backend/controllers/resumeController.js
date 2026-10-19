const path = require('path');
const fs = require('fs');
const Resume = require('../models/Resume');
const { uploadResumeFile, deleteResumeFile } = require('../services/cloudinaryService');
const { extractTextFromResume } = require('../services/resumeParserService');
const { analyzeResumeATS } = require('../services/resumeAnalysisService');

/**
 * @desc    Upload a resume (PDF / DOCX), extract text, and run initial ATS analysis
 * @route   POST /api/resume/upload
 * @access  Private (JWT Protected)
 */
const uploadResume = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'No resume file provided. Please select a valid PDF or DOCX file.'
    });
  }

  const tempFilePath = req.file.path;

  try {
    // 1. Text Extraction
    let extracted;
    try {
      extracted = await extractTextFromResume(tempFilePath, req.file.mimetype, req.file.originalname);
    } catch (parseErr) {
      // Clean up temporary upload file
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(422).json({
        status: 'error',
        message: parseErr.message || 'Failed to extract readable text from document.'
      });
    }

    // 2. Upload file to Cloudinary (or local fallback in dev)
    let uploadResult;
    try {
      uploadResult = await uploadResumeFile(tempFilePath, req.file.originalname);
    } catch (uploadErr) {
      if (fs.existsSync(tempFilePath)) fs.unlinkSync(tempFilePath);
      return res.status(502).json({
        status: 'error',
        message: uploadErr.message || 'File storage failed. Please try again.'
      });
    }

    // 3. Create Resume document in MongoDB
    const resume = await Resume.create({
      userId: req.user._id,
      fileUrl: uploadResult.fileUrl,
      cloudinaryPublicId: uploadResult.publicId,
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      parsedText: extracted.parsedText,
      metadata: extracted.metadata,
      status: 'processing'
    });

    // 4. Perform ATS analysis
    try {
      const analysis = await analyzeResumeATS(resume.parsedText, resume.metadata);
      resume.atsScore = analysis.atsScore;
      resume.isAIPowered = Boolean(analysis.isAIPowered);
      resume.scoreBreakdown = analysis.scoreBreakdown;
      resume.improvementPlan = analysis.improvementPlan || null;
      resume.status = 'analyzed';
      resume.metadata.analyzedAt = new Date();
      await resume.save();
    } catch (analysisErr) {
      console.error('[Initial ATS Analysis Error]', analysisErr.message);
      resume.status = 'failed';
      resume.analysisError = analysisErr.message;
      await resume.save();
    }

    // Clean up temporary local upload file
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (cleanupErr) {
        // non-fatal
      }
    }

    return res.status(201).json({
      status: 'success',
      message: 'Resume uploaded and processed successfully',
      resume
    });
  } catch (error) {
    if (fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
      } catch (e) {}
    }

    console.error('[Upload Resume Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'An unexpected error occurred during resume upload.'
    });
  }
};

/**
 * @desc    Analyze or re-analyze an uploaded resume
 * @route   POST /api/resume/analyze OR POST /api/resume/:id/analyze
 * @access  Private (JWT Protected)
 */
const analyzeResume = async (req, res) => {
  try {
    const resumeId = req.params.id || req.body.resumeId;

    if (!resumeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Resume ID is required for analysis.'
      });
    }

    // Enforce strict ownership
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found or you do not have permission to access it.'
      });
    }

    if (!resume.parsedText || resume.parsedText.length < 20) {
      return res.status(422).json({
        status: 'error',
        message: 'Resume does not contain extracted text to analyze.'
      });
    }

    // Set processing status
    resume.status = 'processing';
    resume.analysisError = null;
    await resume.save();

    try {
      const analysis = await analyzeResumeATS(resume.parsedText, resume.metadata);
      resume.atsScore = analysis.atsScore;
      resume.isAIPowered = Boolean(analysis.isAIPowered);
      resume.scoreBreakdown = analysis.scoreBreakdown;
      resume.improvementPlan = analysis.improvementPlan || null;
      resume.status = 'analyzed';
      resume.metadata.analyzedAt = new Date();
      await resume.save();

      return res.status(200).json({
        status: 'success',
        message: 'ATS analysis completed successfully',
        resume
      });
    } catch (analysisErr) {
      resume.status = 'failed';
      resume.analysisError = analysisErr.message;
      await resume.save();

      return res.status(500).json({
        status: 'error',
        message: `ATS analysis failed: ${analysisErr.message}`,
        resume
      });
    }
  } catch (error) {
    console.error('[Analyze Resume Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to analyze resume.'
    });
  }
};

/**
 * @desc    Get all resumes belonging to the authenticated user
 * @route   GET /api/resume
 * @access  Private (JWT Protected)
 */
const getResumes = async (req, res) => {
  try {
    // Select without full parsedText for fast list queries
    const resumes = await Resume.find({ userId: req.user._id })
      .select('-parsedText')
      .sort({ uploadedAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: resumes.length,
      resumes
    });
  } catch (error) {
    console.error('[Get Resumes Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve resumes.'
    });
  }
};

/**
 * @desc    Get single resume details by ID
 * @route   GET /api/resume/:id
 * @access  Private (JWT Protected)
 */
const getResumeById = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found or you do not have permission to view it.'
      });
    }

    return res.status(200).json({
      status: 'success',
      resume
    });
  } catch (error) {
    console.error('[Get Resume By ID Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve resume details.'
    });
  }
};

/**
 * @desc    Update editable resume fields (e.g. rename)
 * @route   PUT /api/resume/:id
 * @access  Private (JWT Protected)
 */
const updateResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found or you do not have permission to modify it.'
      });
    }

    // Only allow updating safe fields
    if (req.body.fileName && typeof req.body.fileName === 'string') {
      resume.fileName = req.body.fileName.trim();
    }

    await resume.save();

    return res.status(200).json({
      status: 'success',
      message: 'Resume updated successfully',
      resume
    });
  } catch (error) {
    console.error('[Update Resume Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to update resume.'
    });
  }
};

/**
 * @desc    Delete a resume document and its stored asset
 * @route   DELETE /api/resume/:id
 * @access  Private (JWT Protected)
 */
const deleteResume = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found or you do not have permission to delete it.'
      });
    }

    // Delete stored asset from Cloudinary or local uploads
    await deleteResumeFile(resume.cloudinaryPublicId, resume.fileUrl);

    // Delete document
    await Resume.deleteOne({ _id: resume._id });

    return res.status(200).json({
      status: 'success',
      message: 'Resume deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Resume Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete resume.'
    });
  }
};

const ResumeVersion = require('../models/ResumeVersion');
const { improveResumeSection } = require('../services/resumeImprovementService');

/**
 * @desc    Improve a specific resume section or bullet point with AI
 * @route   POST /api/resume/:id/improve
 * @access  Private (JWT Protected)
 */
const improveSection = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const { sectionId, originalText, sectionType } = req.body;

    if (!sectionId || !originalText || typeof originalText !== 'string' || originalText.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'Both sectionId and originalText are required to improve a section.'
      });
    }

    // Verify ownership
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found or you do not have permission to access it.'
      });
    }

    const improvement = await improveResumeSection({
      originalText,
      sectionType: sectionType || 'experience',
      resumeContext: resume.parsedText
    });

    return res.status(200).json({
      status: 'success',
      sectionId,
      originalText: improvement.originalText,
      suggestedText: improvement.suggestedText,
      reasons: improvement.reasons,
      explanation: improvement.explanation
    });
  } catch (error) {
    console.error('[AI Section Improvement Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'We could not improve this section. Your original resume content is unchanged. Try again in a moment.'
    });
  }
};

/**
 * @desc    Save an accepted or edited AI suggestion as a new ResumeVersion
 * @route   POST /api/resume/:id/versions
 * @access  Private (JWT Protected)
 */
const saveResumeVersion = async (req, res) => {
  try {
    const resumeId = req.params.id;
    const { sectionId, originalText, aiSuggestion, acceptedText, reasons, explanation } = req.body;

    if (!sectionId || !originalText || !acceptedText) {
      return res.status(400).json({
        status: 'error',
        message: 'sectionId, originalText, and acceptedText are required to save a version.'
      });
    }

    // Verify resume ownership
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found or you do not have permission to modify it.'
      });
    }

    const version = await ResumeVersion.create({
      resumeId: resume._id,
      userId: req.user._id,
      sectionId,
      originalText: originalText.trim(),
      aiSuggestion: (aiSuggestion || acceptedText).trim(),
      acceptedText: acceptedText.trim(),
      reasons: Array.isArray(reasons) ? reasons : [],
      explanation: explanation || ''
    });

    return res.status(201).json({
      status: 'success',
      message: 'Resume version saved successfully',
      version
    });
  } catch (error) {
    console.error('[Save Resume Version Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to save resume version.'
    });
  }
};

/**
 * @desc    Get all saved versions for a resume
 * @route   GET /api/resume/:id/versions
 * @access  Private (JWT Protected)
 */
const getResumeVersions = async (req, res) => {
  try {
    const resumeId = req.params.id;

    // Verify ownership
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Resume not found or you do not have permission to view its versions.'
      });
    }

    const versions = await ResumeVersion.find({
      resumeId: resume._id,
      userId: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: versions.length,
      versions
    });
  } catch (error) {
    console.error('[Get Resume Versions Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve resume versions.'
    });
  }
};

module.exports = {
  uploadResume,
  analyzeResume,
  getResumes,
  getResumeById,
  updateResume,
  deleteResume,
  improveSection,
  saveResumeVersion,
  getResumeVersions
};
