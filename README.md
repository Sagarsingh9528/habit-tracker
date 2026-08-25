# Habit Tracker with Streaks

A full-stack habit tracker where users can create habits, check in for today or a previous date, and track their current and longest streaks.

The main part of this project is handling streaks using the user's **local calendar day** instead of calculating streaks from the number of hours between check-ins.

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Axios
- Tailwind CSS

### Backend
- Node.js
- Express.js
- Prisma
- PostgreSQL
- JWT
- bcrypt
- date-fns-tz

## How the Application Works

A user first creates an account by providing an email, password, and an IANA timezone such as `Asia/Kolkata`.

After logging in, the user can:

- Create and manage habits
- Check in for the current day
- Add check-ins for previous days
- View check-in history
- See current and longest streaks
- Get validation errors for invalid check-ins

The frontend is mainly responsible for the UI. The backend handles the validation, timezone conversion, check-in creation, and streak calculation.

---

## Local Day and Streak Logic

This is the main business rule of the application.

A streak is based on **local calendar dates**, not on a 24-hour period.

For every check-in, I store two values:

- `checkedInAt` - the actual timestamp in UTC
- `localDate` - the calendar date for the user in their timezone

For example, if the user has the timezone `Asia/Kolkata`:

```text
2026-03-10T14:30:00Z
        ↓
2026-03-10 20:00 IST
        ↓
localDate = 2026-03-10
