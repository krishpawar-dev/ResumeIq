const Application = require('../models/Application');

const applicationController = {
  /**
   * GET /api/applications
   * Get all applications for the authenticated user with optional filtering
   */
  async getApplications(req, res, next) {
    try {
      const { status, search } = req.query;
      const query = { userId: req.user.id };

      if (status && status !== 'All') {
        query.status = status;
      }

      if (search) {
        query.$or = [
          { company: { $regex: search, $options: 'i' } },
          { role: { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } }
        ];
      }

      const applications = await Application.find(query)
        .populate('resumeId', 'title fileName')
        .sort({ appliedAt: -1, createdAt: -1 });

      return res.status(200).json({
        status: 'success',
        data: {
          applications
        }
      });
    } catch (err) {
      console.error('[Get Applications Error]', err);
      next(err);
    }
  },

  /**
   * GET /api/applications/:id
   * Get single application
   */
  async getApplicationById(req, res, next) {
    try {
      const application = await Application.findOne({
        _id: req.params.id,
        userId: req.user.id
      }).populate('resumeId', 'title fileName parsedText');

      if (!application) {
        return res.status(404).json({
          status: 'error',
          message: 'Application not found.'
        });
      }

      return res.status(200).json({
        status: 'success',
        data: {
          application
        }
      });
    } catch (err) {
      console.error('[Get Application By Id Error]', err);
      next(err);
    }
  },

  /**
   * POST /api/applications
   * Create new job application
   */
  async createApplication(req, res, next) {
    try {
      const {
        company,
        role,
        location,
        jobUrl,
        resumeId,
        status = 'Applied',
        appliedAt,
        nextActionDate,
        notes,
        salaryRange,
        contactName,
        contactEmail,
        source
      } = req.body;

      if (!company || !company.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Company name is required.'
        });
      }

      if (!role || !role.trim()) {
        return res.status(400).json({
          status: 'error',
          message: 'Role title is required.'
        });
      }

      const validStatuses = ['Applied', 'Screening', 'Interview', 'Technical', 'HR', 'Offer', 'Rejected'];
      const normalizedStatus = validStatuses.includes(status) ? status : 'Applied';

      const application = new Application({
        userId: req.user.id,
        company: company.trim(),
        role: role.trim(),
        location: location ? location.trim() : '',
        jobUrl: jobUrl ? jobUrl.trim() : '',
        resumeId: resumeId || null,
        status: normalizedStatus,
        appliedAt: appliedAt ? new Date(appliedAt) : new Date(),
        nextActionDate: nextActionDate ? new Date(nextActionDate) : null,
        notes: notes ? notes.trim() : '',
        salaryRange: salaryRange ? salaryRange.trim() : '',
        contactName: contactName ? contactName.trim() : '',
        contactEmail: contactEmail ? contactEmail.trim() : '',
        source: source ? source.trim() : ''
      });

      await application.save();

      return res.status(201).json({
        status: 'success',
        message: 'Application created successfully.',
        data: {
          application
        }
      });
    } catch (err) {
      console.error('[Create Application Error]', err);
      next(err);
    }
  },

  /**
   * PUT /api/applications/:id
   * Update existing application
   */
  async updateApplication(req, res, next) {
    try {
      const application = await Application.findOne({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!application) {
        return res.status(404).json({
          status: 'error',
          message: 'Application not found or unauthorized.'
        });
      }

      const allowedFields = [
        'company',
        'role',
        'location',
        'jobUrl',
        'resumeId',
        'status',
        'appliedAt',
        'nextActionDate',
        'notes',
        'salaryRange',
        'contactName',
        'contactEmail',
        'source'
      ];

      const validStatuses = ['Applied', 'Screening', 'Interview', 'Technical', 'HR', 'Offer', 'Rejected'];

      allowedFields.forEach((field) => {
        if (req.body[field] !== undefined) {
          if (field === 'status') {
            if (validStatuses.includes(req.body.status)) {
              application.status = req.body.status;
            }
          } else if (field === 'appliedAt' || field === 'nextActionDate') {
            application[field] = req.body[field] ? new Date(req.body[field]) : null;
          } else if (typeof req.body[field] === 'string') {
            application[field] = req.body[field].trim();
          } else {
            application[field] = req.body[field];
          }
        }
      });

      await application.save();

      return res.status(200).json({
        status: 'success',
        message: 'Application updated successfully.',
        data: {
          application
        }
      });
    } catch (err) {
      console.error('[Update Application Error]', err);
      next(err);
    }
  },

  /**
   * DELETE /api/applications/:id
   * Delete application
   */
  async deleteApplication(req, res, next) {
    try {
      const application = await Application.findOneAndDelete({
        _id: req.params.id,
        userId: req.user.id
      });

      if (!application) {
        return res.status(404).json({
          status: 'error',
          message: 'Application not found or unauthorized.'
        });
      }

      return res.status(200).json({
        status: 'success',
        message: 'Application deleted successfully.'
      });
    } catch (err) {
      console.error('[Delete Application Error]', err);
      next(err);
    }
  }
};

module.exports = applicationController;
