# Security Control Tracker - Development Commands
.PHONY: help start stop restart status clean install build test db-export db-import db-wipe

# Default target
help:
	@echo "Security Control Tracker - Available Commands:"
	@echo ""
	@echo "  make start      - Start both frontend and backend servers"
	@echo "  make stop       - Stop all running servers"
	@echo "  make restart    - Stop and restart all servers"
	@echo "  make status     - Check status of running servers"
	@echo "  make install    - Install all dependencies"
	@echo "  make build      - Build the application"
	@echo "  make test       - Run tests"
	@echo "  make clean      - Clean up processes and temporary files"
	@echo "  make db-export  - Export database to JSON file"
	@echo "  make db-import  - Import database from JSON file"
	@echo "  make db-wipe    - Wipe database clean (with confirmation)"
	@echo ""

# Start both servers
start:
	@echo "Starting Security Control Tracker servers..."
	@npm run dev:full

# Stop all servers
stop:
	@echo "Stopping all servers..."
	@pkill -f "concurrently" 2>/dev/null || true
	@pkill -f "tsx server.js" 2>/dev/null || true  
	@pkill -f "vite" 2>/dev/null || true
	@sleep 1
	@echo "All servers stopped."

# Restart servers
restart: stop start

# Check server status
status:
	@echo "Checking server status..."
	@echo ""
	@if pgrep -f "concurrently" > /dev/null 2>&1; then \
		echo "✅ Concurrently process: RUNNING"; \
	else \
		echo "❌ Concurrently process: STOPPED"; \
	fi
	@if pgrep -f "tsx server.js" > /dev/null 2>&1; then \
		echo "✅ Backend server (tsx): RUNNING"; \
	else \
		echo "❌ Backend server (tsx): STOPPED"; \
	fi
	@if pgrep -f "vite" > /dev/null 2>&1; then \
		echo "✅ Frontend server (vite): RUNNING"; \
	else \
		echo "❌ Frontend server (vite): STOPPED"; \
	fi
	@echo ""
	@if curl -s http://localhost:3001/api/matrix > /dev/null 2>&1; then \
		echo "✅ Backend API (port 3001): RESPONDING"; \
	else \
		echo "❌ Backend API (port 3001): NOT RESPONDING"; \
	fi
	@if curl -s http://localhost:5173 > /dev/null 2>&1; then \
		echo "✅ Frontend (port 5173): RESPONDING"; \
	else \
		echo "❌ Frontend (port 5173): NOT RESPONDING"; \
	fi

# Install dependencies
install:
	@echo "Installing dependencies..."
	@npm install

# Build application
build:
	@echo "Building application..."
	@npm run build

# Run tests
test:
	@echo "Running tests..."
	@npm test

# Clean up processes and temp files
clean: stop
	@echo "Cleaning up..."
	@rm -f *.log
	@rm -rf node_modules/.vite
	@echo "Cleanup complete."

# Database commands
db-export:
	@echo "Exporting database..."
	@npm run db:export

db-import:
	@echo "Importing database..."
	@npm run db:import

db-wipe:
	@echo "Wiping database..."
	@npm run db:wipe