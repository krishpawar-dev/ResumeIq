const Job = require('../models/Job');
const JobMatch = require('../models/JobMatch');
const Resume = require('../models/Resume');
const { analyzeJobDescription, validateJobDescription } = require('../services/jobAnalysisService');
const { compareResumeAndJob } = require('../services/jobMatchService');

/**
 * @desc    Analyze job description text and extract structured requirements
 * @route   POST /api/jobs/analyze
 * @access  Private (JWT Protected)
 */
const analyzeJob = async (req, res) => {
  try {
    const { jobDescriptionText, resumeId } = req.body;

    if (!jobDescriptionText) {
      return res.status(400).json({
        status: 'error',
        message: 'Please paste a job description to analyze.'
      });
    }

    // Extract structured requirements
    const extractedData = await analyzeJobDescription(jobDescriptionText);

    // Create Job document
    const job = await Job.create({
      userId: req.user._id,
      resumeId: resumeId || null,
      title: extractedData.title,
      company: extractedData.company,
      jobDescriptionText: extractedData.jobDescriptionText,
      extractedSkills: extractedData.extractedSkills,
      experienceRequired: extractedData.experienceRequired,
      educationRequired: extractedData.educationRequired,
      keyResponsibilities: extractedData.keyResponsibilities,
      metadata: extractedData.metadata
    });

    return res.status(201).json({
      status: 'success',
      message: 'Job description analyzed successfully',
      job
    });
  } catch (error) {
    console.error('[Job Analysis Error]', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to analyze job description.'
    });
  }
};

/**
 * @desc    Compare selected resume against a job and generate weighted match
 * @route   POST /api/jobs/match
 * @access  Private (JWT Protected)
 */
const matchJob = async (req, res) => {
  try {
    const { resumeId, jobId, jobDescriptionText } = req.body;

    if (!resumeId) {
      return res.status(400).json({
        status: 'error',
        message: 'Please select a resume to match against the job description.'
      });
    }

    // 1. Verify Resume ownership
    const resume = await Resume.findOne({
      _id: resumeId,
      userId: req.user._id
    });

    if (!resume) {
      return res.status(404).json({
        status: 'error',
        message: 'Selected resume not found or you do not have permission to access it.'
      });
    }

    if (!resume.parsedText || resume.parsedText.length < 20) {
      return res.status(422).json({
        status: 'error',
        message: 'The selected resume does not contain parsed text to analyze.'
      });
    }

    // 2. Resolve Job (either existing jobId or newly pasted jobDescriptionText)
    let job;
    if (jobId) {
      job = await Job.findOne({
        _id: jobId,
        userId: req.user._id
      });
      if (!job) {
        return res.status(404).json({
          status: 'error',
          message: 'Job record not found or access denied.'
        });
      }
    } else if (jobDescriptionText) {
      const extractedData = await analyzeJobDescription(jobDescriptionText);
      job = await Job.create({
        userId: req.user._id,
        resumeId: resume._id,
        title: extractedData.title,
        company: extractedData.company,
        jobDescriptionText: extractedData.jobDescriptionText,
        extractedSkills: extractedData.extractedSkills,
        experienceRequired: extractedData.experienceRequired,
        educationRequired: extractedData.educationRequired,
        keyResponsibilities: extractedData.keyResponsibilities,
        metadata: extractedData.metadata
      });
    } else {
      return res.status(400).json({
        status: 'error',
        message: 'Please provide either a valid jobId or jobDescriptionText.'
      });
    }

    // 3. Run Weighted Match Intelligence
    const matchResult = await compareResumeAndJob(resume.parsedText, job);

    // 4. Save JobMatch document
    const jobMatch = await JobMatch.create({
      userId: req.user._id,
      resumeId: resume._id,
      jobId: job._id,
      matchPercent: matchResult.matchPercent,
      scoreBreakdown: matchResult.scoreBreakdown,
      weightsApplied: matchResult.weightsApplied,
      matchedSkills: matchResult.matchedSkills,
      missingSkills: matchResult.missingSkills,
      tailoringSuggestions: matchResult.tailoringSuggestions,
      matchSummary: matchResult.matchSummary,
      experienceEvaluation: matchResult.experienceEvaluation,
      projectRelevanceEvaluation: matchResult.projectRelevanceEvaluation
    });

    const populatedMatch = await JobMatch.findById(jobMatch._id)
      .populate('resumeId', 'fileName fileUrl atsScore')
      .populate('jobId', 'title company experienceRequired');

    return res.status(201).json({
      status: 'success',
      message: 'Job match calculated successfully',
      match: populatedMatch,
      job
    });
  } catch (error) {
    console.error('[Job Match Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to calculate job match.'
    });
  }
};

/**
 * @desc    Get user's past job match history
 * @route   GET /api/jobs/matches
 * @access  Private (JWT Protected)
 */
const getJobMatches = async (req, res) => {
  try {
    const matches = await JobMatch.find({ userId: req.user._id })
      .populate('resumeId', 'fileName fileUrl atsScore')
      .populate('jobId', 'title company experienceRequired')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: matches.length,
      matches
    });
  } catch (error) {
    console.error('[Get Job Matches Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve job match history.'
    });
  }
};

/**
 * @desc    Get specific job match by ID
 * @route   GET /api/jobs/matches/:id
 * @access  Private (JWT Protected)
 */
const getJobMatchById = async (req, res) => {
  try {
    const match = await JobMatch.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('resumeId', 'fileName fileUrl atsScore parsedText')
      .populate('jobId', 'title company jobDescriptionText experienceRequired educationRequired keyResponsibilities');

    if (!match) {
      return res.status(404).json({
        status: 'error',
        message: 'Job match not found or access denied.'
      });
    }

    return res.status(200).json({
      status: 'success',
      match
    });
  } catch (error) {
    console.error('[Get Job Match By ID Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve job match details.'
    });
  }
};

/**
 * @desc    Get job description details by ID
 * @route   GET /api/jobs/:id
 * @access  Private (JWT Protected)
 */
const getJobById = async (req, res) => {
  try {
    const job = await Job.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!job) {
      return res.status(404).json({
        status: 'error',
        message: 'Job not found or access denied.'
      });
    }

    return res.status(200).json({
      status: 'success',
      job
    });
  } catch (error) {
    console.error('[Get Job By ID Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve job details.'
    });
  }
};

/**
 * @desc    Delete a job match record
 * @route   DELETE /api/jobs/matches/:id
 * @access  Private (JWT Protected)
 */
const deleteJobMatch = async (req, res) => {
  try {
    const match = await JobMatch.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!match) {
      return res.status(404).json({
        status: 'error',
        message: 'Job match not found or access denied.'
      });
    }

    await JobMatch.deleteOne({ _id: match._id });

    return res.status(200).json({
      status: 'success',
      message: 'Job match deleted successfully.'
    });
  } catch (error) {
    console.error('[Delete Job Match Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete job match.'
    });
  }
};

module.exports = {
  analyzeJob,
  matchJob,
  getJobMatches,
  getJobMatchById,
  getJobById,
  deleteJobMatch
};
