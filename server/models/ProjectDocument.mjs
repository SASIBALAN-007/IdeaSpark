import mongoose from "mongoose";

// Stores the PDF documentation uploaded for a startup idea.
// A StartupIdea references its document via the `projectDocument` field.
const projectDocumentSchema = new mongoose.Schema(
  {
    // Owner of the document (the startup that uploaded it)
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Startup",
      required: true,
      index: true,
    },

    // The idea this document belongs to
    idea: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "StartupIdea",
      default: null,
      index: true,
    },

    // Original filename as uploaded
    fileName: {
      type: String,
      required: true,
      trim: true,
    },

    // Raw file contents (PDF)
    fileData: {
      type: Buffer,
      required: true,
    },

    mimeType: {
      type: String,
      default: "application/pdf",
    },

    size: {
      type: Number,
      min: 0,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("ProjectDocument", projectDocumentSchema);
