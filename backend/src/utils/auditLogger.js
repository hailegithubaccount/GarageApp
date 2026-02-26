const AuditLog = require('../models/AuditLog');

/**
 * Create an audit log entry
 */
const createAuditLog = async ({ userId, action, entityType, entityId, details, ipAddress }) => {
    try {
        await AuditLog.create({
            user: userId,
            action,
            entityType,
            entityId,
            details,
            ipAddress,
        });
    } catch (error) {
        console.error('Failed to create audit log:', error.message);
    }
};

module.exports = { createAuditLog };
