const mongoose = require('mongoose');

const inventoryUsageSchema = new mongoose.Schema(
    {
        assignment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'MechanicAssignment',
            required: true,
        },
        item: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Inventory',
            required: true,
        },
        quantityUsed: {
            type: Number,
            required: true,
            min: 1,
        },
    },
    {
        timestamps: true,
    }
);

inventoryUsageSchema.index({ assignment: 1 });

module.exports = mongoose.model('InventoryUsage', inventoryUsageSchema);
