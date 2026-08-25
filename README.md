# Habit Tracker with Streaks

A fullstack habit tracking application with timezone-aware streak calculation.

## Tech Stack

### Frontend
- React with Vite
- Axios for API calls
- React Router for navigation
- Tailwind CSS for styling

### Backend
- Node.js with Express
- PostgreSQL database
- Prisma ORM
- JWT for authentication
- bcrypt for password hashing
- date-fns-tz for timezone handling

## Key Design Decisions

### Local Day Logic
The most critical aspect of this application is **streak calculation based on local days, not elapsed hours**.

#### How It Works:
1. **Storage**: Each check-in stores:
   - `checkedInAt`: The UTC timestamp when the check-in was created
   - `localDate`: The local calendar date (YYYY-MM-DD) in the user's timezone
   
2. **Validation**: Before creating a check-in:
   - Convert the requested date to the user's timezone
   - Check if it's a valid date (not in the future, not before habit creation)
   - Ensure no duplicate check-in exists for that local date
   
3. **Streak Calculation**: 
   - **Current Streak**: Count consecutive days from the most recent check-in backwards
   - If today is logged, count from today
   - If today is not logged but yesterday is, count from yesterday
   - Otherwise, streak is 0 (broken)
   - **Longest Streak**: Find the maximum consecutive sequence in all check-ins

4. **Backfilling**: Users can add check-ins for past dates, which triggers streak recalculation

### Database Schema
- **User**: email, password (hashed), timezone (IANA format)
- **Habit**: name, description, userId, createdAt
- **CheckIn**: habitId, checkedInAt (UTC), localDate (string), userId
- **Unique Constraint**: (habitId, localDate) prevents duplicate check-ins per day

## Setup Instructions

### Prerequisites
- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/habit_tracker"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3000
```

4. Run database migrations:
```bash
npx prisma migrate dev
```

5. Start the backend server:
```bash
npm run dev
```

Backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:
```bash
npm run dev
```

Frontend will run on `http://localhost:5173`

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user with timezone
- `POST /api/auth/login` - Login and receive JWT token

### Habits
- `GET /api/habits` - Get all habits with streaks
- `POST /api/habits` - Create new habit
- `GET /api/habits/:id` - Get single habit with check-ins
- `PUT /api/habits/:id` - Update habit
- `DELETE /api/habits/:id` - Delete habit

### Check-ins
- `POST /api/habits/:id/checkins` - Create check-in (today or backfill)
- `GET /api/habits/:id/checkins` - Get all check-ins for a habit
- `DELETE /api/checkins/:id` - Delete a check-in

## Features

### Core Features
✅ User registration with timezone selection (IANA format)
✅ Secure authentication (JWT + bcrypt)
✅ Create, read, update, delete habits
✅ One-click "check in for today" button
✅ Backfill past dates
✅ Strict validation (no duplicates, no future dates, no pre-creation dates)
✅ Server-side streak calculation (current & longest)
✅ Responsive UI with Tailwind CSS
✅ Detailed habit history view
✅ Clear error messages

### Bonus Features
✅ Docker Compose for easy deployment
✅ Database-level unique constraint on (habitId, localDate)
✅ Isolated timezone conversion logic
✅ Comprehensive README

## Testing Edge Cases

The application handles these critical edge cases:

1. **20-hour gap, different days**: ✅ Counted as consecutive
2. **11-hour gap, same day**: ✅ Rejected as duplicate
3. **Backfilling gaps**: ✅ Correctly recalculates streaks
4. **Today vs Yesterday streak**: ✅ Streak alive if yesterday is logged
5. **Timezone boundaries**: ✅ Respects user's local midnight

## Example Scenario (Asia/Kolkata, UTC+05:30)

```
Check-in A: 2026-03-10T14:30Z → local 2026-03-10 20:00
Check-in B: 2026-03-11T10:30Z → local 2026-03-11 16:00
  (20 hours apart, different local days → streak = 2)

Check-in C: 2026-03-11T21:30Z → local 2026-03-12 03:00
  (11 hours after B, new local day → streak = 3)

Check-in D: 2026-03-12T17:30Z → local 2026-03-12 23:00
  (20 hours after C, SAME local day → REJECTED, streak stays 3)
```

## Docker Deployment (Bonus)

```bash
docker-compose up -d
```

This will start:
- PostgreSQL database
- Backend API
- Frontend web server
- Nginx reverse proxy

## Project Structure

```
habit-tracker/
├── backend/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── src/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── routes/
│   │   ├── utils/
│   │   └── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── .env
├── docker-compose.yml
└── README.md
```

## Implementation Highlights

1. **Timezone Conversion**: Centralized in `backend/src/utils/timezone.js`
2. **Streak Logic**: Pure function in `backend/src/utils/streaks.js`
3. **Validation**: Request validation middleware
4. **Security**: Environment variables, bcrypt (10 rounds), JWT tokens
5. **Error Handling**: Consistent error responses with meaningful messages

## Time Spent
- Planning & Design: 1 hour
- Backend Development: 3 hours
- Frontend Development: 2.5 hours
- Testing & Edge Cases: 1 hour
- Documentation: 0.5 hours
**Total: ~8 hours**

## Author
Built as a take-home assignment demonstrating fullstack development with complex timezone logic.
