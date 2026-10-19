const PracticeSession = require('../models/PracticeSession');
const InterviewQuestion = require('../models/InterviewQuestion');
const InterviewAnswer = require('../models/InterviewAnswer');
const Evaluation = require('../models/Evaluation');
const Resume = require('../models/Resume');
const CommunityQuestionSet = require('../models/CommunityQuestionSet');

const {
  generateFlashcardQuestions,
  generateTimedQuestions,
  generateCategoryQuestions,
  generateCompanyQuestions,
  loadCommunityQuestions
} = require('../services/practiceQuestionService');

const { evaluateInterviewAnswer } = require('../services/interviewEvaluationService');

/**
 * @desc    Start a practice session (Flashcard, Timed, Category, Company, Community)
 * @route   POST /api/interview/practice/start
 * @access  Private (JWT Protected)
 */
const startPracticeSession = async (req, res) => {
  try {
    const {
      sessionType,
      targetRole = 'Software Engineer',
      resumeId,
      duration = 15,
      category = 'technical',
      companyName = 'Tech Company',
      questionSetId,
      difficulty = 'mid',
      focus = 'fullstack'
    } = req.body;

    const validTypes = ['flashcard', 'timed', 'category', 'company', 'community'];
    if (!validTypes.includes(sessionType)) {
      return res.status(400).json({
        status: 'error',
        message: `Invalid sessionType. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Retrieve resume context if available
    let resumeDoc = null;
    if (resumeId) {
      resumeDoc = await Resume.findOne({ _id: resumeId, userId: req.user._id });
    }
    if (!resumeDoc) {
      resumeDoc = await Resume.findOne({ userId: req.user._id, status: 'analyzed' }).sort({ uploadedAt: -1 });
    }
    if (!resumeDoc) {
      resumeDoc = await Resume.findOne({ userId: req.user._id }).sort({ uploadedAt: -1 });
    }

    const resumeText = resumeDoc ? resumeDoc.parsedText : '';

    const recentQuestionDocs = await InterviewQuestion.find({
      userId: req.user._id
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .select('questionText -_id');

    // 1. Generate mode-specific questions
    let questionsData = [];

    switch (sessionType) {
      case 'flashcard':
        questionsData = await generateFlashcardQuestions({ targetRole, resumeText, difficulty, recentQuestions: recentQuestionDocs.map((q) => q.questionText), focus });
        break;
      case 'timed':
        questionsData = await generateTimedQuestions({ targetRole, resumeText, difficulty, duration: Number(duration) || 15, recentQuestions: recentQuestionDocs.map((q) => q.questionText), focus });
        break;
      case 'category':
        questionsData = await generateCategoryQuestions({ category, targetRole, resumeText, difficulty, recentQuestions: recentQuestionDocs.map((q) => q.questionText), focus });
        break;
      case 'company':
        questionsData = await generateCompanyQuestions({ companyName, targetRole, resumeText, difficulty, recentQuestions: recentQuestionDocs.map((q) => q.questionText), focus });
        break;
      case 'community':
        if (!questionSetId) {
          return res.status(400).json({ status: 'error', message: 'questionSetId is required for Community practice mode.' });
        }
        questionsData = await loadCommunityQuestions(questionSetId);
        break;
    }

    if (!questionsData || questionsData.length === 0) {
      throw new Error('No practice questions could be generated.');
    }

    // 2. Create PracticeSession document
    const practiceSession = await PracticeSession.create({
      userId: req.user._id,
      sessionType,
      status: 'in_progress',
      targetRole,
      difficulty: ['entry', 'mid', 'senior'].includes(difficulty) ? difficulty : 'mid',
      focus: ['fullstack', 'frontend', 'backend', 'data'].includes(focus) ? focus : 'fullstack',
      resumeId: resumeDoc ? resumeDoc._id : null,
      companyName: sessionType === 'company' ? companyName : '',
      category: sessionType === 'category' ? category : 'mixed',
      questionSetId: sessionType === 'community' ? questionSetId : null,
      duration: sessionType === 'timed' ? Number(duration) : 0,
      currentQuestionIndex: 0,
      questionsAnswered: 0,
      startedAt: new Date()
    });

    // 3. Save Question records linked to PracticeSession
    const createdQuestions = [];
    for (const q of questionsData) {
      const savedQ = await InterviewQuestion.create({
        userId: req.user._id,
        practiceSessionId: practiceSession._id,
        questionText: q.questionText,
        questionType: q.questionType,
        difficulty: q.difficulty,
        focus: q.focus || 'fullstack',
        targetRole: q.targetRole || targetRole,
        expectedTopics: q.expectedTopics || [],
        order: q.order
      });
      createdQuestions.push(savedQ);
    }

    practiceSession.questionIds = createdQuestions.map((q) => q._id);
    await practiceSession.save();

    return res.status(201).json({
      status: 'success',
      message: 'Practice session initialized',
      session: practiceSession,
      currentQuestion: createdQuestions[0],
      totalQuestions: createdQuestions.length
    });
  } catch (error) {
    console.error('[Start Practice Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to start practice session.'
    });
  }
};

/**
 * @desc    Submit an answer for current practice question and trigger AI evaluation
 * @route   POST /api/interview/practice/:id/answer
 * @access  Private (JWT Protected)
 */
const submitPracticeAnswer = async (req, res) => {
  try {
    const practiceSessionId = req.params.id;
    const { questionId, answerText, timeSpentSeconds = 0, startedAt } = req.body;

    if (!questionId || !answerText || typeof answerText !== 'string' || answerText.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        message: 'questionId and non-empty answerText are required.'
      });
    }

    // Verify session ownership
    const session = await PracticeSession.findOne({
      _id: practiceSessionId,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({
        status: 'error',
        message: 'Practice session not found or access denied.'
      });
    }

    if (session.status !== 'in_progress') {
      return res.status(400).json({
        status: 'error',
        message: `This practice session is already ${session.status}.`
      });
    }

    // Verify question belongs to this practice session
    const question = await InterviewQuestion.findOne({
      _id: questionId,
      practiceSessionId: session._id,
      userId: req.user._id
    });

    if (!question) {
      return res.status(404).json({
        status: 'error',
        message: 'Question not found in this practice session.'
      });
    }

    // Save answer
    const submittedAt = new Date();
    const actualTime = timeSpentSeconds > 0
      ? timeSpentSeconds
      : startedAt
      ? Math.round((submittedAt - new Date(startedAt)) / 1000)
      : 45;

    let answer = await InterviewAnswer.findOne({
      practiceSessionId: session._id,
      questionId: question._id,
      userId: req.user._id
    });

    if (answer) {
      answer.answerText = answerText.trim();
      answer.submittedAt = submittedAt;
      answer.timeSpentSeconds = actualTime;
      await answer.save();
    } else {
      answer = await InterviewAnswer.create({
        userId: req.user._id,
        practiceSessionId: session._id,
        questionId: question._id,
        answerText: answerText.trim(),
        startedAt: startedAt ? new Date(startedAt) : new Date(Date.now() - actualTime * 1000),
        submittedAt,
        timeSpentSeconds: actualTime,
        questionOrder: question.order
      });
    }

    // Resume context
    let resumeContext = '';
    if (session.resumeId) {
      const resDoc = await Resume.findById(session.resumeId);
      if (resDoc) resumeContext = resDoc.parsedText;
    }

    // Evaluate answer through the shared Part 5 evaluation pipeline!
    const evalResult = await evaluateInterviewAnswer({
      question,
      answerText: answer.answerText,
      targetRole: session.targetRole,
      resumeContext
    });

    // Save Evaluation
    let evaluation = await Evaluation.findOne({
      practiceSessionId: session._id,
      questionId: question._id,
      userId: req.user._id
    });

    if (evaluation) {
      Object.assign(evaluation, evalResult);
      await evaluation.save();
    } else {
      evaluation = await Evaluation.create({
        userId: req.user._id,
        practiceSessionId: session._id,
        questionId: question._id,
        answerId: answer._id,
        ...evalResult
      });
    }

    // Update session metrics
    const allEvaluations = await Evaluation.find({
      practiceSessionId: session._id,
      userId: req.user._id
    });

    session.questionsAnswered = allEvaluations.length;
    const scoreSum = allEvaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0);
    session.averageScore = Math.round((scoreSum / allEvaluations.length) * 10) / 10;

    // Advance question index
    const nextIdx = session.currentQuestionIndex + 1;
    const totalQuestions = session.questionIds.length;
    let isFinished = false;
    let nextQuestion = null;

    if (nextIdx >= totalQuestions) {
      isFinished = true;
      session.status = 'completed';
      session.completedAt = new Date();
    } else {
      session.currentQuestionIndex = nextIdx;
      const nextQuestionId = session.questionIds[nextIdx];
      nextQuestion = await InterviewQuestion.findById(nextQuestionId);
    }

    await session.save();

    return res.status(200).json({
      status: 'success',
      answer,
      evaluation,
      nextQuestion,
      isFinished,
      sessionSummary: {
        questionsAnswered: session.questionsAnswered,
        totalQuestions,
        averageScore: session.averageScore,
        sessionType: session.sessionType,
        status: session.status
      }
    });
  } catch (error) {
    console.error('[Submit Practice Answer Error]', error);
    return res.status(500).json({
      status: 'error',
      message: error.message || 'Failed to evaluate answer.'
    });
  }
};

/**
 * @desc    Complete a practice session early or on timer expiry
 * @route   POST /api/interview/practice/:id/complete
 * @access  Private (JWT Protected)
 */
const completePracticeSession = async (req, res) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ status: 'error', message: 'Practice session not found.' });
    }

    session.status = 'completed';
    session.completedAt = new Date();

    const evaluations = await Evaluation.find({ practiceSessionId: session._id, userId: req.user._id });
    if (evaluations.length > 0) {
      const scoreSum = evaluations.reduce((sum, e) => sum + (e.overallScore || 0), 0);
      session.averageScore = Math.round((scoreSum / evaluations.length) * 10) / 10;
      session.questionsAnswered = evaluations.length;

      // Identify strongest criterion and area to improve
      let totalRel = 0, totalClar = 0, totalStar = 0, totalTech = 0, totalComp = 0;
      evaluations.forEach((ev) => {
        totalRel += ev.relevanceScore || 0;
        totalClar += ev.clarityScore || 0;
        totalStar += ev.starScore || 0;
        totalTech += ev.technicalAccuracyScore || 0;
        totalComp += ev.completenessScore || 0;
      });

      const avgScores = {
        'Relevance': totalRel / evaluations.length,
        'Clarity': totalClar / evaluations.length,
        'STAR Structure': totalStar / evaluations.length,
        'Technical Accuracy': totalTech / evaluations.length,
        'Completeness': totalComp / evaluations.length
      };

      const sorted = Object.entries(avgScores).sort((a, b) => b[1] - a[1]);
      session.strongestArea = sorted[0][0];
      session.areaToImprove = sorted[sorted.length - 1][0];
    }

    await session.save();

    return res.status(200).json({
      status: 'success',
      session,
      summary: {
        questionsAnswered: session.questionsAnswered,
        averageScore: session.averageScore || 0,
        strongestArea: session.strongestArea || 'Technical Knowledge',
        areaToImprove: session.areaToImprove || 'STAR Structure',
        sessionType: session.sessionType
      }
    });
  } catch (error) {
    console.error('[Complete Practice Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to complete practice session.' });
  }
};

/**
 * @desc    Get practice session details
 * @route   GET /api/interview/practice/:id
 * @access  Private (JWT Protected)
 */
const getPracticeSessionById = async (req, res) => {
  try {
    const session = await PracticeSession.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!session) {
      return res.status(404).json({ status: 'error', message: 'Practice session not found.' });
    }

    const [questions, answers, evaluations] = await Promise.all([
      InterviewQuestion.find({ practiceSessionId: session._id, userId: req.user._id }).sort({ order: 1 }),
      InterviewAnswer.find({ practiceSessionId: session._id, userId: req.user._id }).sort({ questionOrder: 1 }),
      Evaluation.find({ practiceSessionId: session._id, userId: req.user._id })
    ]);

    return res.status(200).json({
      status: 'success',
      session,
      questions,
      answers,
      evaluations
    });
  } catch (error) {
    console.error('[Get Practice Session Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve practice session.' });
  }
};

/**
 * @desc    Get user's practice session history
 * @route   GET /api/interview/practice/history
 * @access  Private (JWT Protected)
 */
const getPracticeHistory = async (req, res) => {
  try {
    const sessions = await PracticeSession.find({
      userId: req.user._id
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      status: 'success',
      count: sessions.length,
      sessions
    });
  } catch (error) {
    console.error('[Get Practice History Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to retrieve practice history.' });
  }
};

module.exports = {
  startPracticeSession,
  submitPracticeAnswer,
  completePracticeSession,
  getPracticeSessionById,
  getPracticeHistory
};
