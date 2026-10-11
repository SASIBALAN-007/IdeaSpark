import { Router } from "express";
import Startup from "../../../models/Startup.mjs";
import { generateToken } from "../../../utils/jwt.mjs";
import { setAuthCookie } from "../../../utils/cookies.mjs";

const router = Router();

// POST /signin -> verify credentials, set JWT cookie, return safe user
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    // Explicitly select the password (schema sets select:false by default).
    const user = await Startup.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken({ id: user._id, role: user.role });
    setAuthCookie(res, token);

    const { password: _pw, ...safeUser } = user.toObject();
    return res.status(200).json({ message: "Login successful", user: safeUser });
  } catch (error) {
    return res.status(500).json({ message: "Server error during signin" });
  }
});

export default router;
