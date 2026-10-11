// Helpers for storing the JWT in an httpOnly cookie.

const isProd = () => process.env.NODE_ENV === "production";

// Set the auth cookie. httpOnly -> not readable by JS (XSS safe).
// sameSite "lax" + secure in production keeps CSRF exposure low while still
// working with the same-origin setup / Vite dev proxy.
export const setAuthCookie = (res, token) => {
  res.cookie(process.env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
    path:"/",
    maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
  });
};

// Clear the auth cookie (used on logout).
export const clearAuthCookie = (res) => {
  res.clearCookie(process.env.COOKIE_NAME, {
    httpOnly: true,
    secure: isProd(),
    sameSite: "lax",
  });
};
