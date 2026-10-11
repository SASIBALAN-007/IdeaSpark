import { verifyToken } from "../utils/jwt.mjs";
import Startup from "../models/Startup.mjs";
import Investor from "../models/Investor.mjs";

// Map a role to its Mongoose model so we can look up the right collection.
const modelByRole = {
  startup: Startup,
  investor: Investor,
};

// Reads the JWT from the httpOnly cookie, verifies it and attaches the
// user (without the password hash) to req.user. Responds 401 if missing/invalid.
export const protect = async (req, res, next) => {
  try {
    const token = req.cookies?.[process.env.COOKIE_NAME];
    if (!token) {
      return res.status(401).json({ message: "Not authorized, no token" });
    }

    const decoded = verifyToken(token);
    const Model = modelByRole[decoded.role];
    if (!Model) {
      return res.status(401).json({ message: "Not authorized, invalid role" });
    }

    const user = await Model.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "Not authorized, user not found" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Not authorized, token failed" });
  }
};

// Role-based access control. Use after `protect`.
// Example: router.get("/x", protect, authorize("startup"), handler)
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: this resource requires role(s): ${roles.join(", ")}`,
      });
    }
    next();
  };
};
