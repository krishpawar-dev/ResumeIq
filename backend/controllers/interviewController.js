const MockInterview = require('../models/MockInterview');
const InterviewQuestion = require('../models/InterviewQuestion');
const InterviewAnswer = require('../models/InterviewAnswer');
const Evaluation = require('../models/Evaluation');
const Resume = require('../models/Resume');

const { generateInterviewQuestions } = require('../services/interviewGenerationService');
const { evaluateInterviewAnswer } = require('../services/interviewEvaluationService');
const { aggregateInterviewReport } = require('../services/interviewScoringService');

/**
 * @desc    Initialize a personalized mock interview session
 * @route   POST /api/interview/start
 * @access  Private (JWT Protected)
 */
const startInterview = async (req, res) => {
  try {
    const {
      targetRole,
      interviewType = 'mixed',
      difficulty = 'mid',
      duration = 30,
      focus = 'fullstack',
      resumeId
    } = req.body;

    if (!targetRole || typeof targetRole !== 'string' || targetRole.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'A target role (e.g. "Senior Full Stack Engineer") is required to personalize your interview.'
      });
    }

    // Validate Enums
    const validTypes = ['technical', 'hr', 'behavioral', 'mixed'];
    const validDifficulties = ['entry', 'mid', 'senior'];
    const validDurations = [30, 45, 60];
    const validFocuses = ['fullstack', 'frontend', 'backend', 'data'];

    const cleanType = validTypes.includes(interviewType) ? interviewType : 'mixed';
    const cleanDifficulty = validDifficulties.includes(difficulty) ? difficulty : 'mid';
    const cleanDuration = validDurations.includes(Number(duration)) ? Number(duration) : 30;
    const cleanFocus = validFocuses.includes(focus) ? focus : 'fullstack';

    // Retrieve candidate's resume
    let targetResume = null;
    if (resumeId) {
      targetResume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    }
    if (!targetResume) {
      targetResume = await Resume.findOne({ userId: req.user._id, status: 'analyzed' }).sort({ uploadedAt: -1 });
    }
    if (!targetResume) {
      targetResume = await Resume.findOne({ userId: req.user._id }).sort({ uploadedAt: -1 });
    }

    if (!targetResume || !targetResume.parsedText) {
      return res.status(400).json({
        status: 'error',
        message: 'Upload a resume before starting a personalized interview.'
      });
    }

    // 1. Create MockInterview document
    const mockInterview = await MockInterview.create({
      userId: req.user._id,
      resumeId: targetResume._id,
      targetRole: targetRole.trim(),
      interviewType: cleanType,
      difficulty: cleanDifficulty,
      duration: cleanDuration,
      focus: cleanFocus,
      status: 'in_progress',
      startedAt: new Date(),
      currentQuestionIndex: 0
    });

    // 2. Generate personalized questions grounded in candidate's resume
    const recentQuestionDocs = await InterviewQuestion.find({
      userId: req.user._id,
      mockInterviewId: { $ne: mockInterview._id }
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .select('questionText -_id');

    const generatedQuestions = await generateInterviewQuestions({
      targetRole: mockInterview.targetRole,
      interviewType: cleanType,
      difficulty: cleanDifficulty,
      duration: cleanDuration,
      focus: cleanFocus,
      resumeText: targetResume.parsedText,
      recentQuestions: recentQuestionDocs.map((q) => q.questionText)
    });

    // 3. Save Question documents
    const createdQuestions = [];
    for (const q of generatedQuestions) {
      const savedQ = await InterviewQuestion.create({
        userId: req.user._id,
        mockInterviewId: mockInterview._id,
        questionText: q.questionText,
        questionType: q.questionType,
        difficulty: q.difficulty,
        focus: q.focus,
        targetRole: q.targetRole,
        expectedTopics: q.expectedTopics || [],
        order: q.order
      });
      createdQuestions.push(savedQ);
    }

    mockInterview.questionIds = createdQuestions.map((q) => q._id);
    await mockInterview.save();

    return res.status(201).json({
      status: 'success',
      message: 'Mock interview session initialized successfully',
      interview: mockInterview,
      currentQuestion: createdQuestions[0],
      totalQuestions: createdQuestions.length
    });
  } catch (error) {
    console.error('[Start Interview Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to initialize mock interview.'
    });
  }
};

