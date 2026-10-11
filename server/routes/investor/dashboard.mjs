import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.mjs";

const router = Router();

// Example protected resource: only users with role "investor" can access.
router.get("/dashboard", protect, authorize("investor"), (req, res) => {
  res.status(200).json({
    message: `Welcome to the Investor dashboard, ${req.user.fullName}!`,
    user: req.user,
  });
});

export default router;
