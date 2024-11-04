const mongoose = require("mongoose");

const promotionProgramSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
  
  },
  { timestamps: true }
);

const PromotionProgram = mongoose.model(
  "PromotionProgram",
  promotionProgramSchema
);

module.exports = PromotionProgram;
