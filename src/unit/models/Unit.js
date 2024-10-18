const mongoose = require('mongoose');

const ConversionRateSchema = new mongoose.Schema({
    toUnit: { type: mongoose.Schema.Types.ObjectId, ref: 'Unit', required: true }, // ID của đơn vị quy đổi
    factor: { type: Number, required: true } // Tỉ lệ quy đổi
});

const UnitSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    baseQuantity: { type: Number, required: true },
    conversionRates: [ConversionRateSchema] // Mảng quy đổi
}, { timestamps: true });

const Unit = mongoose.model('Unit', UnitSchema);
module.exports = Unit;