const AdminAuditLog = require('../models/AdminAuditLog');

/**
 * Record an admin action to the audit log.
 * Fire-and-forget — does not block the response.
 */
const recordAuditLog = async ({ adminId, adminName, action, resourceType, resourceId, metadata = {}, ipAddress = '' }) => {
  try {
    await AdminAuditLog.create({
      adminId,
      adminName,
      action,
      resourceType,
      resourceId: resourceId || null,
      metadata,
      ipAddress
    });
  } catch (err) {
    // Audit log failure should never block the main operation
    console.error('[Audit Log Error]', err.message);
  }
};

module.exports = { recordAuditLog };
