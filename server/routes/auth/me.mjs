import { Router } from "express";
import { protect } from "../../middleware/auth.mjs";

const router = Router();

// GET /me -> returns the currently authenticated user (from the cookie's JWT).
router.get("/me", protect, (req, res) => {
  res.status(200).json({ user: req.user });
});

export default router;
