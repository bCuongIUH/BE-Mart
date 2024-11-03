const mongoose = require('mongoose');

const InvenStockmentSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    auditDate: {
        type: Date,
        default: Date.now
    },
    auditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EmployeeManagement',
        required: true
    },
    lines: [
        {
            stockId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Stock',
                required: true
            },
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product', 
                required: true
            },
            unit: {
                type: String,
                required: true
            },
            adjustmentType: {
                type: String,
                enum: ['increase', 'decrease'],
                required: true
            },
            initialQuantity: {
                type: Number,
                required: true 
            },
            adjustmentQuantity: {
                type: Number,
                required: true 
            },
            updatedQuantity: {
                type: Number,
                required: true 
            },
            reason: {
                type: String,
                required: true
            }
        }
    ],
    isDeleted: {
        type: Boolean,
        default: false
    }
});

const InvenStockment = mongoose.model('InvenStock', InvenStockmentSchema);
module.exports = InvenStockment;
