# npm Commands Reference

Complete reference for all npm scripts available in the Security Control Tracker application.

## Quick Start

```bash
# Install dependencies
npm install

# Start the application (development)
npm run start

# Access the application
open http://localhost:5173
```

## Development Commands

### Application Lifecycle

| Command | Description | Details |
|---------|-------------|---------|
| `npm run start` | Start both frontend and backend | Runs on ports 5173 (frontend) and 3001 (backend) |
| `npm run dev:full` | Same as start | Alternative command name |
| `npm run stop` | Stop all running servers | Cross-platform process termination |
| `npm run restart` | Restart all servers | Stops then starts services |
| `npm run status` | Check server status | Shows if servers are running |
| `npm run clean` | Clean temporary files and stop servers | Removes logs and build artifacts |

### Individual Services

| Command | Description | Port |
|---------|-------------|------|
| `npm run dev` | Start frontend only | 5173 |
| `npm run dev:server` | Start backend only | 3001 |
| `npm run start:prod` | Start production server | 3001 |

### Build & Testing

| Command | Description | Notes |
|---------|-------------|-------|
| `npm run build` | Build production frontend | Includes TypeScript compilation |
| `npm run lint` | Run ESLint code linting | Check code quality |
| `npm run preview` | Preview production build | Uses Vite preview |
| `npm run test` | Run Jest unit tests | |
| `npm run test:watch` | Run tests in watch mode | Automatically reruns on changes |
| `npm run test:coverage` | Generate test coverage report | Creates coverage/ directory |
| `npm run test:ui` | Run tests with verbose output | Detailed test results |

### End-to-End Testing

| Command | Description | Notes |
|---------|-------------|-------|
| `npm run e2e` | Run Playwright E2E tests | Full browser automation tests |
| `npm run e2e:ui` | Run E2E tests with UI | Visual test runner |
| `npm run e2e:report` | Show E2E test report | Opens HTML report |

## Database Commands

### Setup & Development

| Command | Description | When to Use |
|---------|-------------|-------------|
| `npm run db:generate` | Generate new migration | After schema changes |
| `npm run db:migrate` | Run database migrations | Set up database structure |
| `npm run db:seed` | Seed database with sample data | Add demo data for development |
| `npm run db:setup` | Complete database setup | Runs migrate + seed |

### Data Management

| Command | Description | Output/Input |
|---------|-------------|--------------|
| `npm run db:export` | Export database to JSON | Creates `exports/security-tracker-export-YYYY-MM-DD.json` |
| `npm run db:import <file>` | Import database from JSON | Restores data from export file |
| `npm run db:wipe` | Wipe database with confirmation | Interactive confirmation required |
| `npm run db:wipe:force` | Force wipe without confirmation | ⚠️ Immediate data deletion |
| `npm run db:wipe:complete` | Delete entire database file | ⚠️ Removes `security-tracker.db` |

#### Database Workflow Examples

```bash
# Initial setup
npm run db:migrate
npm run db:seed

# Backup current data
npm run db:export

# Reset to clean state
npm run db:wipe:force
npm run db:seed

# Restore from backup
npm run db:import security-tracker-export-2024-01-15.json
```

## Docker Commands

### Docker Compose (Recommended)

| Command | Description | Action |
|---------|-------------|--------|
| `npm run docker:compose:up` | Build and start services | Production deployment |
| `npm run docker:compose:down` | Stop and remove containers | Clean shutdown |
| `npm run docker:compose:logs` | View container logs | Real-time log monitoring |
| `npm run docker:compose:restart` | Restart services | Quick service restart |

### Direct Docker Management

| Command | Description | Use Case |
|---------|-------------|----------|
| `npm run docker:start` | Build and run container | Single container deployment |
| `npm run docker:stop` | Stop running container | Pause container |
| `npm run docker:restart` | Full container restart | Apply changes |
| `npm run docker:logs` | View container logs | Debug container issues |
| `npm run docker:shell` | Access container shell | Container debugging |
| `npm run docker:clean` | Remove all Docker artifacts | Complete cleanup |

### Individual Docker Operations

| Command | Description | Prerequisites |
|---------|-------------|---------------|
| `npm run docker:build` | Build Docker image only | Dockerfile present |
| `npm run docker:run` | Run existing container | Image already built |
| `npm run docker:remove` | Remove container only | Container exists |

#### Docker Workflow Examples

```bash
# Quick production deployment
npm run docker:compose:up

# Development with Docker
npm run docker:start
npm run docker:logs

# Complete cleanup
npm run docker:clean
```

## Command Categories Summary

### 🚀 **Quick Start Commands**
```bash
npm install              # Install dependencies
npm run start           # Start development
npm run docker:start    # Start in Docker
```

### 🔧 **Development Workflow**
```bash
npm run dev:full        # Start both servers
npm run test:watch      # Run tests continuously
npm run lint           # Check code quality
npm run build          # Build for production
```

### 🗄️ **Database Management**
```bash
npm run db:setup        # Initialize database
npm run db:export       # Backup data
npm run db:wipe:force   # Reset database
npm run db:import <file> # Restore data
```

### 🐳 **Docker Deployment**
```bash
npm run docker:compose:up    # Deploy with compose
npm run docker:logs          # Monitor logs
npm run docker:compose:down  # Stop deployment
```

### 🛠️ **Maintenance**
```bash
npm run stop            # Stop all services
npm run clean          # Clean temporary files
npm run status         # Check service status
npm run restart        # Restart everything
```

## Cross-Platform Compatibility

All commands work on:
- ✅ Windows (PowerShell, Command Prompt)
- ✅ macOS (Terminal, iTerm)  
- ✅ Linux (Bash, Zsh)

## Port Usage

| Service | Port | URL |
|---------|------|-----|
| Frontend (dev) | 5173 | http://localhost:5173 |
| Backend API | 3001 | http://localhost:3001 |
| Docker (production) | 3001 | http://localhost:3001 |

## Troubleshooting Commands

```bash
# Services won't start
npm run stop
npm run start

# Port conflicts
npm run status          # Check what's running
lsof -i :3001          # Check port usage (macOS/Linux)
netstat -ano | findstr :3001  # Check port usage (Windows)

# Database issues
rm security-tracker.db
npm run db:setup

# Docker issues
npm run docker:clean
npm run docker:start
```

## Environment-Specific Commands

### Development
```bash
npm run start          # Hot reload enabled
npm run test:watch     # Continuous testing
npm run lint          # Code quality checks
```

### Production
```bash
npm run build         # Optimized build
npm run start:prod    # Production server
npm run docker:compose:up  # Docker deployment
```

### Testing
```bash
npm run test          # Unit tests
npm run test:coverage # Coverage report
npm run e2e          # End-to-end tests
npm run lint         # Code linting
```

## Notes

- All database commands work with SQLite
- Docker commands require Docker to be installed and running
- Cross-platform scripts handle Windows/macOS/Linux differences automatically
- Use `npm run docker:compose:up` for the easiest deployment experience
- Data persists between container restarts when using volume mounting