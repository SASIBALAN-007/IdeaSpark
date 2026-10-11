import { Router } from "express";
import Investor from "../../../models/Investor.mjs";
import { generateToken } from "../../../utils/jwt.mjs";
import { setAuthCookie } from "../../../utils/cookies.mjs";

const router = Router();

// POST /signup -> create an investor account, set JWT cookie, return safe user
router.post("/signup", async (req, res) => {
  try {
    const { fullName, firmName, email, password, investmentFocus } = req.body;

    if (!fullName || !email || !password) {
      return res
        .status(400)
        .json({ message: "fullName, email and password are required" });
    }

    const existing = await Investor.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An investor with this email already exists" });
    }

    // Password is hashed automatically by the schema pre-save hook.
    const investor = await Investor.create({
      fullName,
      firmName,
      email,
      password,
      investmentFocus,
    });

    const token = generateToken({ id: investor._id, role: investor.role });
    setAuthCookie(res, token);

    // Do not leak the password hash.
    const { password: _pw, ...safeUser } = investor.toObject();
    return res.status(201).json({ message: "Investor registered successfully", user: safeUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error during signup" });
  }
});

export default router;
