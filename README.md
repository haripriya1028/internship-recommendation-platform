# Internship Recommendation Platform

A full-stack MERN application that recommends internships to students using the Gemini API for AI-ranked, explained recommendations - with JWT authentication, role-based access control, and MongoDB-backed caching.

**Live demo:** https://internship-recommendation-platform-seven.vercel.app

## Features

- User registration & login (JWT-based)
- Student profile management (branch, year, CGPA, skills, interests)
- Internship management (admin-only create/update/delete)
- AI-powered recommendation engine using the Gemini API
- Per-user cached recommendations, auto-invalidated on relevant changes
- Role-based access control (student / admin)
- Responsive React frontend (Tailwind CSS)

## Tech Stack

**Frontend:** React (Vite), React Router, Tailwind CSS
**Backend:** Node.js, Express.js
**Database:** MongoDB Atlas (Mongoose)
**AI:** Google Gemini API (`gemini-flash-latest`, `@google/genai`)
**Auth:** JWT (`jsonwebtoken`), `bcryptjs` for password hashing

## Project Structure

```
internship-recommendation-platform/
├── client/                        # React frontend (Vite)
│   └── src/
│       ├── components/            # ProtectedRoute, AdminRoute, Navbar
│       ├── pages/                 # Login, Register, Profile, Recommendations, AdminDashboard
│       └── services/api.js        # API client
└── server/                        # Express backend
    ├── config/db.js               # MongoDB connection
    ├── controllers/                # Route handlers
    ├── middleware/                 # authMiddleware, adminMiddleware
    ├── models/                     # User, Profile, Internship, Recommendation
    ├── routes/
    ├── services/geminiService.js  # Gemini prompt + call
    └── server.js
```

## How the Recommendation Engine Works

1. The client requests recommendations for a user (`GET /api/recommendations/:userId`).
2. The server first checks the `Recommendation` collection for a cached result for that user. If found, it's returned immediately — no Gemini call.
3. On a cache miss, the server fetches the user's `Profile` and **all** internships from MongoDB, and sends them to Gemini in a single prompt. The prompt includes the student's branch, CGPA, skills and interests, plus the full internship list as JSON, and asks Gemini to return a re-ranked list — each item with `title`, `company`, `score`, and a natural-language `reason`.
4. Gemini's JSON response (`responseMimeType: "application/json"`) is parsed, merged back with the full internship documents from MongoDB (location, description, eligibility, etc.), and both cached in the `Recommendation` collection and returned to the client.

```js
// services/geminiService.js (trimmed)
const response = await ai.models.generateContent({
  model: "gemini-flash-latest",
  contents: prompt,
  config: { responseMimeType: "application/json" },
});
```

### Caching & invalidation

Recommendations are cached per user in a dedicated `Recommendation` collection (one document per user, `findOneAndUpdate` with `upsert: true`). This avoids a Gemini call on every page load. The cache is explicitly invalidated in two places:
- When a student updates their **profile** → that user's cached recommendation document is deleted.
- When an admin **creates, updates, or deletes an internship** → *every* user's cached recommendations are cleared (`Recommendation.deleteMany({})`), since a new or changed internship could affect anyone's ranking.

### Known limitation

An earlier version pre-scored internships with a rule-based formula before sending them to Gemini (60% skill match + 20% branch match + 20% CGPA eligibility) and only sent the top 5 to the model. That pre-scoring step is currently commented out in `recommendationController.js` — right now, **all** internships are sent to Gemini on every cache miss, and the prompt text still references a "calculated matchScore" that isn't actually being computed anymore. This works for a small internship list but doesn't scale well (full list + full prompt on every miss), and the prompt is slightly out of sync with the code. Re-enabling the pre-filter (or trimming to a candidate shortlist before the Gemini call) is the natural next fix.

## Authentication & Authorization

- Passwords are hashed with `bcryptjs` before storage.
- On login, a JWT is issued containing `{ id, role }`, signed with a 30-day expiry.
- `authMiddleware` verifies the `Authorization: Bearer <token>` header and attaches the decoded payload to `req.user`.
- `adminMiddleware` checks `req.user.role === "admin"` and is applied to internship create/update/delete routes.
- On the frontend, `ProtectedRoute` and `AdminRoute` components gate pages based on a role stored in `localStorage`.

**Current gap:** the recommendation and profile routes (`/api/recommendations/:userId`, `/api/profile/:userId`) aren't currently wrapped with `authenticateUser`, so they don't verify that the requester *is* the user whose ID is in the URL. Adding that middleware check (`req.user.id === req.params.userId`) is a planned fix.

## Data Models (simplified)

```js
// User
{ name, email, password (hashed), branch, year, skills: [String], role: "student" | "admin" }

// Profile
{ user: ObjectId -> User, branch, year, cgpa, skills: [String], interests: [String] }

// Internship
{ title, company, location, skillsRequired: [String], minimumCGPA, eligibleBranches: [String], description }
// indexed on: company, title, minimumCGPA

// Recommendation (cache)
{ user: ObjectId -> User (unique), recommendations: [{ title, company, score, reason, ...internship fields }] }
```

## API Endpoints

| Method | Route | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | – | Register a new user |
| POST | `/api/auth/login` | – | Log in, returns JWT |
| POST | `/api/profile` | – | Create a student profile |
| GET | `/api/profile/:userId` | – | Get a profile |
| PUT | `/api/profile/:userId` | – | Update a profile (clears that user's cached recommendations) |
| GET | `/api/internships` | – | List all internships |
| POST | `/api/internships` | admin | Create an internship (clears all cached recommendations) |
| PUT | `/api/internships/:id` | admin | Update an internship (clears all cached recommendations) |
| DELETE | `/api/internships/:id` | admin | Delete an internship (clears all cached recommendations) |
| GET | `/api/recommendations/:userId` | – | Get (cached or freshly Gemini-ranked) recommendations |

## Setup

**Backend**
```bash
cd server
npm install
```
Create a `.env` file in `server/`:
```
MONGO_URI=your_mongodb_atlas_uri
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
PORT=5000
```
```bash
npm start
```

**Frontend**
```bash
cd client
npm install
npm run dev
```

## Deployment

- **Frontend:** Vercel
- **Backend:** Render
- **Database:** MongoDB Atlas

## Future Improvements

- Re-enable rule-based pre-filtering before the Gemini call, so the LLM ranks a shortlist instead of the full internship table (lower latency and token cost as internship count grows).
- Add `authenticateUser` + ownership checks to the profile and recommendation routes.
- Add a TTL or "last profile/internship change" timestamp comparison instead of full deletes, to avoid unnecessary Gemini calls after unrelated changes.
- Pagination for the internship list and admin dashboard.
- Unit tests for the recommendation controller and Gemini response parsing (handling malformed JSON from the model).
