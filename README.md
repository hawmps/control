# Security Control Tracker

A web application for tracking security control implementation status across environments in your organization.

## Features

- **Security Control Status Matrix** - View implementation status (Red/Yellow/Green) for all controls across all environments
- **Environment Management** - Add, edit, and manage environments requiring security controls
- **Security Controls Management** - Define and manage your security controls
- **Interactive Status Updates** - Click on status indicators to update implementation status and notes
- **Document Management** - Manage documentation and files
- **Docker Support** - Single-container deployment for production

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm
- Docker (optional, for containerized deployment)

## Development Mode

Perfect for local development with hot reloading and separate frontend/backend servers.

### Installation

```bash
# Clone or download this repository
cd jp-app-sec

# Install dependencies
npm install

# Set up database and seed data
npm run db:migrate
npm run db:seed
```

### Development Commands

**Cross-platform commands (work on Windows, Mac, and Linux):**

```bash
# Start both frontend and backend servers
npm run start
# or 
npm run dev:full

# Check server status
npm run status

# Stop all servers
npm run stop

# Restart servers
npm run restart

# Clean temporary files
npm run clean
```

**Individual server commands:**
```bash
# Start frontend only (port 5173)
npm run dev

# Start backend only (port 3001)
npm run dev:server

# Build production version
npm run build

# Run tests
npm run test

# Lint code
npm run lint
```

### Development URLs

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001/api

## Production Deployment (Docker)

Single-container deployment with built-in database and optimized for production.

### Quick Docker Start

```bash
# Using Docker Compose (recommended)
npm run docker:compose:up

# Access the application at http://localhost:3001
```

### Docker Commands

**Docker Compose (Recommended):**
```bash
npm run docker:compose:up      # Build and start services in background
npm run docker:compose:down    # Stop and remove containers
npm run docker:compose:logs    # View logs (real-time)
npm run docker:compose:restart # Restart services
```

**Direct Docker Management:**
```bash
npm run docker:start          # Build and run container
npm run docker:stop           # Stop container
npm run docker:restart        # Restart container
npm run docker:logs           # View container logs
npm run docker:shell          # Access container shell
npm run docker:clean          # Remove containers and images
```

### Docker Features

- **Single Port**: Both frontend and API accessible on port 3001
- **Persistent Data**: Database persists in `./data/` directory
- **Production Optimized**: Multi-stage build with minimal image size
- **Auto Database Setup**: Migrations run automatically on container start
- **Cross-Platform**: Works on Windows, macOS, and Linux

### Docker URLs

- **Application**: http://localhost:3001 (frontend + API)
- **API Endpoints**: http://localhost:3001/api/*

### Container Database Management

```bash
# Seed database inside running container
docker exec jp-app-sec-security-tracker-1 npm run db:setup

# Access container shell for database operations
npm run docker:shell

# Export database from container
docker exec jp-app-sec-security-tracker-1 npm run db:export

# View container logs
npm run docker:logs
```

## Database Commands

Works in both development and Docker environments:

```bash
# Setup & Development
npm run db:setup          # Complete database setup (migrate + seed)
npm run db:generate       # Generate new migration
npm run db:migrate        # Run migrations
npm run db:seed          # Seed database with sample data

# Data Management
npm run db:export        # Export database to JSON file
npm run db:import <file> # Import database from JSON file
npm run db:wipe          # Wipe database clean (with confirmation)
npm run db:wipe:force    # Force wipe without confirmation
npm run db:wipe:complete # Delete entire database file
```

### Database Export/Import Examples

```bash
# Export your current database
npm run db:export
# Creates: exports/security-tracker-export-YYYY-MM-DD.json

# Import a specific backup
npm run db:import security-tracker-export-2024-01-15.json

# Quick backup and restore workflow
npm run db:export          # Create backup
npm run db:wipe:force      # Clear everything
npm run db:import <file>   # Restore from backup
```

### Docker Database Examples

