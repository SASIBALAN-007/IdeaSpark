# IdeaSpark — Auth Module

A bridge between **investors** and **startups**. This repo contains a complete
authentication module with **JWT**, **bcrypt**, **httpOnly cookies**, and
**role-based access control** for two roles: `startup` and `investor`.

## Tech stack
- **Backend:** Node.js + Express (ESM, `.mjs`), MongoDB + Mongoose, `bcrypt`,
  `jsonwebtoken`, `cookie-parser`, `cors`, `dotenv`
- **Frontend:** React 19 + Vite, styled with **Tailwind CSS** (Play CDN, inline
  utility classes)

## Project structure
```
server/
  index.mjs                 # App entry: CORS, cookies, routes, serves built UI
  .env                      # Config (PORT, MONGO_URI, JWT_SECRET, COOKIE_NAME…)
  models/
    Startup.mjs             # "startups" collection (bcrypt hashing)
    Investor.mjs            # "investors" collection (bcrypt hashing)
  middleware/
    auth.mjs                # protect (JWT from cookie) + authorize(roles) (RBAC)
  utils/
    jwt.mjs                 # generateToken / verifyToken
    cookies.mjs             # setAuthCookie / clearAuthCookie (httpOnly)
    dbConnetion.mjs         # MongoDB connection
  routes/
    auth/startupAuth/       # signup.mjs, signin.mjs  (startup collection)
    auth/investorAuth/      # signup.mjs, signin.mjs  (investor collection)
    auth/me.mjs             # GET current user from cookie
    auth/logout.mjs         # POST clears the cookie
    startup/dashboard.mjs   # RBAC-protected (startup only)
    investor/dashboard.mjs  # RBAC-protected (investor only)
ui/
  index.html                # Loads Tailwind CDN + mounts React
  src/App.jsx               # Full auth UI (role tabs, login/register, dashboard)
```

## API endpoints
| Method | Endpoint                    | Access        | Purpose                    |
|-------:|-----------------------------|---------------|----------------------------|
| POST   | `/api/auth/startup/signup`  | Public        | Register a startup         |
| POST   | `/api/auth/startup/signin`  | Public        | Log in a startup           |
| POST   | `/api/auth/investor/signup` | Public        | Register an investor       |
| POST   | `/api/auth/investor/signin` | Public        | Log in an investor         |
| GET    | `/api/auth/me`              | Authenticated | Current user (from cookie) |
| POST   | `/api/auth/logout`          | Authenticated | Clears auth cookie         |
| GET    | `/api/startup/dashboard`    | `startup`     | RBAC-protected resource    |
| GET    | `/api/investor/dashboard`   | `investor`    | RBAC-protected resource    |

The JWT is stored in an **httpOnly cookie** named `ideaspark_token`; the browser
sends it automatically. `startup` and `investor` use **separate MongoDB
collections** and **separate login/register routes**.

## How it works
1. **Register/Login** — the password is hashed with bcrypt (schema `pre-save`
   hook). On success a JWT (`{ id, role }`) is signed and set as an httpOnly cookie.
2. **Authentication** — `protect` middleware reads the cookie, verifies the JWT,
   and loads the user from the collection matching the token's role.
3. **Authorization (RBAC)** — `authorize('startup')` / `authorize('investor')`
   gates routes; a startup token hitting the investor dashboard gets `403`.

## Running it
Prerequisites: a running MongoDB (local on `27017` or an Atlas URI).

**1) Backend**
```bash
cd server
npm install
# edit .env (set MONGO_URI and a strong JWT_SECRET)
npm run dev        # or: npm start  → http://localhost:5000
```

**2) Frontend — development (hot reload, proxies /api to :5000)**
```bash
cd ui
npm install
npm run dev        # → http://localhost:5173
```

**3) Frontend — production (served by Express)**
```bash
cd ui
npm run build      # outputs ui/dist
cd ../server
npm start          # open http://localhost:5000  (Express serves the built UI)
```

> Note: In development the Vite dev server (port 5173) proxies `/api` to the
> backend (port 5000) so the auth cookie stays same-origin. `server/.env`'s
> `CLIENT_URL=http://localhost:5173` allows that origin for CORS with credentials.
