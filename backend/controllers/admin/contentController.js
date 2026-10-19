const InterviewCategory = require('../../models/InterviewCategory');
const Skill = require('../../models/Skill');
const JobCategory = require('../../models/JobCategory');
const ResumeTemplate = require('../../models/ResumeTemplate');
const { recordAuditLog } = require('../../services/auditLogService');
const mongoose = require('mongoose');

// ==============================
// INTERVIEW CATEGORIES
// ==============================

const getCategories = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    const showInactive = req.query.showInactive === 'true';
    if (!showInactive) query.isActive = true;

    const [cats, total] = await Promise.all([
      InterviewCategory.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      InterviewCategory.countDocuments(query)
    ]);
    return res.status(200).json({ status: 'success', data: cats, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to list categories.' });
  }
};

const createCategory = async (req, res) => {
  try {
    const { name, description, type } = req.body;
    if (!name) return res.status(400).json({ status: 'error', message: 'Category name is required.' });
    const cat = await InterviewCategory.create({ name: name.trim().slice(0, 80), description: (description || '').trim().slice(0, 500), type: type || 'technical' });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'category.created', resourceType: 'category', resourceId: cat._id, metadata: { name }, ipAddress: req.ip });
    return res.status(201).json({ status: 'success', data: cat });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ status: 'error', message: 'A category with this name already exists.' });
    return res.status(500).json({ status: 'error', message: 'Failed to create category.' });
  }
};

const updateCategory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const updates = {};
    if (req.body.name) updates.name = req.body.name.trim().slice(0, 80);
    if (req.body.description !== undefined) updates.description = req.body.description.trim().slice(0, 500);
    if (req.body.type) updates.type = req.body.type;
    if (req.body.isActive !== undefined) updates.isActive = !!req.body.isActive;
    const cat = await InterviewCategory.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!cat) return res.status(404).json({ status: 'error', message: 'Category not found.' });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'category.updated', resourceType: 'category', resourceId: cat._id, metadata: updates, ipAddress: req.ip });
    return res.status(200).json({ status: 'success', data: cat });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to update category.' });
  }
};

const deleteCategory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    // Soft delete: mark inactive rather than hard delete
    const cat = await InterviewCategory.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true });
    if (!cat) return res.status(404).json({ status: 'error', message: 'Category not found.' });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'category.deactivated', resourceType: 'category', resourceId: cat._id, metadata: { name: cat.name }, ipAddress: req.ip });
    return res.status(200).json({ status: 'success', message: 'Category deactivated successfully.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete category.' });
  }
};

// ==============================
// SKILLS
// ==============================

const getSkills = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const categoryFilter = req.query.category;
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };
    const validCategories = ['programming_language', 'framework', 'database', 'cloud', 'devops', 'tool', 'soft_skill', 'methodology', 'other'];
    if (categoryFilter && validCategories.includes(categoryFilter)) query.category = categoryFilter;
    const showInactive = req.query.showInactive === 'true';
    if (!showInactive) query.isActive = true;

    const [skills, total] = await Promise.all([
      Skill.find(query).sort({ name: 1 }).skip(skip).limit(limit).lean(),
      Skill.countDocuments(query)
    ]);
    return res.status(200).json({ status: 'success', data: skills, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to list skills.' });
  }
};

const createSkill = async (req, res) => {
  try {
    const { name, category, subCategory, aliases, description } = req.body;
    if (!name || !category) return res.status(400).json({ status: 'error', message: 'name and category are required.' });
    const validCategories = ['programming_language', 'framework', 'database', 'cloud', 'devops', 'tool', 'soft_skill', 'methodology', 'other'];
    if (!validCategories.includes(category)) return res.status(400).json({ status: 'error', message: 'Invalid category.' });
    const skill = await Skill.create({ name: name.trim().slice(0, 100), category, subCategory: (subCategory || '').trim(), aliases: Array.isArray(aliases) ? aliases.slice(0, 10) : [], description: (description || '').trim().slice(0, 300) });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'skill.created', resourceType: 'skill', resourceId: skill._id, metadata: { name, category }, ipAddress: req.ip });
    return res.status(201).json({ status: 'success', data: skill });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ status: 'error', message: 'A skill with this name already exists.' });
    return res.status(500).json({ status: 'error', message: 'Failed to create skill.' });
  }
};

const updateSkill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const updates = {};
    if (req.body.name) updates.name = req.body.name.trim().slice(0, 100);
    if (req.body.category) updates.category = req.body.category;
    if (req.body.subCategory !== undefined) updates.subCategory = req.body.subCategory.trim();
    if (Array.isArray(req.body.aliases)) updates.aliases = req.body.aliases.slice(0, 10);
    if (req.body.description !== undefined) updates.description = req.body.description.trim().slice(0, 300);
    if (req.body.isActive !== undefined) updates.isActive = !!req.body.isActive;
    const skill = await Skill.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!skill) return res.status(404).json({ status: 'error', message: 'Skill not found.' });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'skill.updated', resourceType: 'skill', resourceId: skill._id, metadata: updates, ipAddress: req.ip });
    return res.status(200).json({ status: 'success', data: skill });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to update skill.' });
  }
};

const deleteSkill = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const skill = await Skill.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true });
    if (!skill) return res.status(404).json({ status: 'error', message: 'Skill not found.' });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'skill.deactivated', resourceType: 'skill', resourceId: skill._id, metadata: { name: skill.name }, ipAddress: req.ip });
    return res.status(200).json({ status: 'success', message: 'Skill deactivated.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete skill.' });
  }
};

