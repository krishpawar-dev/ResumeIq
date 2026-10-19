const InterviewQuestion = require('../../models/InterviewQuestion');
const { recordAuditLog } = require('../../services/auditLogService');
const mongoose = require('mongoose');

/**
 * @desc    List interview questions with search, filter, pagination
 * @route   GET /api/admin/questions
 */
const getQuestions = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const typeFilter = req.query.type;
    const difficultyFilter = req.query.difficulty;
    const focusFilter = req.query.focus;

    const query = {};

    if (search) {
      query.questionText = { $regex: search, $options: 'i' };
    }

    const validTypes = ['technical', 'behavioral', 'hr', 'situational', 'project', 'mixed'];
    if (typeFilter && validTypes.includes(typeFilter)) {
      query.questionType = typeFilter;
    }

    const validDifficulties = ['entry', 'mid', 'senior'];
    if (difficultyFilter && validDifficulties.includes(difficultyFilter)) {
      query.difficulty = difficultyFilter;
    }

    if (focusFilter) {
      query.focus = focusFilter;
    }

    const [questions, total] = await Promise.all([
      InterviewQuestion.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .lean(),
      InterviewQuestion.countDocuments(query)
    ]);

    return res.status(200).json({
      status: 'success',
      data: questions,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('[Admin Questions List Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to list questions.' });
  }
};

/**
 * @desc    Get single question
 * @route   GET /api/admin/questions/:id
 */
const getQuestionById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid question ID.' });
    }

    const question = await InterviewQuestion.findById(req.params.id)
      .populate('userId', 'name email')
      .lean();

    if (!question) return res.status(404).json({ status: 'error', message: 'Question not found.' });

    return res.status(200).json({ status: 'success', data: question });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: 'Failed to get question.' });
  }
};

/**
 * @desc    Create interview question
 * @route   POST /api/admin/questions
 */
const createQuestion = async (req, res) => {
  try {
    const { questionText, questionType, difficulty, focus, targetRole, expectedTopics } = req.body;

    if (!questionText || !questionType || !difficulty) {
      return res.status(400).json({
        status: 'error',
        message: 'questionText, questionType, and difficulty are required.'
      });
    }

    const validTypes = ['technical', 'behavioral', 'hr', 'situational', 'project', 'mixed'];
    const validDifficulties = ['entry', 'mid', 'senior'];

    if (!validTypes.includes(questionType)) {
      return res.status(400).json({ status: 'error', message: 'Invalid questionType.' });
    }
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ status: 'error', message: 'Invalid difficulty.' });
    }

    const question = await InterviewQuestion.create({
      userId: req.user._id,
      questionText: questionText.trim().slice(0, 2000),
      questionType,
      difficulty,
      focus: focus || 'fullstack',
      targetRole: (targetRole || '').trim().slice(0, 100),
      expectedTopics: Array.isArray(expectedTopics) ? expectedTopics.slice(0, 10) : [],
      order: 0
    });

    await recordAuditLog({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'question.created',
      resourceType: 'question',
      resourceId: question._id,
      metadata: { questionType, difficulty },
      ipAddress: req.ip
    });

    return res.status(201).json({ status: 'success', data: question });
  } catch (error) {
    console.error('[Admin Create Question Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to create question.' });
  }
};

/**
 * @desc    Update interview question
 * @route   PUT /api/admin/questions/:id
 */
const updateQuestion = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid question ID.' });
    }

    const allowedUpdates = {};
    const { questionText, questionType, difficulty, focus, targetRole, expectedTopics } = req.body;

    if (questionText) allowedUpdates.questionText = questionText.trim().slice(0, 2000);
    if (questionType) {
      if (!['technical', 'behavioral', 'hr', 'situational', 'project', 'mixed'].includes(questionType)) {
        return res.status(400).json({ status: 'error', message: 'Invalid questionType.' });
      }
      allowedUpdates.questionType = questionType;
    }
    if (difficulty) {
      if (!['entry', 'mid', 'senior'].includes(difficulty)) {
        return res.status(400).json({ status: 'error', message: 'Invalid difficulty.' });
      }
      allowedUpdates.difficulty = difficulty;
    }
    if (focus) allowedUpdates.focus = focus;
    if (targetRole !== undefined) allowedUpdates.targetRole = targetRole.trim().slice(0, 100);
    if (Array.isArray(expectedTopics)) allowedUpdates.expectedTopics = expectedTopics.slice(0, 10);

    const question = await InterviewQuestion.findByIdAndUpdate(
      req.params.id,
      { $set: allowedUpdates },
      { new: true, runValidators: true }
    );

    if (!question) return res.status(404).json({ status: 'error', message: 'Question not found.' });

    await recordAuditLog({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'question.updated',
      resourceType: 'question',
      resourceId: question._id,
      metadata: allowedUpdates,
      ipAddress: req.ip
    });

    return res.status(200).json({ status: 'success', data: question });
  } catch (error) {
    console.error('[Admin Update Question Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to update question.' });
  }
};

/**
 * @desc    Delete interview question
 * @route   DELETE /api/admin/questions/:id
 */
const deleteQuestion = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ status: 'error', message: 'Invalid question ID.' });
    }

    const question = await InterviewQuestion.findById(req.params.id);
    if (!question) return res.status(404).json({ status: 'error', message: 'Question not found.' });

    await InterviewQuestion.deleteOne({ _id: question._id });

    await recordAuditLog({
      adminId: req.user._id,
      adminName: req.user.name,
      action: 'question.deleted',
      resourceType: 'question',
      resourceId: question._id,
      metadata: { questionText: question.questionText.slice(0, 80) },
      ipAddress: req.ip
    });

    return res.status(200).json({ status: 'success', message: 'Question deleted successfully.' });
  } catch (error) {
    console.error('[Admin Delete Question Error]', error);
    return res.status(500).json({ status: 'error', message: 'Failed to delete question.' });
  }
};

module.exports = { getQuestions, getQuestionById, createQuestion, updateQuestion, deleteQuestion };
