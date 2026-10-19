const Resume = require('../models/Resume');
const MockInterview = require('../models/MockInterview');
const { runTruthDetector } = require('../services/truthDetectorService');
const { generateReverseInterviewQuestions } = require('../services/reverseInterviewService');
const { analyzeCareerTwin } = require('../services/careerTwinService');

/**
 * @desc    Run Resume Truth Detector on a resume
 * @route   POST /api/resume/:id/truth-detector
 * @access  Private (JWT Protected)
 */
const runResumeTruthDetector = async (req, res) => {
  try {
    const resume = await Resume.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ status: 'error', message: 'Resume not found.' });
    }

    if (!resume.parsedText || resume.parsedText.length < 50) {
      return res.status(422).json({
        status: 'error',
        message: 'This resume does not have enough parsed text to analyze. Please ensure the resume was successfully uploaded and parsed.'
      });
    }

    const truthResult = await runTruthDetector(resume.parsedText);

    return res.status(200).json({
      status: 'success',
      message: 'Truth detection analysis complete',
      resume: {
        _id: resume._id,
        fileName: resume.fileName
      },
      analysis: truthResult
    });
  } catch (error) {
    console.error('[Truth Detector Controller Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to run truth detection analysis.'
    });
  }
};

/**
 * @desc    Generate Reverse Interview Questions for an interview session
 * @route   POST /api/interview/:id/reverse-interview
 * @access  Private (JWT Protected)
 */
const generateReverseInterview = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({ status: 'error', message: 'Interview session not found.' });
    }

    const reverseQuestions = await generateReverseInterviewQuestions(interview);

    return res.status(200).json({
      status: 'success',
      message: 'Reverse interview questions generated',
      interview: {
        _id: interview._id,
        role: interview.setup?.targetRole || interview.role
      },
      reverseInterview: reverseQuestions
    });
  } catch (error) {
    console.error('[Reverse Interview Controller Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate reverse interview questions.'
    });
  }
};

/**
 * @desc    Run Career Twin analysis
 * @route   POST /api/career/twin
 * @access  Private (JWT Protected)
 */
const getCareerTwin = async (req, res) => {
  try {
    const { resumeId, targetRole, currentRole } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a resumeId to run Career Twin analysis.'
      });
    }

    if (!targetRole) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a targetRole to run Career Twin analysis.'
      });
    }

    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({ status: 'error', message: 'Resume not found.' });
    }

    if (!resume.parsedText || resume.parsedText.length < 50) {
      return res.status(422).json({
        status: 'error',
        message: 'Resume does not have sufficient parsed text for Career Twin analysis.'
      });
    }

    const twinResult = await analyzeCareerTwin(resume.parsedText, targetRole, currentRole || '');

    return res.status(200).json({
      status: 'success',
      message: 'Career Twin analysis complete',
      twinAnalysis: twinResult,
      inputs: { targetRole, currentRole }
    });
  } catch (error) {
    console.error('[Career Twin Controller Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to run Career Twin analysis.'
    });
  }
};

module.exports = {
  runResumeTruthDetector,
  generateReverseInterview,
  getCareerTwin
};
