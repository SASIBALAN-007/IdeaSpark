import jwt from "jsonwebtoken";

// Sign a JWT for a user. The payload carries the user id and role so that
// downstream middleware can authorise requests without an extra lookup for role.
export const generateToken = (payload) => {
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

// Verify and decode a JWT. Throws if the token is invalid or expired.
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