/**
 * @desc    Submit an answer for the current question and trigger AI evaluation
 * @route   POST /api/interview/answer
 * @access  Private (JWT Protected)
 */
const submitAnswer = async (req, res) => {
  try {
    const {
      mockInterviewId,
      questionId,
      answerText,
      timeSpentSeconds = 0,
      startedAt
    } = req.body;

    if (!mockInterviewId || !questionId || !answerText || typeof answerText !== 'string' || answerText.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'mockInterviewId, questionId, and non-empty answerText are required.'
      });
    }

    // Verify interview session ownership & status
    const interview = await MockInterview.findOne({
      _id: mockInterviewId,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Mock interview session not found or access denied.'
      });
    }

    if (interview.status !== 'in_progress') {
      return res.status(400).json({
        status: 'error',
        message: `This interview session is already ${interview.status}.`
      });
    }

    // Verify question belongs to this interview
    const question = await InterviewQuestion.findOne({
      _id: questionId,
      mockInterviewId: interview._id,
      userId: req.user._id
    });

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found in this interview session.'
      });
    }

    // Guard against duplicate answer submission
    let answer = await InterviewAnswer.findOne({
      mockInterviewId: interview._id,
      questionId: question._id,
      userId: req.user._id
    });

    const submittedAt = new Date();
    const actualTimeSpent = timeSpentSeconds > 0
      ? timeSpentSeconds
      : startedAt
      ? Math.round((submittedAt - new Date(startedAt)) / 1000)
      : 60;

    if (answer) {
      answer.answerText = answerText.trim();
      answer.submittedAt = submittedAt;
      answer.timeSpentSeconds = actualTimeSpent;
      await answer.save();
    } else {
      answer = await InterviewAnswer.create({
        userId: req.user._id,
        mockInterviewId: interview._id,
        questionId: question._id,
        answerText: answerText.trim(),
        startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - actualTimeSpent * 1000),
        submittedAt,
        timeSpentSeconds: actualTimeSpent,
        questionOrder: question.order
      });
    }

    // Retrieve resume context for grounded evaluation
    let resumeContext = '';
    if (interview.resumeId) {
      const resDoc = await Resume.findById(interview.resumeId);
      if (resDoc) resumeContext = resDoc.parsedText;
    }

    // 1. Run AI Evaluation
    const evalResult = await evaluateInterviewAnswer({
      question,
      answerText: answer.answerText,
      targetRole: interview.targetRole,
      resumeContext
    });

    // 2. Persist Evaluation record
    let evaluation = await Evaluation.findOne({
      mockInterviewId: interview._id,
      questionId: question._id,
      userId: req.user._id
    });

    if (evaluation) {
      Object.assign(evaluation, evalResult);
      await evaluation.save();
    } else {
      evaluation = await Evaluation.create({
        userId: req.user._id,
        mockInterviewId: interview._id,
        questionId: question._id,
        answerId: answer._id,
        ...evalResult
      });
    }

    // 3. Advance to next question or complete interview
    const nextIndex = interview.currentQuestionIndex + 1;
    const totalQuestions = interview.questionIds.length;

    let isFinished = false;
    let nextQuestion = null;

    if (nextIndex >= totalQuestions) {
      // Completed interview! Aggregate overall performance
      interview.status = 'completed';
      interview.completedAt = new Date();

      const allEvaluations = await Evaluation.find({
        mockInterviewId: interview._id,
        userId: req.user._id
      });

      const aggregated = aggregateInterviewReport(allEvaluations);
      interview.overallScore = aggregated.overallScore;
      interview.overallStrengths = aggregated.overallStrengths;
      interview.overallWeaknesses = aggregated.overallWeaknesses;
      await interview.save();

      isFinished = true;
    } else {
      interview.currentQuestionIndex = nextIndex;
      await interview.save();

      const nextQuestionId = interview.questionIds[nextIndex];
      nextQuestion = await InterviewQuestion.findById(nextQuestionId);
    }

    return res.status(200).json({
      status: 'success',
      message: isFinished ? 'Interview completed successfully' : 'Answer recorded and evaluated',
      answer,
      evaluation,
      nextQuestion,
      nextQuestionIndex: interview.currentQuestionIndex,
      isFinished,
      overallScore: interview.overallScore
    });
  } catch (error) {
    console.error('[Submit Answer Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to evaluate answer. Your submitted answer remains saved.'
    });
  }
};

