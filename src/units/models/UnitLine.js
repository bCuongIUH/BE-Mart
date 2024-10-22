const mongoose = require('mongoose');

const UnitLineSchema = new mongoose.Schema({
    header: {                                 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UnitHeader',
      required: true
    },
    name: { type: String, required: true },    
    description: { type: String },               
    details: [{                                 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'UnitDetail'                        
    }]
  }, { timestamps: true });
  

const UnitLine = mongoose.model('UnitLine', UnitLineSchema);
module.exports = UnitLine;
