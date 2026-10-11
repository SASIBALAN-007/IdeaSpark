import { Router } from "express";
import { protect, authorize } from "../../middleware/auth.mjs";

const router = Router();

// Example protected resource: only users with role "startup" can access.
router.get("/dashboard", protect, authorize("startup"), (req, res) => {
  res.status(200).json({
    message: `Welcome to the Startup dashboard, ${req.user.companyName}!`,
    user: req.user,
  });
});

export default router;
