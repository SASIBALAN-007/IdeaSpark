
import { Router } from "express";
import mongoose from "mongoose";
import multer from "multer";

import StartupIdeas from "../../../models/StartupIdeas.mjs";
import ProjectDocument from "../../../models/ProjectDocument.mjs";
import { protect } from "../../../middleware/auth.mjs";
import uploadProjectPDF from "../../../middleware/projectPDFUpload.mjs";

const router = Router();

const uploadPDF = uploadProjectPDF.single("projectDocument");

const VALID_STAGES = ["Idea", "Prototype", "MVP", "Launched"];

const ALLOWED_FIELDS = [
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

// Parse targetConsumers sent through FormData.
function parseTargetConsumers(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return value;

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) return parsed;
  } catch {
    // Allow comma-separated values.
  }

  return value.split(",");
}

function validTargetConsumers(value) {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    value.every(
      (item) => typeof item === "string" && item.trim().length > 0
    )
  );
}

// Save PDF using the REQUIRED ProjectDocument schema fields.
async function savePDF(file, startupId) {
  if (!file) return null;

  return ProjectDocument.create({
    fileName: file.originalname,
    fileData: file.buffer,
    startup: startupId,
  });
}

async function deletePDF(documentId) {
  if (!documentId) return;

  await ProjectDocument.findByIdAndDelete(documentId);
}

function isStartup(req, res) {
  if (req.user?.role !== "startup") {
    res.status(403).json({
      success: false,
      message: "Only startups can manage projects",
    });

    return false;
  }

  return true;
}

// Validate project fields shared by POST and PATCH.
function validateProjectFields(body, partial = false) {
  const errors = [];

  if (!partial || body.title !== undefined) {
    if (
      typeof body.title !== "string" ||
      !body.title.trim() ||
      body.title.trim().length > 150
    ) {
      errors.push("Title is required and must be at most 150 characters");
    }
  }

  if (!partial || body.shortDescription !== undefined) {
    if (
      typeof body.shortDescription !== "string" ||
      !body.shortDescription.trim() ||
      body.shortDescription.trim().length > 500
    ) {
      errors.push(
        "Short description is required and must be at most 500 characters"
      );
    }
  }

  for (const field of ["problemStatement", "solution", "domain"]) {
    if (!partial || body[field] !== undefined) {
      if (
        typeof body[field] !== "string" ||
        !body[field].trim()
      ) {
        errors.push(`${field} is required`);
      }
    }
  }

  if (!partial || body.targetConsumers !== undefined) {
    const consumers = parseTargetConsumers(body.targetConsumers);

    if (!validTargetConsumers(consumers)) {
      errors.push("Provide at least one valid target consumer");
    }
  }

  if (body.fundingRequired !== undefined) {
    if (
      body.fundingRequired === "" ||
      !Number.isFinite(Number(body.fundingRequired)) ||
      Number(body.fundingRequired) < 0
    ) {
      errors.push("Funding required must be a non-negative number");
    }
  }

  if (
    body.stage !== undefined &&
    !VALID_STAGES.includes(body.stage)
  ) {
    errors.push("Invalid project stage");
  }

  return errors;
}


// GET /api/startup/ideas
// List projects owned by the logged-in startup.


router.get("/startup/ideas", protect, async (req, res) => {
  try {
    if (!isStartup(req, res)) return;

    const projects = await StartupIdeas.find({
      startup: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      projects,
    });
  } catch (error) {
    console.error("Fetch startup projects error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch startup projects",
    });
  }
});


// POST /api/startup/ideas
// Create a project and optionally upload a PDF.


router.post(
  "/startup/ideas",
  protect,
  uploadPDF,
  async (req, res) => {
    let savedDocument = null;

    try {
      if (!isStartup(req, res)) return;

      const errors = validateProjectFields(req.body);

      if (errors.length) {
        return res.status(400).json({
          success: false,
          message: errors[0],
          errors,
        });
      }

      const {
        title,
        shortDescription,
        problemStatement,
        solution,
        domain,
        businessModel,
        stage,
        fundingRequired,
        location,
      } = req.body;

      const targetConsumers = parseTargetConsumers(
        req.body.targetConsumers
      );

      const projectStage = stage || "Idea";
      const funding = Number(fundingRequired ?? 0);

      // Save the PDF using fileName, fileData, and startup.
      savedDocument = await savePDF(req.file, req.user._id);

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
        projectDocument: savedDocument?._id || null,
      });

      return res.status(201).json({
        success: true,
        message: "Project created successfully",
        project,
      });
    } catch (error) {
      if (savedDocument?._id) {
        await deletePDF(savedDocument._id).catch((cleanupError) =>
          console.error("PDF cleanup error:", cleanupError)
        );
      }

      console.error("Create project error:", error);

      if (
        error.name === "ValidationError" ||
        error.name === "CastError"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to create project",
      });
    }
  }
);

