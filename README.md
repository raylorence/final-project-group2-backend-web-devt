
# Huling Kapsula — Backend API

The RESTful API and server engine powering **Huling Kapsula**, a biological defense survival web game. Built with Express 5 and Mongoose, this service handles user authentication, session security, score tracking, dynamic leaderboards, and administrative moderation.

---

## 1. Project Overview

The backend acts as the authoritative central data store for the game. It:
- Issues secure JSON Web Tokens (JWT) for session management.
- Enforces role-based access control distinguishing `player` and `admin` capabilities.
- Tracks match performance, updating player personal bests using high scores and survival times.
- Serves the global Top 10 leaderboard with tie-breaking logic.
- Provides moderation endpoints for system administrators.
- Fallback-serves static production client builds when co-located.

---

## 2. Tech Stack & Dependencies

- **Runtime:** Node.js (CommonJS)
- **Web Framework:** Express 5 (`^5.3.0`)
- **Database / ODM:** MongoDB Atlas with Mongoose (`^9.11.2`)
- **Security & Cryptography:**
    - `bcrypt` (`^6.0.0`) for salted password hashing
    - `jsonwebtoken` (`^9.0.3`) for stateless auth verification
    - `cors` (`^2.8.6`) with origin validation
    - `express-rate-limit` (`^8.7.2`) & `express-validator` (`^7.3.2`)
- **Development Tooling:** `nodemon` (`^3.1.14`), `eslint` (`^10.13.0`), `dotenv` (`^18.0.8`)

---

## 3. Architecture & Directory Map

```text
├── config/
│   └── db.js                 # MongoDB connection logic and logging
├── controllers/
│   ├── adminController.js    # Account & score moderation handlers
│   ├── authController.js     # User registration and login handlers
│   └── scoreController.js    # Score submission, personal bests, & leaderboard
├── middleware/
│   └── authMiddleware.js     # JWT verification (`protect`) & `adminOnly` guards
├── models/
│   ├── Score.js              # Score schema (totalScore, survivalTime, player ref)
│   └── User.js               # User schema with pre-save bcrypt hook and comparePassword
├── routes/
│   ├── adminRoutes.js        # /api/admin endpoints
│   ├── authRoutes.js         # /api/auth endpoints
│   └── scoreRoutes.js        # /api/scores endpoints
├── .env.example              # Template for environment configuration
├── eslint.config.js          # ESLint configuration
├── package.json              # Dependency manifests and scripts
└── server.js                 # Express bootstrap, CORS, routes, & health checks

```

---

## 4. Environment Variables

Create a `.env` file in the project root based on `env.example`:

```bash
cp env.example .env

```

| Variable | Required | Description | Example |
| --- | --- | --- | --- |
| `PORT` | Optional | Port the Express server listens on (defaults to `5000`)

| `5000`

|
| `MONGO_URI` | **Yes** | MongoDB Atlas connection string

| `mongodb+srv://user:pass@cluster.mongodb.net/dbname`

|
| `JWT_SECRET` | **Yes** | Cryptographic secret key for signing session tokens

| `your-secure-jwt-secret-string`

|
| `CLIENT_ORIGIN` | Optional | Allowed production frontend origin for CORS

| `https://your-frontend.vercel.app`

|
| `NODE_ENV` | Optional | Environment mode (`development` or `production`)

| `development`

|

---

## 5. API Endpoints Reference

### Health Check

* **`GET /api/health`** (or `/api`) — Verifies server runtime and tests the active MongoDB connection ping.



### Authentication (`/api/auth`)

* **`POST /api/auth/register`** — Registers a new user account with default `player` role; returns signed JWT.


* *Body:* `{ "username": "string", "password": "min-6-characters" }`




* **`POST /api/auth/login`** — Authenticates credentials; returns user profile and JWT token.


* *Body:* `{ "username": "string", "password": "string" }`





### Scores & Leaderboard (`/api/scores`)

* **`GET /api/scores`** — Fetches top 10 scores sorted descending by `totalScore`, breaking ties with `survivalTime`.


* **`GET /api/scores/me`** — *(Protected)* Retrieves the authenticated user's personal best record.


* **`POST /api/scores`** — *(Protected)* Submits a game match result. Automatically updates personal best if the run score or survival time surpasses previous records (admins are prohibited from submitting).


* *Body:* `{ "totalScore": number, "survivalTime": number }`





### Admin Moderation (`/api/admin`)

Requires `Authorization: Bearer <token>` with `role: admin`.

* **`GET /api/admin/users`** — Retrieves all registered users.


* **`GET /api/admin/scores`** — Retrieves all match scores uncapped.


* **`DELETE /api/admin/users/:userId`** — Cascades deletion of a player account and all linked score records.


* **`DELETE /api/admin/scores/:scoreID`** — Removes a specific score entry.



---

## 6. Local Setup & Development

### Prerequisites

* Node.js (version 18+ or 20+ recommended)


* npm package manager


* Active MongoDB Atlas cluster or local MongoDB instance



### Installation

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp env.example .env
# Edit .env and supply your MONGO_URI and JWT_SECRET

# 3. Start development server with Nodemon
npm run dev

# 4. Run lint checks
npm run lint

```

The server runs at `http://localhost:5000`.

---

## 7. Security & Deployment

* **CORS Policy:** Automatically permits local dev servers (`http://localhost:5173`, `http://localhost:3000`), the configured `CLIENT_ORIGIN`, and preview deployments matching `vercelProjectPattern`.


* **Password Protection:** Plaintext passwords are automatically salted and hashed via bcrypt before writing to the database.


* **JWT Expiration:** Tokens are signed with a 30-day expiration window.


* **Production Deployment (e.g., Render):** Set `NODE_ENV=production` and configure your secret environment variables in your hosting provider's dashboard.
