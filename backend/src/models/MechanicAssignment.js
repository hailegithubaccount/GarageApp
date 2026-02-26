const mongoose = require('mongoose');
const { ASSIGNMENT_STATUS } = require('../config/constants');

const mechanicAssignmentSchema = new mongoose.Schema(
    {
        serviceRequest: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'ServiceRequest',
            required: true,
        },
        mechanic: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        assignedDate: {
            type: Date,
            default: Date.now,
        },
        completionDate: {
            type: Date,
        },
        status: {
            type: String,
            enum: Object.values(ASSIGNMENT_STATUS),
            default: ASSIGNMENT_STATUS.ASSIGNED,
        },
        notes: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

mechanicAssignmentSchema.index({ mechanic: 1, status: 1 });
mechanicAssignmentSchema.index({ serviceRequest: 1 });

module.exports = mongoose.model('MechanicAssignment', mechanicAssignmentSchema);
