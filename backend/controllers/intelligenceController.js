const Job = require('../models/Job');
const JobMatch = require('../models/JobMatch');
const Resume = require('../models/Resume');
const { runJobXRay } = require('../services/jobXRayService');
const { detectGhostJob } = require('../services/ghostJobService');

/**
 * @desc    Run Job X-Ray analysis on a job match
 * @route   POST /api/jobs/xray
 * @access  Private (JWT Protected)
 */
const runXRay = async (req, res) => {
  try {
    const { jobMatchId, jobId, resumeId } = req.body;

    let jobDescriptionText = '';
    let resumeText = '';

    if (jobMatchId) {
      // Load from existing job match
      const match = await JobMatch.findOne({
        _id: jobMatchId,
        userId: req.user._id
      })
        .populate('jobId', 'jobDescriptionText title company')
        .populate('resumeId', 'parsedText');

      if (!match) {
        return res.status(404).json({ status: 'error', message: 'Job match not found.' });
      }

      jobDescriptionText = match.jobId?.jobDescriptionText || '';
      resumeText = match.resumeId?.parsedText || '';
    } else if (jobId && resumeId) {
      // Load from separate job and resume
      const [job, resume] = await Promise.all([
        Job.findOne({ _id: jobId, userId: req.user._id }),
        Resume.findOne({ _id: resumeId, userId: req.user._id })
      ]);

      if (!job || !resume) {
        return res.status(404).json({ status: 'error', message: 'Job or resume not found.' });
      }

      jobDescriptionText = job.jobDescriptionText || '';
      resumeText = resume.parsedText || '';
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide either jobMatchId or both jobId and resumeId.'
      });
    }

    if (!jobDescriptionText || jobDescriptionText.length < 20) {
      return res.status(422).json({
        status: 'error',
        message: 'Job description text is too short to analyze.'
      });
    }

    const xrayResult = await runJobXRay(jobDescriptionText, resumeText);

    return res.status(200).json({
      status: 'success',
      message: 'Job X-Ray analysis complete',
      xray: xrayResult
    });
  } catch (error) {
    console.error('[Job X-Ray Controller Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to run Job X-Ray analysis.'
    });
  }
};

/**
 * @desc    Run Ghost Job Detection on a job description
 * @route   POST /api/jobs/ghost-detect
 * @access  Private (JWT Protected)
 */
const detectGhost = async (req, res) => {
  try {
    const { jobDescriptionText, jobId } = req.body;

    let textToAnalyze = jobDescriptionText;

    if (!textToAnalyze && jobId) {
      const job = await Job.findOne({ _id: jobId, userId: req.user._id });
      if (!job) {
        return res.status(404).json({ status: 'error', message: 'Job not found.' });
      }
      textToAnalyze = job.jobDescriptionText;
    }

    if (!textToAnalyze || textToAnalyze.trim().length < 30) {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide a job description to analyze.'
      });
    }

    const ghostResult = await detectGhostJob(textToAnalyze);

    return res.status(200).json({
      status: 'success',
      message: 'Ghost job detection complete',
      detection: ghostResult
    });
  } catch (error) {
    console.error('[Ghost Job Detector Controller Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to run ghost job detection.'
    });
  }
};

module.exports = { runXRay, detectGhost };
