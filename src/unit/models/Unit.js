const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
    name: { type: String, required: true },
    conversionValue: { type: Number, default: 1 },
    barcode: { type: String, unique: true },
}, { timestamps: true });

const Unit = mongoose.model('Unit', UnitSchema);
module.exports = Unit;
