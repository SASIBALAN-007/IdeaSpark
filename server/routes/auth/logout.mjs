import { Router } from "express";
import { clearAuthCookie } from "../../utils/cookies.mjs";

const router = Router();

// POST /logout -> clears the httpOnly auth cookie.
router.post("/logout", (req, res) => {
  clearAuthCookie(res);
  res.status(200).json({ message: "Logged out successfully" });
});

export default router;
