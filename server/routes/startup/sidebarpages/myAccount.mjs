import { Router } from "express";

import Startup from "../../../models/Startup.mjs"; // change to your model path
import { protect } from "../../../middleware/auth.mjs";

const router = Router();

// Fields a startup can edit (email, password and role are NOT editable here)
const ALLOWED_FIELDS = [
  "companyName",
  "founderName",
  "industry",
  "website",
  "description",
];

function requireStartup(req, res, next) {
  if (req.user?.role !== "startup") {
    return res.status(403).json({
      message: "Only startups can access this profile",
    });
  }
  next();
}

// GET: Logged-in startup's profile
// GET /api/startup/profile
router.get("/startup/profile", protect, requireStartup, async (req, res) => {
  try {
    const startup = await Startup.findById(req.user._id);

    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    return res.status(200).json({ startup });
  } catch (error) {
    console.error("Fetch startup profile error:", error);

    return res.status(500).json({
      message: "Failed to fetch profile",
    });
  }
});

// PATCH: Edit the logged-in startup's profile
// PATCH /api/startup/profile
router.patch("/startup/profile", protect, requireStartup, async (req, res) => {
  try {
    const updates = {};

    for (const field of ALLOWED_FIELDS) {
      if (req.body[field] !== undefined) {
        if (typeof req.body[field] !== "string") {
          return res.status(400).json({
            message: `${field} must be text`,
          });
        }
        updates[field] = req.body[field].trim();
      }
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        message: "No valid fields provided for update",
      });
    }

    if (
      updates.companyName !== undefined &&
      (!updates.companyName || updates.companyName.length > 100)
    ) {
      return res.status(400).json({
        message: "Company name is required and must be under 100 characters",
      });
    }

    if (
      updates.founderName !== undefined &&
      (!updates.founderName || updates.founderName.length > 100)
    ) {
      return res.status(400).json({
        message: "Founder name is required and must be under 100 characters",
      });
    }

    if (updates.industry && updates.industry.length > 100) {
      return res.status(400).json({
        message: "Industry must be under 100 characters",
      });
    }

    if (updates.website) {
      try {
        const url = new URL(updates.website);
        if (!["http:", "https:"].includes(url.protocol)) throw new Error();
      } catch {
        return res.status(400).json({
          message: "Enter a valid website URL (https://...)",
        });
      }
    }

    if (updates.description && updates.description.length > 1000) {
      return res.status(400).json({
        message: "Description must be under 1000 characters",
      });
    }

    const startup = await Startup.findByIdAndUpdate(
      req.user._id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!startup) {
      return res.status(404).json({ message: "Startup not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      startup,
    });
  } catch (error) {
    console.error("Update startup profile error:", error);

    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }

    return res.status(500).json({
      message: "Failed to update profile",
    });
  }
});

// PATCH: Change password (needs the current password)
// PATCH /api/startup/profile/password
router.patch(
  "/startup/profile/password",
  protect,
  requireStartup,
  async (req, res) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (
        typeof currentPassword !== "string" ||
        typeof newPassword !== "string" ||
        !currentPassword ||
        !newPassword
      ) {
        return res.status(400).json({
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          message: "New password must be at least 6 characters",
        });
      }

      if (newPassword === currentPassword) {
        return res.status(400).json({
          message: "New password must be different from the current password",
        });
      }

      // password has select: false, so ask for it explicitly
      const startup = await Startup.findById(req.user._id).select("+password");

      if (!startup) {
        return res.status(404).json({ message: "Startup not found" });
      }

      const isMatch = await startup.matchPassword(currentPassword);

      if (!isMatch) {
        return res.status(401).json({
          message: "Current password is incorrect",
        });
      }

      // save() triggers the pre-save hook, which hashes the new password
      startup.password = newPassword;
      await startup.save();

      return res.status(200).json({
        success: true,
        message: "Password changed successfully",
      });
    } catch (error) {
      console.error("Change password error:", error);

      return res.status(500).json({
        message: "Failed to change password",
      });
    }
  }
);

export default router;