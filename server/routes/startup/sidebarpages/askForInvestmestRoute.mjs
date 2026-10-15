
import { Router } from "express";
import Investor from "../../../models/Investor.mjs";
import InvestmentRequest from "../../../models/InvestRequest.mjs";
import { protect } from "../../../middleware/auth.mjs";

const router = Router();

// POST /api/startup/ask-for-investment
router.post("/startup/ask-for-investment", protect, async (req, res) => {
  try {
    const {
      investorId,
      amount,
      equityPercentage,
      purpose,
      pitch,
    } = req.body;

    // Get startup ID from authenticated user
    const startupId = req.user?._id;

    if (!startupId) {
      return res.status(401).json({
        message: "Please log in as a startup",
      });
    }

    if (req.user.role !== "startup") {
      return res.status(403).json({
        message: "Only startups can request investment",
      });
    }

    if (!investorId || !amount || !purpose || !pitch) {
      return res.status(400).json({
        message: "Investor, amount, purpose and pitch are required",
      });
    }

    if (!Number.isFinite(Number(amount)) || Number(amount) <= 0) {
      return res.status(400).json({
        message: "Amount must be greater than zero",
      });
    }

    if (
      equityPercentage !== undefined &&
      (!Number.isFinite(Number(equityPercentage)) ||
        Number(equityPercentage) < 0 ||
        Number(equityPercentage) > 100)
    ) {
      return res.status(400).json({
        message: "Equity must be between 0 and 100",
      });
    }

    // Check whether the investor exists
    const investor = await Investor.findById(investorId);

    if (!investor) {
      return res.status(404).json({
        message: "Investor not found",
      });
    }

    // Save the investment request
    const request = await InvestmentRequest.create({
      startup: startupId,
      investor: investorId,
      amount: Number(amount),
      equityPercentage: Number(equityPercentage ?? 0),
      purpose,
      pitch,
    });

    return res.status(201).json({
      success: true,
      message: "Investment request sent successfully",
      request,
    });
  } catch (error) {
    console.error("Investment request error:", error);

    return res.status(500).json({
      message: "Failed to send investment request",
    });
  }
});

export default router;