```bash
# Seed fresh data in Docker container
docker exec jp-app-sec-security-tracker-1 npm run db:setup

# Export data from Docker container
docker exec jp-app-sec-security-tracker-1 npm run db:export

# Access container to manage database
npm run docker:shell
# Inside container: npm run db:seed, npm run db:export, etc.
```

## Usage

### Development Mode
1. **Start the servers**: `npm run start`
2. **Open your browser**: Navigate to http://localhost:5173
3. **Frontend**: Vite dev server with hot reloading
4. **Backend**: Express API server on port 3001

### Production Mode (Docker)
1. **Start container**: `npm run docker:compose:up`
2. **Open your browser**: Navigate to http://localhost:3001
3. **Single container**: Frontend and API served from same port

### Application Features
1. **View Control Status**: The main page shows your security control matrix
2. **Update Status**: Click any colored dot to update implementation status and notes
3. **Manage Environments**: Use "Manage Environments" to add/edit environments
4. **Manage Controls**: Use "Security Controls" to add/edit security controls
5. **Access Documents**: Use "Documents" for document management

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, SQLite
- **Database ORM**: Drizzle ORM  
- **Development**: Hot module reloading, concurrently for multi-server management
- **Production**: Docker multi-stage builds, single-container deployment

## Project Structure

```
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/             # Route components
│   ├── types/             # TypeScript type definitions
│   ├── services/          # API services
│   ├── db/                # Database schema and utilities
│   └── styles/            # Global styles
├── scripts/               # Utility scripts
├── server.js              # Express API server
├── drizzle/              # Database migrations
├── Dockerfile            # Docker build configuration
├── docker-compose.yml    # Docker Compose configuration
└── DOCKER*.md           # Docker documentation
```

## Development vs Production

| Feature | Development Mode | Production Mode (Docker) |
|---------|------------------|--------------------------|
| **Frontend** | http://localhost:5173 | http://localhost:3001 |
| **API** | http://localhost:3001 | http://localhost:3001 |
| **Hot Reload** | ✅ Yes | ❌ No |
| **Database** | `./security-tracker.db` | `./data/security-tracker.db` |
| **Build** | Development build | Optimized production build |
| **Servers** | Separate processes | Single container |
| **Use Case** | Active development | Production deployment |

## Troubleshooting

### Development Issues

**Servers won't start:**
```bash
npm run stop    # Kill any stuck processes
npm run start   # Try starting again
```

**Port conflicts:**
```bash
# Check what's using the ports
lsof -i :5173   # Frontend port
lsof -i :3001   # Backend port
```

**Database issues:**
```bash
# Reset database
rm security-tracker.db
npm run db:migrate
npm run db:seed
```

### Docker Issues

**Container won't start:**
```bash
# Check container status
docker ps -a

# View container logs
npm run docker:logs

# Complete cleanup and restart
npm run docker:clean
npm run docker:compose:up
```

**Database issues in container:**
```bash
# Reset container database
docker exec jp-app-sec-security-tracker-1 npm run db:wipe:complete
docker exec jp-app-sec-security-tracker-1 npm run db:setup

# Or rebuild container completely
npm run docker:compose:down
npm run docker:compose:up --build
```

**Can't access application:**
- Development: Check http://localhost:5173 and http://localhost:3001
- Docker: Check http://localhost:3001
- Ensure no other services are using these ports

## Control Status Colors

- 🟢 **Green**: Compliant - Control is fully implemented
- 🟡 **Yellow**: In Progress - Control is being implemented  
- 🔴 **Red**: Non-Compliant - Control is not implemented

## Documentation

- [DOCKER.md](DOCKER.md) - Detailed Docker deployment guide
- [DOCKER-SCRIPTS.md](DOCKER-SCRIPTS.md) - Complete npm scripts reference
- [DOCKER-TROUBLESHOOTING.md](DOCKER-TROUBLESHOOTING.md) - Docker troubleshooting guide
- [NPM-COMMANDS.md](NPM-COMMANDS.md) - All available npm commands