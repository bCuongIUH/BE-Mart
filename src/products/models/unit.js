const mongoose = require('mongoose');

const UnitSchema = new mongoose.Schema({
  unitName: { 
    type: String, 
    required: true 
},
unitQuantity: {
    type :Number,
    require :true
},
  description: { 
    type: String 
},
}, { timestamps: true });

const Unit = mongoose.model('Unit', UnitSchema);
module.exports = Unit;
