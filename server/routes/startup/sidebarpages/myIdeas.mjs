
import { Router } from "express";
import mongoose from "mongoose";

import StartupIdeas from "../../../models/StartupIdeas.mjs";
import ProjectDocument from "../../../models/ProjectDocument.mjs";
import { protect } from "../../../middleware/auth.mjs";

const router = Router();


// GET: List projects owned by the logged-in startup
// GET /api/startup/ideas
router.get("/startup/ideas", protect, async (req, res) => {
  try {
    if (req.user?.role !== "startup") {
      return res.status(403).json({
        message: "Only startups can view their projects",
      });
    }

    const projects = await StartupIdeas.find({
      startup: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({ projects });
  } catch (error) {
    console.error("Fetch startup projects error:", error);

    return res.status(500).json({
      message: "Failed to fetch startup projects",
    });
  }
});

// PATCH: Edit an existing startup idea
// PATCH /api/startup/ideas/:id
router.patch("/startup/ideas/:id", protect, async (req, res) => {
  try {
    if (req.user?.role !== "startup") {
      return res.status(403).json({
        message: "Only startups can edit projects",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    // Only allow these fields to be updated
    const allowedFields = [
      "title",
      "shortDescription",
      "problemStatement",
      "solution",
      "domain",
      "targetConsumers",
      "businessModel",
      "stage",
      "fundingRequired",
      "location",
    ];

    const updates = {};

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    // Validate values before saving
    if (
      updates.title !== undefined &&
      (typeof updates.title !== "string" ||
        !updates.title.trim() ||
        updates.title.length > 150)
    ) {
      return res.status(400).json({
        message: "Title is required and must be under 150 characters",
      });
    }

    if (
      updates.shortDescription !== undefined &&
      (typeof updates.shortDescription !== "string" ||
        !updates.shortDescription.trim() ||
        updates.shortDescription.length > 100)
    ) {
      return res.status(400).json({
        message: "Provide a valid short description under 100 characters",
      });
    }

    if (
      updates.fundingRequired !== undefined &&
      (!Number.isFinite(Number(updates.fundingRequired)) ||
        Number(updates.fundingRequired) < 0)
    ) {
      return res.status(400).json({
        message: "Funding required must be a non-negative number",
      });
    }

    if (
      updates.stage !== undefined &&
      !["Idea", "Prototype", "MVP", "Launched"].includes(updates.stage)
    ) {
      return res.status(400).json({
        message: "Invalid project stage",
      });
    }

    if (updates.targetConsumers !== undefined) {
      if (
        !Array.isArray(updates.targetConsumers) ||
        updates.targetConsumers.length === 0 ||
        updates.targetConsumers.some(
          (item) => typeof item !== "string" || !item.trim()
        )
      ) {
        return res.status(400).json({
          message: "Provide at least one valid target consumer",
        });
      }
    }

    // The owner must match the logged-in startup
    const project = await StartupIdeas.findOneAndUpdate(
      {
        _id: id,
        startup: req.user._id,
      },
      { $set: updates },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you do not own this project",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project,
    });
  } catch (error) {
    console.error("Update project error:", error);

    return res.status(500).json({
      message: "Failed to update project",
    });
  }
});


// DELETE: Delete the entire startup project and its PDF
// DELETE /api/startup/ideas/:id
router.delete("/startup/ideas/:id", protect, async (req, res) => {
  try {
    if (req.user?.role !== "startup") {
      return res.status(403).json({
        message: "Only startups can delete projects",
      });
    }

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        message: "Invalid project ID",
      });
    }

    // Find only a project owned by the logged-in startup
    const project = await StartupIdeas.findOne({
      _id: id,
      startup: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        message: "Project not found or you do not own this project",
      });
    }

    // Remove linked PDF document, if present
    if (project.projectDocument) {
      await ProjectDocument.findByIdAndDelete(
        project.projectDocument
      );
    }

    // Remove the project
    await StartupIdeas.findByIdAndDelete(project._id);

    return res.status(200).json({
      success: true,
      message: "Project and its documentation deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      message: "Failed to delete project",
    });
  }
});

// POST: Create a new startup idea
// POST /api/startup/ideas
router.post("/startup/ideas", protect, async (req, res) => {
  try {
    if (req.user?.role !== "startup") {
      return res.status(403).json({
        message: "Only startups can create projects",
      });
    }

    const {
      title,
      shortDescription,
      problemStatement,
      solution,
      domain,
      targetConsumers,
      businessModel,
      stage,
      fundingRequired,
      location,
    } = req.body;

    if (typeof title !== "string" || !title.trim() || title.length > 150) {
      return res.status(400).json({
        message: "Title is required and must be under 150 characters",
      });
    }

    if (
      typeof shortDescription !== "string" ||
      !shortDescription.trim() ||
      shortDescription.length > 100
    ) {
      return res.status(400).json({
        message: "Provide a valid short description under 100 characters",
      });
    }

    if (
      typeof problemStatement !== "string" || !problemStatement.trim() ||
      typeof solution !== "string" || !solution.trim() ||
      typeof domain !== "string" || !domain.trim()
    ) {
      return res.status(400).json({
        message: "Problem statement, solution and domain are required",
      });
    }

    if (
      !Array.isArray(targetConsumers) ||
      targetConsumers.length === 0 ||
      targetConsumers.some((item) => typeof item !== "string" || !item.trim())
    ) {
      return res.status(400).json({
        message: "Provide at least one valid target consumer",
      });
    }

    const funding = Number(fundingRequired ?? 0);
    if (!Number.isFinite(funding) || funding < 0) {
      return res.status(400).json({
        message: "Funding required must be a non-negative number",
      });
    }

    const projectStage = stage || "Idea";
    if (!["Idea", "Prototype", "MVP", "Launched"].includes(projectStage)) {
      return res.status(400).json({
        message: "Invalid project stage",
      });
    }

    const project = await StartupIdeas.create({
      startup: req.user._id,
      title: title.trim(),
      shortDescription: shortDescription.trim(),
      problemStatement: problemStatement.trim(),
      solution: solution.trim(),
      domain: domain.trim(),
      targetConsumers: targetConsumers.map((item) => item.trim()),
      businessModel: businessModel?.trim() || "",
      stage: projectStage,
      fundingRequired: funding,
      location: location?.trim() || "",
    });

    return res.status(201).json({
      success: true,
      message: "Project created successfully",
      project,
    });
  } catch (error) {
    console.error("Create project error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Failed to create project",
    });
  }
});

export default router;
