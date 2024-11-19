const mongoose = require('mongoose');

const PriceListSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    isDeleted: { type: Boolean, default: false },
    products: [
        {
            productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            prices: [
                {
                    unitName: { type: String, required: true },
                    price: { type: Number, required: true }
                }
            ]
        }
    ],
}, { timestamps: true });

// Pre-save middleware to increment startDate by 1 second for new documents
PriceListSchema.pre('save', function (next) {
    if (this.isNew) {
        this.startDate = new Date(this.startDate.getTime() + 1000);
    }
    next();
});

const PriceList = mongoose.model('PriceList', PriceListSchema);

module.exports = PriceList;