// PATCH /api/startup/ideas/:id
// Update project details and/or replace its PDF.



router.patch(
  "/startup/ideas/:id",
  protect,
  uploadPDF,
  async (req, res) => {
    let newDocument = null;

    try {
      if (!isStartup(req, res)) return;

      const { id } = req.params;

      if (!mongoose.isValidObjectId(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
      }

      const existingProject = await StartupIdeas.findOne({
        _id: id,
        startup: req.user._id,
      });

      if (!existingProject) {
        return res.status(404).json({
          success: false,
          message: "Project not found or you do not own this project",
        });
      }

      const updates = {};

      for (const field of ALLOWED_FIELDS) {
        if (req.body[field] !== undefined) {
          updates[field] = req.body[field];
        }
      }

      if (updates.targetConsumers !== undefined) {
        updates.targetConsumers = parseTargetConsumers(
          updates.targetConsumers
        );
      }

      const errors = validateProjectFields(updates, true);

      if (errors.length) {
        return res.status(400).json({
          success: false,
          message: errors[0],
          errors,
        });
      }

      if (updates.title !== undefined) {
        updates.title = updates.title.trim();
      }

      if (updates.shortDescription !== undefined) {
        updates.shortDescription = updates.shortDescription.trim();
      }

      for (const field of [
        "problemStatement",
        "solution",
        "domain",
        "businessModel",
        "location",
      ]) {
        if (updates[field] !== undefined) {
          if (typeof updates[field] !== "string") {
            return res.status(400).json({
              success: false,
              message: `${field} must be text`,
            });
          }

          updates[field] = updates[field].trim();
        }
      }

      if (updates.targetConsumers !== undefined) {
        updates.targetConsumers = updates.targetConsumers.map(
          (item) => item.trim()
        );
      }

      if (updates.fundingRequired !== undefined) {
        updates.fundingRequired = Number(updates.fundingRequired);
      }

      // A new PDF replaces the old PDF.


      if (req.file) {
        newDocument = await savePDF(req.file, req.user._id);
        updates.projectDocument = newDocument._id;
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields or PDF provided for update",
        });
      }

      const oldDocumentId = existingProject.projectDocument;

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
        if (newDocument?._id) {
          await deletePDF(newDocument._id);
          newDocument = null;
        }

        return res.status(404).json({
          success: false,
          message: "Project not found or you do not own this project",
        });
      }

      // Once the project points to the new PDF, clean up the old one.


      if (newDocument && oldDocumentId) {
        await deletePDF(oldDocumentId).catch((cleanupError) => {
          console.error("Old PDF cleanup error:", cleanupError);
        });
      }

      return res.status(200).json({
        success: true,
        message: "Project updated successfully",
        project,
      });
    } catch (error) {
      if (newDocument?._id) {
        await deletePDF(newDocument._id).catch((cleanupError) =>
          console.error("PDF cleanup error:", cleanupError)
        );
      }

      console.error("Update project error:", error);

      if (
        error.name === "ValidationError" ||
        error.name === "CastError"
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update project",
      });
    }
  }
);


// DELETE /api/startup/ideas/:id
// Delete a project and then its linked PDF.

router.delete("/startup/ideas/:id", protect, async (req, res) => {
  try {
    if (!isStartup(req, res)) return;

    const { id } = req.params;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid project ID",
      });
    }

    const project = await StartupIdeas.findOne({
      _id: id,
      startup: req.user._id,
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found or you do not own this project",
      });
    }

    // Delete the project first so a PDF deletion failure
    // cannot leave the project pointing to a missing document.
    await StartupIdeas.findByIdAndDelete(project._id);

    if (project.projectDocument) {
      await deletePDF(project.projectDocument).catch((cleanupError) => {
        console.error("PDF cleanup error:", cleanupError);
      });
    }

    return res.status(200).json({
      success: true,
      message: "Project and its documentation deleted successfully",
    });
  } catch (error) {
    console.error("Delete project error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to delete project",
    });
  }
});

// Multer and PDF upload error handler


router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({
        success: false,
        message: "PDF must be smaller than 15 MB",
      });
    }

    if (error.code === "LIMIT_FILE_COUNT") {
      return res.status(400).json({
        success: false,
        message: "Only one PDF can be uploaded per request",
      });
    }

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.message === "Only PDF files are allowed.") {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  return next(error);
});

export default router;