/**
 * @desc    Get detailed report of a mock interview session
 * @route   GET /api/interview/:id
 * @access  Private (JWT Protected)
 */
const getInterviewById = async (req, res) => {
  try {
    const interview = await MockInterview.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!interview) {
      return res.status(404).json({
        status: 'error',
        message: 'Mock interview session not found or you do not have permission to view it.'
      });
    }

    // Fetch associated questions in order
    const questions = await InterviewQuestion.find({
      mockInterviewId: interview._id,
      userId: req.user._id
    }).sort({ order: 1 });

    // Fetch answers
    const answers = await InterviewAnswer.find({
      mockInterviewId: interview._id,
      userId: req.user._id
    }).sort({ questionOrder: 1 });

    // Fetch evaluations
    const evaluations = await Evaluation.find({
      mockInterviewId: interview._id,
      userId: req.user._id
    });

    // Compile comprehensive report
    const aggregated = aggregateInterviewReport(evaluations);

    // Map per-question detailed reports
    const perQuestionReports = questions.map((q) => {
      const ans = answers.find((a) => String(a.questionId) === String(q._id));
      const ev = evaluations.find((e) => String(e.questionId) === String(q._id));
      return {
        question: q,
        answer: ans || null,
        evaluation: ev || null
      };
    });

    return res.status(200).json({
      status: 'success',
      interview,
      questions,
      answers,
      evaluations,
      report: {
        overallScore: interview.overallScore !== null ? interview.overallScore : aggregated.overallScore,
        averageScores: aggregated.averageScores,
        overallStrengths: interview.overallStrengths?.length > 0 ? interview.overallStrengths : aggregated.overallStrengths,
        overallWeaknesses: interview.overallWeaknesses?.length > 0 ? interview.overallWeaknesses : aggregated.overallWeaknesses,
        perQuestionReports
      }
    });
  } catch (error) {
    console.error('[Get Interview By ID Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve interview session details.'
    });
  }
};

/**
 * @desc    Get user's mock interview history
 * @route   GET /api/interview/history
 * @access  Private (JWT Protected)
 */
const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await MockInterview.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: interviews.length,
      interviews
    });
  } catch (error) {
    console.error('[Get Interview History Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve interview history.'
    });
  }
};

/**
 * @desc    Generate personalized interview questions preview
 * @route   POST /api/interview/generate
 * @access  Private (JWT Protected)
 */
const generateQuestions = async (req, res) => {
  try {
    const {
      targetRole = 'Software Engineer',
      interviewType = 'mixed',
      difficulty = 'mid',
      duration = 30,
      focus = 'fullstack',
      resumeId
    } = req.body;

    let targetResume = null;
    if (resumeId) {
      targetResume = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    }
    if (!targetResume) {
      targetResume = await Resume.findOne({ userId: req.user._id }).sort({ uploadedAt: -1 });
    }

    const recentQuestionDocs = await InterviewQuestion.find({
      userId: req.user._id
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .select('questionText -_id');

    const questions = await generateInterviewQuestions({
      targetRole,
      interviewType,
      difficulty,
      duration: Number(duration) || 30,
      focus,
      resumeText: targetResume?.parsedText || '',
      recentQuestions: recentQuestionDocs.map((q) => q.questionText)
    });

    return res.status(200).json({
      status: 'success',
      questions
    });
  } catch (error) {
    console.error('[Generate Questions Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to generate interview questions.'
    });
  }
};

module.exports = {
  startInterview,
  submitAnswer,
  getInterviewById,
  getInterviewHistory,
  generateQuestions
};
