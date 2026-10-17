import { Router } from "express";

import Investor from "../../../models/Investor.mjs";
import { protect } from "../../../middleware/auth.mjs";

const router = Router();

// Investors can edit only these profile fields.
// Email, password, and role cannot be edited through this endpoint.
const ALLOWED_FIELDS = [
  "fullName",
  "firmName",
  "investmentFocus",
];

function requireInvestor(req, res, next) {
  if (req.user?.role !== "investor") {
    return res.status(403).json({
      success: false,
      message: "Only investors can access this profile",
    });
  }

  next();
}

// GET: Logged-in investor's profile
// GET /investors/my_account
router.get(
  "/investors/my_account",
  protect,
  requireInvestor,
  async (req, res) => {
    try {
      const investor = await Investor.findById(req.user._id);

      if (!investor) {
        return res.status(404).json({
          success: false,
          message: "Investor not found",
        });
      }

      return res.status(200).json({
        success: true,
        investor,
      });
    } catch (error) {
      console.error("Fetch investor profile error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to fetch investor profile",
      });
    }
  }
);

// PATCH: Edit the logged-in investor's profile
// PATCH /investors/my_account
router.patch(
  "/investors/my_account",
  protect,
  requireInvestor,
  async (req, res) => {
    try {
      const updates = {};

      for (const field of ALLOWED_FIELDS) {
        if (req.body[field] !== undefined) {
          if (typeof req.body[field] !== "string") {
            return res.status(400).json({
              success: false,
              message: `${field} must be text`,
            });
          }

          updates[field] = req.body[field].trim();
        }
      }

      if (Object.keys(updates).length === 0) {
        return res.status(400).json({
          success: false,
          message: "No valid fields provided for update",
        });
      }

      // Validate full name
      if (
        updates.fullName !== undefined &&
        (!updates.fullName || updates.fullName.length > 100)
      ) {
        return res.status(400).json({
          success: false,
          message: "Full name is required and must be under 100 characters",
        });
      }

      // Validate firm name
      if (
        updates.firmName !== undefined &&
        updates.firmName.length > 150
      ) {
        return res.status(400).json({
          success: false,
          message: "Firm name must be under 150 characters",
        });
      }

      // Validate investment focus
      if (
        updates.investmentFocus !== undefined &&
        updates.investmentFocus.length > 500
      ) {
        return res.status(400).json({
          success: false,
          message: "Investment focus must be under 500 characters",
        });
      }

      const investor = await Investor.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        {
          new: true,
          runValidators: true,
        }
      );

      if (!investor) {
        return res.status(404).json({
          success: false,
          message: "Investor not found",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Investor profile updated successfully",
        investor,
      });
    } catch (error) {
      console.error("Update investor profile error:", error);

      if (error.name === "ValidationError") {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      return res.status(500).json({
        success: false,
        message: "Failed to update investor profile",
      });
    }
  }
);

// PATCH: Change investor password
// PATCH /investors/my_account/password
router.patch(
  "/investors/my_account/password",
  protect,
  requireInvestor,
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
          success: false,
          message: "Current password and new password are required",
        });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({
          success: false,
          message: "New password must be at least 6 characters",
        });
      }

      if (newPassword === currentPassword) {
        return res.status(400).json({
          success: false,
          message: "New password must differ from the current password",
        });
      }

      // Password has select: false, so explicitly retrieve it.
      const investor = await Investor.findById(req.user._id).select(
        "+password"
      );

      if (!investor) {
        return res.status(404).json({
          success: false,
          message: "Investor not found",
        });
      }

      // Check the existing password using your schema method.
      const isMatch = await investor.matchPassword(currentPassword);

      if (!isMatch) {
        return res.status(401).json({
          success: false,
          message: "Current password is incorrect",
        });
      }

      // Your schema's pre-save hook will hash this new password.
      investor.password = newPassword;
      await investor.save();

      return res.status(200).json({
        success: true,
        message: "Investor password changed successfully",
      });
    } catch (error) {
      console.error("Change investor password error:", error);

      return res.status(500).json({
        success: false,
        message: "Failed to change investor password",
      });
    }
  }
);

export default router;