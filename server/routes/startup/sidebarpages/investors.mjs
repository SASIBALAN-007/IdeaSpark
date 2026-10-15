
import { Router } from "express";
import Investor from "../../../models/Investor.mjs";

const router = Router();

// GET: Fetch all investors
router.get("/startup/investors", async (req, res) => {
  try {
    const investors = await Investor.find()
      .select("-password");

    return res.status(200).json({
      success: true,
      count: investors.length,
      investors: investors,
    });
  } catch (error) {
    console.error("Error fetching investors:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch investors",
    });
  }
});

export default router;