// ==============================
// JOB CATEGORIES
// ==============================

const getJobCategories = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };

    const [cats, total] = await Promise.all([
      JobCategory.find(query).populate('parentCategory', 'name').sort({ name: 1 }).skip(skip).limit(limit).lean(),
      JobCategory.countDocuments(query)
    ]);
    return res.status(200).json({ status: 'success', data: cats, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to list job categories.' });
  }
};

const createJobCategory = async (req, res) => {
  try {
    const { name, description, parentCategory } = req.body;
    if (!name) return res.status(400).json({ status: 'error', message: 'Category name is required.' });
    const cat = await JobCategory.create({ name: name.trim().slice(0, 100), description: (description || '').trim().slice(0, 400), parentCategory: parentCategory || null });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'job_category.created', resourceType: 'job_category', resourceId: cat._id, metadata: { name }, ipAddress: req.ip });
    return res.status(201).json({ status: 'success', data: cat });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ status: 'error', message: 'A job category with this name already exists.' });
    return res.status(500).json({ status: 'error', message: 'Failed to create job category.' });
  }
};

const updateJobCategory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const updates = {};
    if (req.body.name) updates.name = req.body.name.trim().slice(0, 100);
    if (req.body.description !== undefined) updates.description = req.body.description.trim().slice(0, 400);
    if (req.body.isActive !== undefined) updates.isActive = !!req.body.isActive;
    const cat = await JobCategory.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!cat) return res.status(404).json({ status: 'error', message: 'Job category not found.' });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'job_category.updated', resourceType: 'job_category', resourceId: cat._id, metadata: updates, ipAddress: req.ip });
    return res.status(200).json({ status: 'success', data: cat });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to update job category.' });
  }
};

const deleteJobCategory = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const cat = await JobCategory.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true });
    if (!cat) return res.status(404).json({ status: 'error', message: 'Job category not found.' });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'job_category.deactivated', resourceType: 'job_category', resourceId: cat._id, metadata: { name: cat.name }, ipAddress: req.ip });
    return res.status(200).json({ status: 'success', message: 'Job category deactivated.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete job category.' });
  }
};

// ==============================
// RESUME TEMPLATES
// ==============================

const getTemplates = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 20));
    const skip = (page - 1) * limit;
    const search = (req.query.search || '').trim();
    const query = {};
    if (search) query.name = { $regex: search, $options: 'i' };

    const [templates, total] = await Promise.all([
      ResumeTemplate.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      ResumeTemplate.countDocuments(query)
    ]);
    return res.status(200).json({ status: 'success', data: templates, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to list templates.' });
  }
};

const createTemplate = async (req, res) => {
  try {
    const { name, description, layout, sections, style, tags } = req.body;
    if (!name) return res.status(400).json({ status: 'error', message: 'Template name is required.' });
    const template = await ResumeTemplate.create({ name: name.trim().slice(0, 100), description: (description || '').trim().slice(0, 500), layout: layout || 'single_column', sections: Array.isArray(sections) ? sections : ['summary', 'experience', 'education', 'skills'], style: style || {}, tags: Array.isArray(tags) ? tags.slice(0, 10) : [] });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'template.created', resourceType: 'template', resourceId: template._id, metadata: { name }, ipAddress: req.ip });
    return res.status(201).json({ status: 'success', data: template });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ status: 'error', message: 'A template with this name already exists.' });
    return res.status(500).json({ status: 'error', message: 'Failed to create template.' });
  }
};

const updateTemplate = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    const updates = {};
    if (req.body.name) updates.name = req.body.name.trim().slice(0, 100);
    if (req.body.description !== undefined) updates.description = req.body.description.trim().slice(0, 500);
    if (req.body.layout) updates.layout = req.body.layout;
    if (Array.isArray(req.body.sections)) updates.sections = req.body.sections;
    if (req.body.style) updates.style = req.body.style;
    if (Array.isArray(req.body.tags)) updates.tags = req.body.tags.slice(0, 10);
    if (req.body.isActive !== undefined) updates.isActive = !!req.body.isActive;
    const template = await ResumeTemplate.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true });
    if (!template) return res.status(404).json({ status: 'error', message: 'Template not found.' });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'template.updated', resourceType: 'template', resourceId: template._id, metadata: updates, ipAddress: req.ip });
    return res.status(200).json({ status: 'success', data: template });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to update template.' });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ status: 'error', message: 'Invalid ID.' });
    // Soft delete to preserve existing user resumes built on this template
    const template = await ResumeTemplate.findByIdAndUpdate(req.params.id, { $set: { isActive: false } }, { new: true });
    if (!template) return res.status(404).json({ status: 'error', message: 'Template not found.' });
    await recordAuditLog({ adminId: req.user._id, adminName: req.user.name, action: 'template.deactivated', resourceType: 'template', resourceId: template._id, metadata: { name: template.name }, ipAddress: req.ip });
    return res.status(200).json({ status: 'success', message: 'Template deactivated.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: 'Failed to delete template.' });
  }
};

module.exports = {
  getCategories, createCategory, updateCategory, deleteCategory,
  getSkills, createSkill, updateSkill, deleteSkill,
  getJobCategories, createJobCategory, updateJobCategory, deleteJobCategory,
  getTemplates, createTemplate, updateTemplate, deleteTemplate
};
