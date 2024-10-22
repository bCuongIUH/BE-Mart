const mongoose = require('mongoose');

const UnitHeaderSchema = new mongoose.Schema({
  name: { type: String, required: true },     // Tên nhóm đơn vị tính
  description: { type: String },               // Mô tả nhóm
  status: { type: Boolean, default: true }     // Trạng thái (active/inactive)
}, { timestamps: true });

const UnitHeader = mongoose.model('UnitHeader', UnitHeaderSchema);
module.exports = UnitHeader;
