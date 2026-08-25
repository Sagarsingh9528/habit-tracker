# Habit Tracker Implementation Walkthrough

## Overview
This document explains the key implementation decisions and how the timezone-aware streak logic works.

## Architecture

### Tech Stack Choices
- **Backend**: Node.js + Express (lightweight, JavaScript throughout)
- **Database**: PostgreSQL + Prisma ORM (strong typing, easy migrations)
- **Frontend**: React + Vite (fast development, modern tooling)
- **Styling**: Tailwind CSS (rapid UI development)
- **Date/Timezone**: date-fns-tz (reliable timezone conversion)

### Folder Structure
```
habit-tracker/
├── backend/          # Express API server
│   ├── prisma/       # Database schema & migrations
│   └── src/
│       ├── controllers/  # Business logic
│       ├── routes/       # API endpoints
│       ├── middleware/   # Auth & validation
│       └── utils/        # Timezone & streak logic
└── frontend/         # React SPA
    └── src/
        ├── pages/        # Route components
        ├── components/   # Reusable UI
        ├── context/      # Auth state
        └── services/     # API client
```

## Core Implementation: Local Day Logic

### The Challenge
Two check-ins 20 hours apart might be:
- **Same day**: 2026-03-12 04:00 and 2026-03-12 23:59 → Duplicate ❌
- **Different days**: 2026-03-11 23:00 and 2026-03-12 19:00 → Valid ✅

The solution must respect the user's local timezone, not elapsed hours.

### The Solution

#### 1. Storage Model (`prisma/schema.prisma`)
```prisma
model CheckIn {
  checkedInAt  DateTime  // UTC timestamp (when check-in created)
  localDate    String    // "YYYY-MM-DD" in user's timezone
  
  @@unique([habitId, localDate])  // DB enforces one per local day
}
```

**Why two fields?**
- `checkedInAt`: Preserves exact moment (for audit, history)
- `localDate`: Makes querying and validation simple

**Database-level uniqueness**: The constraint `@@unique([habitId, localDate])` prevents duplicate check-ins at write time, not just in application logic.

#### 2. Timezone Conversion (`utils/timezone.js`)
```javascript
export function getLocalDate(utcDate, timezone) {
  return formatInTimeZone(utcDate, timezone, 'yyyy-MM-dd');
}
```

This function is called:
- When creating a check-in → converts NOW (UTC) to user's local date
- When backfilling → validates the requested date
- When checking duplicates → compares local date strings

**Example**:
```javascript
// User in Asia/Kolkata (UTC+05:30)
getLocalDate('2026-03-11T21:30:00Z', 'Asia/Kolkata')
// Returns: "2026-03-12" (next calendar day)

getLocalDate('2026-03-11T10:30:00Z', 'Asia/Kolkata')
// Returns: "2026-03-11" (same calendar day)
```

#### 3. Validation (`controllers/checkInController.js`)
Before creating a check-in:
```javascript
// 1. Reject future dates
if (isDateInFuture(localDate, userTimezone)) {
  return error('Cannot check in for future dates');
}

// 2. Reject dates before habit creation
if (isDateBeforeCreation(localDate, habit.createdAt, userTimezone)) {
  return error('Cannot check in before habit was created');
}

// 3. Database rejects duplicates (unique constraint)
```

#### 4. Streak Calculation (`utils/streaks.js`)
```javascript
export function calculateStreaks(checkIns, userTimezone) {
  // Sort by local date descending
  const sortedDates = checkIns
    .map(c => c.localDate)
    .sort((a, b) => b.localeCompare(a));
  
  const today = getCurrentLocalDate(userTimezone);
  const yesterday = subtractDays(today, 1);
  
  // Current streak only counts if today or yesterday is logged
  if (mostRecentDate === today || mostRecentDate === yesterday) {
    // Count consecutive days backwards
    currentStreak = countConsecutiveDays(sortedDates);
  } else {
    currentStreak = 0; // Streak broken
  }
  
  // Longest streak: find max consecutive sequence
  longestStreak = findLongestSequence(sortedDates);
}
```

**Key decisions**:
- Streak is "alive" if yesterday is logged (grace period)
- Pure function: no side effects, easy to test
- Works with backfilled data automatically

## Edge Cases Handled

### 1. Same-Day Duplicate (11 hours apart)
```
Check-in A: 2026-03-12T02:00Z → local 2026-03-12
Check-in B: 2026-03-12T13:00Z → local 2026-03-12
Result: ❌ Rejected by DB unique constraint
```

### 2. Different-Day Valid (20 hours apart)
```
Check-in A: 2026-03-11T14:30Z → local 2026-03-11
Check-in B: 2026-03-12T10:30Z → local 2026-03-12
Result: ✅ Accepted, streak = 2
```

### 3. Backfilling Gaps
```
Initial: [2026-03-10, 2026-03-12, 2026-03-13]
Streak: 2 (12→13)

Backfill: 2026-03-11
Result: [2026-03-10, 2026-03-11, 2026-03-12, 2026-03-13]
Streak: 4 (10→11→12→13)
```

### 4. Timezone Edge (Midnight Crossing)
```
User timezone: Asia/Kolkata (UTC+05:30)
UTC: 2026-03-11T20:00Z
Local: 2026-03-12T01:30 (crossed midnight)
Stored as: "2026-03-12"
```

### 5. Daylight Saving Time
The `date-fns-tz` library handles DST transitions automatically. The local date is calculated at the moment of check-in, so spring-forward/fall-back doesn't affect existing records.

## API Design

