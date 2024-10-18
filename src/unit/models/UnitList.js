const mongoose = require('mongoose');

const UnitListSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    createdBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' } ,
    description: { type: String },
    isActive: { type: Boolean, default: true },
    units: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Unit' }] 
}, { timestamps: true });

const UnitList = mongoose.model('UnitList', UnitListSchema);
module.exports = UnitList;