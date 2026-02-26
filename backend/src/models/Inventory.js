const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
    {
        garage: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Garage',
            required: true,
        },
        itemName: {
            type: String,
            required: [true, 'Item name is required'],
            trim: true,
            maxlength: 100,
        },
        description: {
            type: String,
            trim: true,
        },
        quantity: {
            type: Number,
            required: true,
            default: 0,
            min: 0,
        },
        unitPrice: {
            type: Number,
            min: 0,
        },
        minimumStock: {
            type: Number,
            default: 5,
            min: 0,
        },
        supplier: {
            type: String,
            trim: true,
        },
    },
    {
        timestamps: true,
    }
);

inventorySchema.index({ garage: 1 });

module.exports = mongoose.model('Inventory', inventorySchema);
