const mongoose = require('mongoose');

const UnitDetailSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  unitLine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UnitLine', // Tham chiếu tới UnitLine
    required: true
  }
});

const UnitDetail = mongoose.model('UnitDetail', UnitDetailSchema);

module.exports = UnitDetail;
