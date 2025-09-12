# Docker npm Scripts Reference

This document lists all the Docker-related npm scripts available in the Security Control Tracker application.

## Scripts Overview

All scripts are cross-platform and work on Windows, macOS, and Linux.

### Docker Compose Scripts (Recommended)

| Script | Command | Description |
|--------|---------|-------------|
| `npm run docker:compose:up` | `docker-compose up --build -d` | Build and start services in background |
| `npm run docker:compose:down` | `docker-compose down` | Stop and remove containers |
| `npm run docker:compose:logs` | `docker-compose logs -f` | View container logs (real-time) |
| `npm run docker:compose:restart` | `docker-compose restart` | Restart services |

### Direct Docker Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `npm run docker:start` | `docker:build && docker:run` | Build image and run container |
| `npm run docker:stop` | `docker stop security-tracker-container` | Stop the running container |
| `npm run docker:restart` | `docker:stop && docker:remove && docker:start` | Full restart cycle |
| `npm run docker:logs` | `docker logs -f security-tracker-container` | View container logs |
| `npm run docker:shell` | `docker exec -it security-tracker-container sh` | Access container shell |
| `npm run docker:clean` | Multiple cleanup commands | Remove everything and cleanup |

### Individual Operations

| Script | Command | Description |
|--------|---------|-------------|
| `npm run docker:build` | `docker build -t security-tracker .` | Build Docker image only |
| `npm run docker:run` | `docker run -d -p 3001:3001...` | Run container (detached) |
| `npm run docker:remove` | `docker rm security-tracker-container` | Remove container |

## Usage Examples

### Quick Start
```bash
# Easiest - Docker Compose
npm run docker:compose:up

# Alternative - Direct Docker
npm run docker:start
```

### Development Workflow
```bash
# Start container
npm run docker:start

# View logs
npm run docker:logs

# Make changes to code, then restart
npm run docker:restart

# Access container for debugging
npm run docker:shell

# Clean up when done
npm run docker:clean
```

### Production Deployment
```bash
# Start in production mode
npm run docker:compose:up

# Monitor logs
npm run docker:compose:logs

# Restart if needed
npm run docker:compose:restart

# Stop when maintenance needed
npm run docker:compose:down
```

## Container Details

### Docker Compose
- **Image Name**: `jp-app-sec-security-tracker`  
- **Container Name**: `jp-app-sec-security-tracker-1`
- **Service Name**: `security-tracker`

### Direct Docker Commands
- **Image Name**: `security-tracker`
- **Container Name**: `security-tracker-container`

### Common Settings
- **Port**: 3001 (both API and frontend)
- **Data Volume**: `./data:/app/data`
- **Database**: SQLite (persisted in volume)

## Files Created

The Docker setup includes these files:
- `Dockerfile` - Multi-stage build configuration
- `docker-compose.yml` - Service configuration
- `.dockerignore` - Files to exclude from build
- `DOCKER.md` - Detailed deployment guide
- `DOCKER-SCRIPTS.md` - This reference file

## Script Features

✅ **Cross-Platform**: Work on Windows, macOS, Linux  
✅ **Error Handling**: Scripts continue on errors with `|| true`  
✅ **Volume Mounting**: Automatic data persistence  
✅ **Background Mode**: Containers run detached (`-d`)  
✅ **Easy Cleanup**: One command to remove everything  
✅ **Real-time Logs**: Live log viewing with `-f`