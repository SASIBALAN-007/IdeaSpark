import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connection from "./utils/dbConnetion.mjs";

// Auth routes (separate collections + separate login for each role)
import startupSignup from "./routes/auth/startupAuth/signup.mjs";
import startupSignin from "./routes/auth/startupAuth/signin.mjs";
import investorSignup from "./routes/auth/investorAuth/signup.mjs";
import investorSignin from "./routes/auth/investorAuth/signin.mjs";
import meRouter from "./routes/auth/me.mjs";
import logoutRouter from "./routes/auth/logout.mjs";

// Role-based protected resources
import startupDashboard from "./routes/startup/dashboard.mjs";
import investorDashboard from "./routes/investor/dashboard.mjs";

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();

// Allow the frontend origin to send cookies cross-origin (credentials: true).
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((o) => o.trim());

app.use(
  cors({
    origin(origin, callback) {
      // Allow same-origin / server-to-server requests (no origin header) too.
      if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());
// Parse the Cookie header so middleware/routes can read req.cookies
app.use(cookieParser());

// ---- Health check ----
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

// ---- Auth routes ----
app.use("/api/auth/startup", startupSignup);
app.use("/api/auth/startup", startupSignin);
app.use("/api/auth/investor", investorSignup);
app.use("/api/auth/investor", investorSignin);
app.use("/api/auth", meRouter);
app.use("/api/auth", logoutRouter);

// ---- Role-based resources ----
app.use("/api/startup", startupDashboard);
app.use("/api/investor", investorDashboard);

// ---- Serve the built React app in production ----
const distPath = path.join(__dirname, "..", "ui", "dist");
app.use(express.static(distPath));
// SPA fallback: any non-API GET returns index.html
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(distPath, "index.html"));
});

const PORT = process.env.PORT || 5000;

// Connect to the database first, then start listening.
await connection();
app.listen(PORT, () => {
  console.log(` IdeaSpark server running on http://localhost:${PORT}`);
});