# API Documentation

Base URL: `http://localhost:3000/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are valid for 7 days and are returned on successful registration or login.

---

## Auth Endpoints

### Register User
Create a new user account with timezone.

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "timezone": "Asia/Kolkata"
}
```

**Validation:**
- Email must be valid and unique
- Password minimum 6 characters
- Timezone must be valid IANA timezone (e.g., "Asia/Kolkata", "America/New_York")

**Success Response:** `201 Created`
```json
{
  "message": "User registered successfully",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "timezone": "Asia/Kolkata",
    "createdAt": "2026-03-12T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing fields, invalid email, weak password, invalid timezone
- `400 Bad Request`: Email already registered

---

### Login
Authenticate and receive JWT token.

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Login successful",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "timezone": "Asia/Kolkata"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses:**
- `400 Bad Request`: Missing email or password
- `401 Unauthorized`: Invalid credentials

---

### Get Current User
Fetch authenticated user's profile.

**Endpoint:** `GET /auth/me`

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response:** `200 OK`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "timezone": "Asia/Kolkata",
    "createdAt": "2026-03-12T10:30:00.000Z"
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Missing or invalid token

---

## Habit Endpoints

### Create Habit
Create a new habit.

**Endpoint:** `POST /habits`

**Headers:** `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "name": "Drink Water",
  "description": "Drink 8 glasses of water daily"
}
```

**Validation:**
- Name is required and max 100 characters
- Description is optional

**Success Response:** `201 Created`
```json
{
  "message": "Habit created successfully",
  "habit": {
    "id": "uuid",
    "name": "Drink Water",
    "description": "Drink 8 glasses of water daily",
    "userId": "uuid",
    "createdAt": "2026-03-12T10:30:00.000Z",
    "updatedAt": "2026-03-12T10:30:00.000Z",
    "currentStreak": 0,
    "longestStreak": 0,
    "completedToday": false,
    "checkIns": []
  }
}
```

---

### List Habits
Get all habits for the authenticated user with calculated streaks.

**Endpoint:** `GET /habits`

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response:** `200 OK`
```json
{
  "habits": [
    {
      "id": "uuid",
      "name": "Drink Water",
      "description": "Drink 8 glasses of water daily",
      "createdAt": "2026-03-10T10:30:00.000Z",
      "updatedAt": "2026-03-12T10:30:00.000Z",
      "currentStreak": 3,
      "longestStreak": 5,
      "completedToday": true,
      "totalCheckIns": 8
    }
  ]
}
```

**Streak Calculation:**
- `currentStreak`: Consecutive days ending today or yesterday
- `longestStreak`: Maximum consecutive sequence ever
- `completedToday`: Boolean indicating if checked in today

---

### Get Habit Detail
Get a single habit with full check-in history.

**Endpoint:** `GET /habits/:id`

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response:** `200 OK`
```json
{
  "habit": {
    "id": "uuid",
    "name": "Drink Water",
    "description": "Drink 8 glasses of water daily",
    "userId": "uuid",
    "createdAt": "2026-03-10T10:30:00.000Z",
    "updatedAt": "2026-03-12T10:30:00.000Z",
    "currentStreak": 3,
    "longestStreak": 5,
    "completedToday": true,
    "checkIns": [
      {
        "id": "uuid",
        "habitId": "uuid",
        "userId": "uuid",
        "checkedInAt": "2026-03-12T15:30:00.000Z",
        "localDate": "2026-03-12",
        "createdAt": "2026-03-12T15:30:00.000Z"
      }
    ]
  }
}
```

**Error Responses:**
- `404 Not Found`: Habit not found or doesn't belong to user

---

### Update Habit
Update habit name or description.

**Endpoint:** `PUT /habits/:id`

**Headers:** `Authorization: Bearer <token>` (required)

**Request Body:**
```json
{
  "name": "Drink More Water",
  "description": "Updated description"
}
```

**Success Response:** `200 OK`
```json
{
  "message": "Habit updated successfully",
  "habit": {
    "id": "uuid",
    "name": "Drink More Water",
    "description": "Updated description",
    "userId": "uuid",
    "createdAt": "2026-03-10T10:30:00.000Z",
    "updatedAt": "2026-03-12T16:00:00.000Z",
    "currentStreak": 3,
    "longestStreak": 5,
    "completedToday": true,
    "checkIns": [...]
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid data
- `404 Not Found`: Habit not found or doesn't belong to user

---

### Delete Habit
Delete a habit and all its check-ins.

**Endpoint:** `DELETE /habits/:id`

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response:** `200 OK`
```json
{
  "message": "Habit deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Habit not found or doesn't belong to user

---

## Check-In Endpoints

### Create Check-In
Record a check-in for today or backfill a past date.

**Endpoint:** `POST /habits/:id/checkins`

**Headers:** `Authorization: Bearer <token>` (required)

**Request Body (Check in for today):**
```json
{}
```

**Request Body (Backfill past date):**
```json
{
  "localDate": "2026-03-10"
}
```

**Validation:**
- Date format must be YYYY-MM-DD
- Date cannot be in the future (user's local timezone)
- Date cannot be before habit creation
- Only one check-in per local day (enforced by database)

**Success Response:** `201 Created`
```json
{
  "message": "Check-in recorded successfully",
  "checkIn": {
    "id": "uuid",
    "habitId": "uuid",
    "userId": "uuid",
    "checkedInAt": "2026-03-12T15:30:00.000Z",
    "localDate": "2026-03-12",
    "createdAt": "2026-03-12T15:30:00.000Z"
  }
}
```

**Error Responses:**
- `400 Bad Request`: Invalid date format
- `400 Bad Request`: Cannot check in for future dates
- `400 Bad Request`: Cannot check in before habit was created
- `404 Not Found`: Habit not found
- `409 Conflict`: You have already checked in for this day

**Important Notes:**
- The `localDate` is calculated in the user's timezone
- Two check-ins 20 hours apart may be valid if they're different local days
- Two check-ins 11 hours apart may be invalid if they're the same local day
- Backfilling automatically recalculates streaks

---

### Get Check-Ins
Get all check-ins for a habit.

**Endpoint:** `GET /habits/:id/checkins`

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response:** `200 OK`
```json
{
  "checkIns": [
    {
      "id": "uuid",
      "habitId": "uuid",
      "userId": "uuid",
      "checkedInAt": "2026-03-12T15:30:00.000Z",
      "localDate": "2026-03-12",
      "createdAt": "2026-03-12T15:30:00.000Z"
    },
    {
      "id": "uuid",
      "habitId": "uuid",
      "userId": "uuid",
      "checkedInAt": "2026-03-11T14:20:00.000Z",
      "localDate": "2026-03-11",
      "createdAt": "2026-03-11T14:20:00.000Z"
    }
  ]
}
```

**Error Responses:**
- `404 Not Found`: Habit not found

---

### Delete Check-In
Remove a check-in (will recalculate streaks).

**Endpoint:** `DELETE /checkins/:id`

**Headers:** `Authorization: Bearer <token>` (required)

**Success Response:** `200 OK`
```json
{
  "message": "Check-in deleted successfully"
}
```

**Error Responses:**
- `404 Not Found`: Check-in not found or doesn't belong to user

---

## Health Check

### System Health
Check if the API is running.

**Endpoint:** `GET /health`

**Success Response:** `200 OK`
```json
{
  "status": "ok",
  "timestamp": "2026-03-12T15:30:00.000Z"
}
```

---

## Error Response Format

All error responses follow this format:

```json
{
  "error": "Error message describing what went wrong"
}
```

Common HTTP status codes:
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `404 Not Found`: Resource doesn't exist
- `409 Conflict`: Duplicate resource (e.g., duplicate check-in)
- `500 Internal Server Error`: Server error

---

## Timezone Logic Examples

### Example 1: Valid Consecutive Days (Asia/Kolkata, UTC+05:30)

**Check-in A:**
```
UTC Time: 2026-03-10T14:30:00Z
Local Time: 2026-03-10 20:00
Stored as: "2026-03-10"
```

**Check-in B (20 hours later):**
```
UTC Time: 2026-03-11T10:30:00Z
Local Time: 2026-03-11 16:00
Stored as: "2026-03-11"
Result: ✅ Valid, streak = 2
```

### Example 2: Invalid Same Day (Asia/Kolkata, UTC+05:30)

**Check-in A:**
```
UTC Time: 2026-03-11T21:30:00Z
Local Time: 2026-03-12 03:00
Stored as: "2026-03-12"
```

**Check-in B (20 hours later):**
```
UTC Time: 2026-03-12T17:30:00Z
Local Time: 2026-03-12 23:00
Stored as: "2026-03-12"
Result: ❌ Rejected (409 Conflict)
```

### Example 3: Streak Calculation

**Check-ins:**
```
2026-03-12 (today)
2026-03-11
2026-03-10
2026-03-08 (gap)
2026-03-07
```

**Results:**
- Current Streak: 3 (March 10-12, consecutive ending today)
- Longest Streak: 3 (same as current)

If today was March 13 with no check-in:
- Current Streak: 3 (yesterday was March 12, streak still alive)
- Longest Streak: 3

If today was March 14 with no check-in:
- Current Streak: 0 (broken, neither today nor yesterday logged)
- Longest Streak: 3 (historical max)

---

## Rate Limiting

Currently not implemented. In production, consider:
- Rate limiting per IP: 100 requests/15 minutes
- Authentication attempts: 5 failures/15 minutes per IP
- Check-in creation: 10 requests/minute per user

---

## CORS

The API allows cross-origin requests from any origin in development. In production, configure specific allowed origins in `backend/src/server.js`.

---

## Database Schema

For complete schema details, see `backend/prisma/schema.prisma`.

Key relationships:
- User → Habits (one-to-many)
- User → CheckIns (one-to-many)
- Habit → CheckIns (one-to-many)

Unique constraints:
- User.email (unique)
- CheckIn(habitId, localDate) (unique - enforces one check-in per local day)

Cascading deletes:
- Deleting a user deletes their habits and check-ins
- Deleting a habit deletes its check-ins

---

Built with Express, Prisma, and PostgreSQL.
