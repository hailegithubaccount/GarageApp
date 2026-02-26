const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        action: {
            type: String,
            required: true,
            trim: true,
        },
        entityType: {
            type: String,
            trim: true,
        },
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
        },
        details: {
            type: String,
            trim: true,
        },
        ipAddress: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

auditLogSchema.index({ user: 1 });
auditLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema);
