
import mongoose from "mongoose";

const startupIdeaSchema = new mongoose.Schema(
  {
    // Owner of the idea
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
      index: true,
    },

    // Basic information
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    // Problem and solution
    problemStatement: {
      type: String,
      required: true,
      trim: true,
    },

    solution: {
      type: String,
      required: true,
      trim: true,
    },

    // Business information
    domain: {
      type: String,
      required: true,
      trim: true,
    },

    targetConsumers: {
      type: [String],
      required: true,
      validate: {
        validator: (values) =>
          Array.isArray(values) &&
          values.length > 0 &&
          values.every(
            (value) =>
              typeof value === "string" && value.trim().length > 0
          ),
        message: "Add at least one valid target consumer group",
      },
    },

    businessModel: {
      type: String,
      trim: true,
      default: "",
    },

    stage: {
      type: String,
      enum: ["Idea", "Prototype", "MVP", "Launched"],
      default: "Idea",
    },

    fundingRequired: {
      type: Number,
      min: 0,
      default: 0,
    },

    location: {
      type: String,
      trim: true,
      default: "",
    },

    // Admin review status
    reviewStatus: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },

    // Reference to the uploaded PDF in ProjectDocument collection
    projectDocument: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ProjectDocument",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const StartupIdeas =
  mongoose.models.StartupIdea ||
  mongoose.model("StartupIdea", startupIdeaSchema);

export default StartupIdeas;
