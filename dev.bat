@echo off
REM Security Control Tracker - Windows Development Commands

if "%1"=="start" (
    echo Starting Security Control Tracker servers...
    npm run start
    goto :eof
)

if "%1"=="stop" (
    echo Stopping all servers...
    npm run stop
    goto :eof
)

if "%1"=="restart" (
    echo Restarting servers...
    npm run restart
    goto :eof
)

if "%1"=="status" (
    echo Checking server status...
    npm run status
    goto :eof
)

if "%1"=="clean" (
    echo Cleaning temporary files...
    npm run clean
    goto :eof
)

if "%1"=="export" (
    echo Exporting database...
    npm run db:export
    goto :eof
)

if "%1"=="import" (
    echo Importing database...
    if "%2"=="" (
        npm run db:import
    ) else (
        npm run db:import %2
    )
    goto :eof
)

if "%1"=="wipe" (
    echo Wiping database...
    npm run db:wipe
    goto :eof
)

if "%1"=="help" (
    goto :help
)

if "%1"=="" (
    goto :help
)

echo Unknown command: %1
echo.

:help
echo Security Control Tracker - Available Commands:
echo.
echo   dev start     - Start both frontend and backend servers
echo   dev stop      - Stop all running servers  
echo   dev restart   - Stop and restart all servers
echo   dev status    - Check status of running servers
echo   dev clean     - Clean up temporary files
echo   dev export    - Export database to JSON file
echo   dev import    - Import database from JSON file
echo   dev wipe      - Wipe database clean (with confirmation)
echo   dev help      - Show this help message
echo.
echo Alternative: You can also use npm commands directly:
echo   npm run start, npm run stop, npm run status, etc.
echo.