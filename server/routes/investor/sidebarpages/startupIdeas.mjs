import { Router } from "express";
import mongoose from "mongoose";

import StartupIdeas from "../../../models/StartupIdeas.mjs";
import ProjectDocument from "../../../models/ProjectDocument.mjs";
import { protect, authorize } from "../../../middleware/auth.mjs";

const router = Router();

//  | GET: Fetch all startup ideas for investors


router.get(
  "/investor/startup_ideas",
  protect,
  authorize("investor"),
  async (req, res) => {
    try {
      const startupIdeas = await StartupIdeas.find()
        .populate("startup", "companyName founderName email")
        .populate("projectDocument", "fileName")
        .sort({ createdAt: -1 })
        .lean();

      return res.status(200).json({
        success: true,
        count: startupIdeas.length,
        startupIdeas,
      });
    } catch (error) {
      console.error("Fetch startup ideas error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch startup ideas.",
      });
    }
  }
);


// | GET: Download a startup idea's PDF document


router.get(
  "/investor/startup_ideas/:id/document/download",
  protect,
  authorize("investor"),
  async (req, res) => {
    try {
      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid startup idea ID.",
        });
      }

      // Find startup idea
      const idea = await StartupIdeas.findById(id)
        .select("projectDocument")
        .lean();

      if (!idea) {
        return res.status(404).json({
          success: false,
          message: "Startup idea not found.",
        });
      }

      if (!idea.projectDocument) {
        return res.status(404).json({
          success: false,
          message: "No PDF is attached to this startup idea.",
        });
      }

      // Find stored document
      const pdf = await ProjectDocument.findById(idea.projectDocument)
        .select("fileName fileData")
        .lean();

      if (!pdf || !pdf.fileData) {
        return res.status(404).json({
          success: false,
          message: "PDF file data not found in the database.",
        });
      }

      // Convert the stored binary data to a Buffer
      let fileBuffer;

      if (Buffer.isBuffer(pdf.fileData)) {
        fileBuffer = pdf.fileData;
      } else if (pdf.fileData instanceof Uint8Array) {
        fileBuffer = Buffer.from(pdf.fileData);
      } else if (pdf.fileData.buffer) {
        fileBuffer = Buffer.from(
          pdf.fileData.buffer,
          pdf.fileData.byteOffset || 0,
          pdf.fileData.byteLength
        );
      } else {
        fileBuffer = Buffer.from(pdf.fileData);
      }

      if (fileBuffer.length === 0) {
        return res.status(500).json({
          success: false,
          message: "The stored PDF file is empty.",
        });
      }

      // Confirm that the file begins with the PDF signature
      if (fileBuffer.subarray(0, 5).toString("ascii") !== "%PDF-") {
        console.error("Invalid PDF data:", {
          fileName: pdf.fileName,
          fileSize: fileBuffer.length,
          firstBytes: fileBuffer.subarray(0, 20).toString("hex"),
        });

        return res.status(500).json({
          success: false,
          message:
            "The stored file is not a valid PDF. Upload the PDF again.",
        });
      }

      const fileName = (pdf.fileName || "startup-pitch.pdf")
        .replace(/[\r\n"]/g, "_");

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader(
        "Content-Disposition",
        `attachment; filename="${fileName}"`
      );
      res.setHeader("Content-Length", fileBuffer.length);
      res.setHeader("X-Content-Type-Options", "nosniff");

      return res.status(200).end(fileBuffer);
    } catch (error) {
      console.error("Download startup PDF error:", error);

      if (!res.headersSent) {
        return res.status(500).json({
          success: false,
          message: "Failed to download startup PDF.",
        });
      }
    }
  }
);

//| PATCH: Approve or reject a startup idea
router.patch(
  "/investor/startup_ideas/:id/review",
  protect,
  authorize("investor"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reviewStatus } = req.body;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid startup idea ID.",
        });
      }

      if (!["Approved", "Rejected"].includes(reviewStatus)) {
        return res.status(400).json({
          success: false,
          message: "Review status must be Approved or Rejected.",
        });
      }

      const startupIdea = await StartupIdeas.findByIdAndUpdate(
        id,
        { $set: { reviewStatus } },
        { new: true, runValidators: true }
      )
        .populate("startup", "companyName founderName email")
        .populate("projectDocument", "fileName")
        .lean();

      if (!startupIdea) {
        return res.status(404).json({
          success: false,
          message: "Startup idea not found.",
        });
      }

      return res.status(200).json({
        success: true,
        message: `Startup idea ${reviewStatus.toLowerCase()} successfully.`,
        startupIdea,
      });
    } catch (error) {
      console.error("Review startup idea error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to update startup idea status.",
      });
    }
  }
);

export default router;