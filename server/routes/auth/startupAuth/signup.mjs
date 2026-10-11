import { Router } from "express";
import Startup from "../../../models/Startup.mjs";
import { generateToken } from "../../../utils/jwt.mjs";
import { setAuthCookie } from "../../../utils/cookies.mjs";

const router = Router();

// POST /signup -> create a startup account, set JWT cookie, return safe user
router.post("/signup", async (req, res) => {
  try {
    const { companyName, founderName, email, password, industry, website, description } =
      req.body;

    if (!companyName || !founderName || !email || !password) {
      return res
        .status(400)
        .json({ message: "companyName, founderName, email and password are required" });
    }

    const existing = await Startup.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "A startup with this email already exists" });
    }

    // Password is hashed automatically by the schema pre-save hook.
    const startup = await Startup.create({
      companyName,
      founderName,
      email,
      password,
      industry,
      website,
      description,
    });

    const token = generateToken({ id: startup._id, role: startup.role });
    setAuthCookie(res, token);

    // Do not leak the password hash.
    const { password: _pw, ...safeUser } = startup.toObject();
    return res.status(201).json({ message: "Startup registered successfully", user: safeUser });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    return res.status(500).json({ message: "Server error during signup" });
  }
});

export default router;