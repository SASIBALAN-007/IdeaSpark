import { Router } from "express";
import Startup from "../../../models/Startup.mjs";

const router = Router();

// GET: List all startup companies
router.get("/investors/startups", async (req, res) => {
  try {
    const startups = await Startup.find()
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: startups.length,
      startups,
    });
  } catch (error) {
    console.error("Fetch startups error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch startup companies",
    });
  }
});

export default router;