### Authentication
```
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```
- JWT tokens (7-day expiration)
- Bcrypt password hashing (10 rounds)
- Timezone stored at registration

### Habits
```
GET    /api/habits              # List with streaks
POST   /api/habits              # Create
GET    /api/habits/:id          # Detail with check-ins
PUT    /api/habits/:id          # Update name/description
DELETE /api/habits/:id          # Delete (cascades check-ins)
```

### Check-ins
```
POST   /api/habits/:id/checkins     # Check in (today or backfill)
GET    /api/habits/:id/checkins     # History
DELETE /api/checkins/:id            # Remove check-in
```

**Request body for backfill**:
```json
{
  "localDate": "2026-03-10"  // Optional: defaults to today
}
```

## Frontend Implementation

### State Management
- **AuthContext**: User authentication state
- **Component State**: Habits, check-ins (fetched on mount)
- **No Redux**: Simple app doesn't need it

### Key Components
1. **Dashboard**: List of habits with quick check-in
2. **HabitDetail**: Full history with backfill option
3. **CreateHabitModal**: Floating form
4. **BackfillModal**: Date picker with validation

### User Experience
- ✅ One-click check-in for today
- ✅ Disabled button if already completed
- ✅ Visual streak indicators (🔥)
- ✅ Clear error messages (duplicate, future date)
- ✅ Responsive design (mobile-friendly)

## Security

### Backend
- Environment variables for secrets
- JWT token validation on protected routes
- Ownership checks (users can't modify others' habits)
- SQL injection prevention (Prisma parameterizes queries)

### Frontend
- Token stored in localStorage
- Automatic redirect on 401 (expired token)
- Input validation before API calls

## Testing Strategy (Not Implemented, But Recommended)

### Unit Tests
```javascript
// utils/streaks.test.js
test('current streak includes yesterday', () => {
  const checkIns = [
    { localDate: '2026-03-10' },
    { localDate: '2026-03-09' }
  ];
  const result = calculateStreaks(checkIns, 'Asia/Kolkata');
  expect(result.currentStreak).toBe(2);
});
```

### Integration Tests
- API endpoint tests with test database
- Timezone edge cases (midnight, DST)
- Duplicate check-in scenarios

### E2E Tests
- Complete user flow: Register → Create habit → Check in → View streaks

## Deployment

### Docker Compose
```bash
docker-compose up -d
```
Starts:
- PostgreSQL database
- Backend API (with migrations)
- Frontend (nginx)

### Manual Setup
See README.md for step-by-step instructions.

## Performance Considerations

### Database Indexes
```sql
CREATE INDEX habits_userId_idx ON habits(userId);
CREATE INDEX check_ins_habitId_idx ON check_ins(habitId);
CREATE UNIQUE INDEX check_ins_habitId_localDate_key 
  ON check_ins(habitId, localDate);
```

### Query Optimization
- Include check-ins in habit queries (eager loading)
- Sort on database side (ORDER BY localDate DESC)

### Frontend
- React component memoization (if needed)
- Lazy loading routes (code splitting)

## Known Limitations & Future Enhancements

### Current Limitations
1. No pagination (fine for <100 habits)
2. No timezone change feature (would need migration plan)
3. No notifications/reminders
4. No data export

### Possible Enhancements
1. **Calendar View**: Visualize check-in history
2. **Habit Categories**: Group habits (health, work, etc.)
3. **Team Habits**: Share accountability with friends
4. **Analytics**: Monthly completion rates, trends
5. **Mobile App**: React Native version
6. **Reminder System**: Daily notifications
7. **Streak Freezes**: Allow one missed day per week

## Time Breakdown

- **Planning & Design**: 1 hour
  - Database schema design
  - API endpoint planning
  - Timezone logic research

- **Backend Development**: 3 hours
  - Prisma setup & migrations
  - Auth controllers (bcrypt, JWT)
  - Habit CRUD endpoints
  - Check-in validation logic
  - Streak calculation utility

- **Frontend Development**: 2.5 hours
  - React + Vite setup
  - Auth context & routing
  - Dashboard & habit detail pages
  - Modal components
  - Tailwind styling

- **Testing & Edge Cases**: 1 hour
  - Manual testing of timezone scenarios
  - Duplicate check-in testing
  - Backfill validation
  - Error handling

- **Documentation**: 0.5 hours
  - README with setup instructions
  - This walkthrough document
  - Code comments

**Total: ~8 hours**

## Key Takeaways

1. **Server-side streak calculation is mandatory**: Frontend should never decide if a streak is alive.

2. **Store both UTC timestamp and local date**: Preserves audit trail while simplifying queries.

3. **Database constraints prevent edge cases**: Unique index on (habitId, localDate) is critical.

4. **Timezone conversion belongs in one place**: Centralized utility functions prevent bugs.

5. **Backfilling requires streak recalculation**: Every check-in fetch should recalculate streaks.

## Questions & Answers

**Q: Why not store timezone-aware timestamps in PostgreSQL?**
A: Storing local date strings (`"2026-03-12"`) makes validation and uniqueness checks trivial. Converting timestamps for every query would be slower.

**Q: What if a user travels and changes timezone?**
A: Historical check-ins stay as-is. Future check-ins use the new timezone. This is consistent with how calendar apps work.

**Q: How do you handle users who check in at 23:59 and 00:01?**
A: If those times are in different local days, they're two separate check-ins. This is correct behavior.

**Q: Can streaks go backwards?**
A: No. Longest streak is the maximum of all consecutive sequences. Current streak can drop to 0 if broken.

---

Built with ❤️ for timezone-aware habit tracking.
