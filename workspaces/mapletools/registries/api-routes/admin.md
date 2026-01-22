# Admin Routes

**Base:** `/api/admin/`
**Auth:** All require admin authentication
**Count:** 67 endpoints

---

## Audit (`/audit/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/dashboard` | Admin dashboard data |
| GET | `/dashboard-stats` | Dashboard statistics |
| GET | `/dashboard-metrics` | Dashboard metrics |
| GET | `/recent` | Recent audit actions |
| GET | `/stats` | Detailed user stats |
| GET | `/recent-characters` | Recently created characters |
| GET | `/activities` | Paginated admin activities |
| GET | `/user-activity` | User activity summary |
| GET | `/content-stats` | Content statistics |
| GET | `/users-by-metric/:metricType` | Users by metric type |

---

## Boss Management (`/bosses/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/` | Create boss |
| PUT | `/:id` | Update boss |
| DELETE | `/:id` | Delete boss |
| POST | `/:id/difficulties` | Create difficulty |
| PUT | `/difficulties/:id` | Update difficulty |
| DELETE | `/difficulties/:id` | Delete difficulty |
| POST | `/difficulties/:id/drops` | Add drop |
| DELETE | `/drops/:difficultyId/:itemId` | Remove drop |
| GET | `/validate` | Validate boss data |
| POST | `/cleanup` | Cleanup orphaned drops |
| GET | `/export` | Export as CSV |
| POST | `/import` | Import from CSV |

---

## Bot Stats (`/bot-stats/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get latest bot stats |
| GET | `/history` | Get stats history (24h) |

---

## Cache (`/cache/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all cache entries |
| DELETE | `/:key` | Delete cache entry |
| DELETE | `/` | Clear all cache |

---

## Characters (`/characters/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all characters (paginated) |

---

## Items (`/items/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all items |
| POST | `/` | Create item |
| PATCH | `/:itemId` | Update item |
| DELETE | `/:itemId` | Delete item |

---

## Metrics (`/metrics/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get dashboard metrics |
| GET | `/api-usage` | Get API usage metrics |

---

## Task Definitions (`/tasks/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all tasks |
| GET | `/export` | Export as JSON |
| GET | `/:id` | Get task by ID |
| POST | `/` | Create task |
| PUT | `/:id` | Update task |
| DELETE | `/:id` | Delete task |
| POST | `/bulk` | Bulk create tasks |

---

## Templates (`/templates/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Get all templates |
| GET | `/export` | Export as JSON |
| GET | `/:id` | Get template by ID |
| POST | `/` | Create template |
| POST | `/with-bosses` | Create with boss tasks |
| PUT | `/:id` | Update template |
| PUT | `/:id/with-bosses` | Update with boss tasks |
| DELETE | `/:id` | Delete template |
| PUT | `/:id/tasks` | Set tasks for template |
| POST | `/:id/tasks/:taskId` | Add task to template |
| DELETE | `/:id/tasks/:taskId` | Remove task from template |

---

## Users (`/users/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/` | Search users |
| GET | `/:id` | Get user with settings |
| GET | `/:id/details` | Get user with characters |
| GET | `/:id/stats` | Get user statistics |
| PATCH | `/:id/tier` | Update tier |
| PATCH | `/:id/profile` | Update profile |
| PATCH | `/:id/status` | Update status |

---

## Verify (`/verify/`)

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/:userId` | Verify a user |
