# Auth Routes

**Base:** `/api/auth/`

---

## Authentication

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| POST | `/login/discord` | Initiate Discord OAuth | No |
| POST | `/exchange-code` | Exchange OAuth code for session | No |
| POST | `/refresh` | Refresh session | No |
| GET | `/session` | Get current session | Yes |
| POST | `/logout` | Sign out | Yes |
| GET | `/user` | Get user profile | Yes |
| GET | `/me` | Get user with avatar (app init) | Yes |

---

## User Profile

| Method | Endpoint | Purpose | Auth |
|--------|----------|---------|------|
| GET | `/settings` | Get user settings | Yes |
| POST | `/settings` | Update settings and display name | Yes |
| DELETE | `/user` | Delete account | Yes |
| GET | `/profile` | Get profile with tier | Yes |
