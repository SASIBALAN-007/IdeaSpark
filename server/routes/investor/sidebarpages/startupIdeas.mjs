
import { Router } from "express";
import mongoose from "mongoose";
import StartupIdeas from "../../../models/StartupIdeas.mjs";
import { protect, authorize } from "../../../middleware/auth.mjs";

const router = Router();

// GET: Investor fetches all startup ideas
router.get(
  "/investor/startup_ideas",
  protect,
  authorize("investor"),
  async (req, res) => {
    try {
      const startupIdeas = await StartupIdeas.find()
        .populate("startup", "companyName founderName email")
        .populate("projectDocument")
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

// PATCH: Investor approves or rejects a startup idea
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
        {
          new: true,
          runValidators: true,
        }
      )
        .populate("startup", "companyName founderName email")
        .populate("projectDocument")
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
