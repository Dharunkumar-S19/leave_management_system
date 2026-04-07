@echo off
echo Starting Leave Management System...

echo Checking/Installing Backend Dependencies...
cd backend
call npm install

echo Checking/Installing Frontend Dependencies...
cd ../frontend
call npm install

cd ..
echo Starting Backend and Frontend Servers...
start cmd /k "cd backend && npm run dev"
start cmd /k "cd frontend && npm run dev"

echo System started! Please test the application in your browser.
exit
