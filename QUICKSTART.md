# Quick Start Guide

## Option 1: Docker (Easiest)

If you have Docker and Docker Compose installed:

```bash
docker-compose up -d
```

That's it! The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

## Option 2: Manual Setup

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Step 1: Clone and Setup

**Linux/Mac:**
```bash
chmod +x setup.sh
./setup.sh
```

**Windows:**
```bash
setup.bat
```

### Step 2: Configure Database

1. Create a PostgreSQL database:
```sql
CREATE DATABASE habit_tracker;
```

2. Update `backend/.env`:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/habit_tracker"
JWT_SECRET="your-secret-key-at-least-32-characters-long"
PORT=3000
```

### Step 3: Run Migrations

```bash
cd backend
npx prisma migrate dev
```

### Step 4: Start Development Servers

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Step 5: Access the Application

Open your browser to http://localhost:5173

## First Time Usage

1. Click "Create Account"
2. Enter your email, password, and select your timezone
3. Create your first habit (e.g., "Drink Water")
4. Click "Check In" to log your first day
5. Come back tomorrow to build your streak!

## Testing the Timezone Logic

To verify the local day logic works correctly:

1. Create a habit
2. Check in for today
3. Try to check in again → Should see "You have already checked in for this day"
4. Click "Details" → "Add Past Check-in" to backfill a previous date
5. Watch your streak recalculate automatically

## Troubleshooting

### Backend won't start
- Check PostgreSQL is running: `psql -U postgres -c "SELECT version();"`
- Verify DATABASE_URL in backend/.env
- Run migrations: `npx prisma migrate dev`

### Frontend can't reach backend
- Verify backend is running on port 3000
- Check VITE_API_URL in frontend/.env matches your backend URL

### Database errors
- Reset database: `npx prisma migrate reset`
- Check logs: `docker-compose logs backend` (if using Docker)

## Example Timezone Test Case

**Scenario**: User in Asia/Kolkata (UTC+05:30)

**Test 1: Same day duplicate**
1. Check in at 2026-03-12 04:00 (local time)
2. Try checking in at 2026-03-12 23:00 (local time)
3. Expected: Error "You have already checked in for this day"

**Test 2: Different day valid**
1. Check in at 2026-03-11 23:00 (local time)
2. Check in at 2026-03-12 19:00 (local time) - 20 hours later
3. Expected: Success, streak = 2

## Useful Commands

### Backend
```bash
# Start dev server with auto-reload
npm run dev

# Run Prisma Studio (DB GUI)
npx prisma studio

# Generate Prisma client
npx prisma generate

# Reset database
npx prisma migrate reset
```

### Frontend
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Docker
```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down

# Reset everything
docker-compose down -v
```

## API Testing with curl

### Register
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "timezone": "Asia/Kolkata"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Create Habit (requires token)
```bash
curl -X POST http://localhost:3000/api/habits \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Drink Water",
    "description": "Drink 8 glasses of water daily"
  }'
```

### Check In
```bash
curl -X POST http://localhost:3000/api/habits/HABIT_ID/checkins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{}'
```

### Backfill Check-in
```bash
curl -X POST http://localhost:3000/api/habits/HABIT_ID/checkins \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "localDate": "2026-03-10"
  }'
```

## Next Steps

- Read [README.md](README.md) for architecture details
- See [IMPLEMENTATION_WALKTHROUGH.md](IMPLEMENTATION_WALKTHROUGH.md) for implementation details
- Check out the Prisma schema in `backend/prisma/schema.prisma`
- Explore the timezone logic in `backend/src/utils/timezone.js`
- Review the streak calculation in `backend/src/utils/streaks.js`

Happy habit tracking! 🎯
