# Docker Troubleshooting Guide

## Container Name Issues Fixed ✅

The npm scripts now correctly handle both container naming patterns:

| Method | Container Name | npm Script Usage |
|--------|---------------|------------------|
| **Docker Compose** | `jp-app-sec-security-tracker-1` | `npm run docker:compose:*` |
| **Direct Docker** | `security-tracker-container` | `npm run docker:*` |

The scripts automatically try both names, so commands like `npm run docker:logs` and `npm run docker:shell` work regardless of how you started the container.

## Common Issues & Solutions

### 🔄 Container Keeps Restarting

**Symptoms:**
- Container status shows "Restarting"
- Logs show repeated database setup runs
- Application not accessible

**Check the issue:**
```bash
npm run docker:logs
# or
docker logs jp-app-sec-security-tracker-1
```

**Common causes:**
1. **TypeScript compilation errors** - The app fails to start due to TS errors
2. **Missing dependencies** - Node modules not properly installed
3. **Database permission issues** - Can't write to data directory
4. **Port conflicts** - Port 3001 already in use

**Solutions:**
```bash
# Stop everything and restart clean
npm run docker:compose:down
npm run docker:clean
npm run docker:compose:up

# Check for port conflicts
lsof -i :3001              # macOS/Linux
netstat -ano | findstr :3001   # Windows

# Check data directory permissions
ls -la data/
```

### 📁 Data Directory Issues

**Create data directory if missing:**
```bash
mkdir -p data
chmod 755 data
```

**Fix permissions on Linux/macOS:**
```bash
sudo chown -R $(whoami):$(whoami) data
```

### 🔧 TypeScript Build Issues

The container skips TypeScript checking and uses `vite build --mode production`. If you see build errors:

**Check build works locally:**
```bash
npx vite build --mode production
```

**If build fails, check for:**
- Missing dependencies: `npm install`
- Outdated packages: `npm update`
- TypeScript errors in critical files

### 🌐 Frontend Not Loading

**Symptoms:**
- http://localhost:3001 shows 404 or blank page
- API endpoints work but frontend doesn't

**Solutions:**
1. **Verify dist directory exists in container:**
   ```bash
   npm run docker:shell
   ls -la dist/
   ```

2. **Rebuild container:**
   ```bash
   npm run docker:compose:down
   npm run docker:compose:up --build
   ```

3. **Check server.js static file serving:**
   ```bash
   npm run docker:shell
   cat server.js | grep "express.static"
   ```

### 🗄️ Database Issues

**Container can't access database:**
```bash
# Check data volume mounting
npm run docker:shell
ls -la /app/data/
```

**Database corruption:**
```bash
# Wipe and restart (DESTRUCTIVE)
npm run docker:compose:down
rm -rf data/
mkdir data
npm run docker:compose:up
```

### 🐳 Docker Environment Issues

**Docker not running:**
```bash
# Start Docker Desktop or Docker daemon
sudo systemctl start docker    # Linux
# or open Docker Desktop app
```

**Permission issues (Linux):**
```bash
sudo usermod -aG docker $USER
# Then logout/login or restart terminal
```

**Clean Docker state:**
```bash
npm run docker:clean
docker system prune -a
```

## Debugging Commands

### Check Container Status
```bash
# List all containers
docker ps -a

# Check specific container
docker inspect jp-app-sec-security-tracker-1
```

### Access Container
```bash
# Get shell access
npm run docker:shell

# Run commands inside container
docker exec -it jp-app-sec-security-tracker-1 ls -la
docker exec -it jp-app-sec-security-tracker-1 ps aux
```

### Monitor Resources
```bash
# Check container resource usage
docker stats jp-app-sec-security-tracker-1

# Check logs in real-time
npm run docker:logs
```

### Test Application Components
```bash
# Test API directly
curl http://localhost:3001/api/items

# Test frontend
curl http://localhost:3001

# Test specific endpoints
curl http://localhost:3001/api/matrix
```

## Recovery Procedures

### Complete Reset
```bash
# Nuclear option - start completely fresh
npm run docker:compose:down
npm run docker:clean
docker system prune -a
rm -rf data/
npm run docker:compose:up
```

### Partial Reset (Keep Data)
```bash
# Keep database, rebuild container
npm run docker:compose:down
docker rmi jp-app-sec-security-tracker
npm run docker:compose:up --build
```

### Development Reset
```bash
# Go back to development mode
npm run docker:compose:down
npm run stop
npm run start
```

## Success Indicators

**Container running properly:**
```bash
docker ps
# Should show "Up" status, not "Restarting"
```

**Application accessible:**
- http://localhost:3001 → Security Control Tracker UI loads
- http://localhost:3001/api/items → Returns JSON data
- No errors in logs: `npm run docker:logs`

**Logs show:**
```
✅ Database migrations completed  
✅ Database seeded successfully!
✅ Security Tracker API server running at http://localhost:3001
```

## When All Else Fails

1. **Capture logs:** `npm run docker:logs > container-logs.txt`
2. **Check Docker version:** `docker --version`
3. **Try development mode:** `npm run start` 
4. **Check system resources:** `docker system df`
5. **Restart Docker:** Restart Docker Desktop/daemon

The key insight is that Docker Compose creates containers with the project directory name prefix (`jp-app-sec-`), while direct Docker commands use the exact name you specify!