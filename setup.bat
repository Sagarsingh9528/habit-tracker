@echo off
REM Habit Tracker Setup Script for Windows
REM This script helps you set up the development environment

echo 🎯 Habit Tracker Setup
echo =======================
echo.

REM Check for Node.js
where node >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js version:
node --version

REM Check for PostgreSQL
where psql >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ⚠️  PostgreSQL not found. You'll need to install it manually.
    echo    Visit: https://www.postgresql.org/download/
) else (
    echo ✅ PostgreSQL found
)

echo.
echo 📦 Installing Backend Dependencies...
cd backend
call npm install

echo.
echo ⚙️  Setting up Backend Environment...
if not exist .env (
    copy .env.example .env
    echo ✅ Created backend\.env file
    echo ⚠️  Please edit backend\.env and update DATABASE_URL and JWT_SECRET
) else (
    echo ✅ backend\.env already exists
)

echo.
echo 📦 Installing Frontend Dependencies...
cd ..\frontend
call npm install

echo.
echo ⚙️  Setting up Frontend Environment...
if not exist .env (
    copy .env.example .env
    echo ✅ Created frontend\.env file
) else (
    echo ✅ frontend\.env already exists
)

cd ..

echo.
echo ✅ Setup Complete!
echo.
echo Next Steps:
echo 1. Make sure PostgreSQL is running
echo 2. Update backend\.env with your database credentials
echo 3. Run database migrations: cd backend ^&^& npx prisma migrate dev
echo 4. Start backend: cd backend ^&^& npm run dev
echo 5. Start frontend: cd frontend ^&^& npm run dev
echo.
echo Or use Docker Compose:
echo   docker-compose up -d
echo.
echo 📚 See README.md for detailed instructions

pause
