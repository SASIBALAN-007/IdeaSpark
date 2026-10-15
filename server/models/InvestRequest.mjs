import mongoose from "mongoose";

const investmentRequestSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
    },

    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Investor",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 1,
    },

    equityPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },

    purpose: {
      type: String,
      required: true,
      trim: true,
    },

    pitch: {
      type: String,
      required: true,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export default mongoose.model(
  "InvestmentRequest",
  investmentRequestSchema
);
