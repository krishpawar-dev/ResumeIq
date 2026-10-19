const {
  getAccessibleSets,
  createQuestionSet,
  updateQuestionSet,
  deleteQuestionSet
} = require('../services/communityQuestionSetService');

/**
 * @desc    Get user's question sets and public community sets
 * @route   GET /api/interview/community/sets
 * @access  Private (JWT Protected)
 */
const getQuestionSets = async (req, res) => {
  try {
    const { mySets, publicSets } = await getAccessibleSets(req.user._id);
    return res.status(200).json({
      status: 'success',
      mySets,
      publicSets
    });
  } catch (error) {
    console.error('[Get Community Sets Error]', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve community question sets.'
    });
  }
};

/**
 * @desc    Create a new user-owned question set
 * @route   POST /api/interview/community/sets
 * @access  Private (JWT Protected)
 */
const createSet = async (req, res) => {
  try {
    const set = await createQuestionSet(req.user._id, req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Question set created successfully',
      set
    });
  } catch (error) {
    console.error('[Create Community Set Error]', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to create question set.'
    });
  }
};

/**
 * @desc    Update a user-owned question set
 * @route   PUT /api/interview/community/sets/:id
 * @access  Private (JWT Protected)
 */
const updateSet = async (req, res) => {
  try {
    const set = await updateQuestionSet(req.user._id, req.params.id, req.body);
    return res.status(200).json({
      status: 'success',
      message: 'Question set updated successfully',
      set
    });
  } catch (error) {
    console.error('[Update Community Set Error]', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to update question set.'
    });
  }
};

/**
 * @desc    Delete a user-owned question set
 * @route   DELETE /api/interview/community/sets/:id
 * @access  Private (JWT Protected)
 */
const deleteSet = async (req, res) => {
  try {
    await deleteQuestionSet(req.user._id, req.params.id);
    return res.status(200).json({
      status: 'success',
      message: 'Question set deleted successfully'
    });
  } catch (error) {
    console.error('[Delete Community Set Error]', error);
    return res.status(400).json({
      status: 'error',
      message: error.message || 'Failed to delete question set.'
    });
  }
};

module.exports = {
  getQuestionSets,
  createSet,
  updateSet,
  deleteSet
};
