
import { Router } from "express";
import InvestRequest from "../../../models/InvestRequest.mjs";

const router = Router();

// GET: List all investment requests
router.get("/investors/investment_request", async (req, res) => {
  try {
    const investmentRequests = await InvestRequest.find()
      .populate("startup", "-password")
      .populate("investor", "-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: investmentRequests.length,
      investmentRequests,
    });
  } catch (error) {
    console.error("Fetch investment requests error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch investment requests",
    });
  }
});

export default router;
