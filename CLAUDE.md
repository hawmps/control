# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Cross-Platform Commands (Windows/Mac/Linux)
- **Start servers**: `npm run start` - Start both frontend and backend servers
- **Stop servers**: `npm run stop` - Stop all running servers
- **Restart servers**: `npm run restart` - Stop and restart all servers  
- **Check status**: `npm run status` - Check if servers are running and responding
- **Clean**: `npm run clean` - Clean temporary files

### Individual Server Commands
- **Frontend only**: `npm run dev` - Start Vite development server at http://localhost:5173/
- **Backend only**: `npm run dev:server` - Start Express API server at http://localhost:3001/
- **Both servers**: `npm run dev:full` - Start both servers with concurrently
- **Build**: `npm run build` - TypeScript compilation followed by Vite build
- **Lint**: `npm run lint` - Run ESLint
- **Preview**: `npm run preview` - Preview production build locally

### Windows Users
Alternative batch file commands:
- `dev start` - Start servers
- `dev stop` - Stop servers  
- `dev status` - Check status
- `dev help` - Show help

## Database Commands

### Setup & Development
- **Setup database**: `npm run db:setup` - Run migrations and seed data (first-time setup)
- **Generate migrations**: `npm run db:generate` - Generate new migration files after schema changes
- **Run migrations**: `npm run db:migrate` - Apply database migrations
- **Seed database**: `npm run db:seed` - Populate database with sample data

### Data Management
- **Export database**: `npm run db:export` - Export all data to timestamped JSON file in exports/
- **Import database**: `npm run db:import <filename>` - Import data from JSON export file
- **Wipe database**: `npm run db:wipe` - Clear all data (with confirmation prompt)
- **Force wipe**: `npm run db:wipe:force` - Clear all data without confirmation
- **Complete wipe**: `npm run db:wipe:complete` - Delete entire database file

## Testing Commands

- **Unit tests**: `npm test` - Run Jest tests
- **Watch mode**: `npm run test:watch` - Run tests in watch mode
- **Coverage**: `npm run test:coverage` - Generate test coverage report
- **Test UI**: `npm run test:ui` - Run tests with verbose output
- **E2E tests**: `npm run e2e` - Run Playwright end-to-end tests
- **E2E UI**: `npm run e2e:ui` - Run Playwright tests with UI mode
- **E2E report**: `npm run e2e:report` - Show Playwright test report

## Application Overview

This is a **Security Control Tracking Application** built with React TypeScript that helps organizations monitor and manage security control implementation across their items (applications, systems, databases, etc.).

- **Frontend**: React 19.1.1 + TypeScript + Vite
- **Styling**: Tailwind CSS with forms and typography plugins
- **Routing**: React Router DOM with nested routes
- **Database**: SQLite with Drizzle ORM (type-safe database access)
- **Testing**: Jest + Testing Library + Playwright for E2E
- **Accessibility**: Axe-core integration for accessibility testing

### Core Concepts

- **Items**: Systems, applications, databases, or any asset requiring security controls
- **Security Controls**: Preventive, detective, corrective, or compensating controls from frameworks like NIST, ISO 27001
- **Control Implementation**: The status and details of how controls are applied to specific items
- **Implementation Statuses**: not_started, in_progress, implemented, tested, not_applicable, exception_approved

### Project Structure

```
src/
├── components/
│   ├── ui/           # Reusable UI components (Form, Modal, DataTable, etc.)
│   ├── layout/       # Layout components (Layout, Navbar)
│   └── common/       # Common components (LoadingSpinner)
├── pages/            # Main application pages
│   ├── Items.tsx              # Control status dashboard (main view)
│   ├── ItemsManagement.tsx    # CRUD operations for items
│   ├── Controls.tsx           # Security controls management
│   ├── Dashboard.tsx          # Overview dashboard
│   └── ...                    # Other pages
├── services/
│   └── securityData.ts        # Database service functions (async)
├── db/
│   ├── schema.ts              # Drizzle database schema definitions
│   ├── index.ts               # Database connection and exports
│   ├── migrate.ts             # Migration runner
│   └── seed.ts                # Database seeding script
├── types/            # TypeScript definitions for security domain
└── ...
```

### Key Features

1. **Security Control Status Matrix** (`/` - Landing Page): Main view showing all items with control implementation status in a matrix format (Items vs Controls with Red/Yellow/Green status indicators)
2. **Items Management** (`/items-management`): Full CRUD interface for managing security items with criticality levels
3. **Controls Management** (`/controls`): Manage simple security control definitions (name and description only)
4. **Comprehensive Data Model**: Items, SecurityControl, ControlImplementation entities with proper relationships

### Route Structure

- `/` - **Control Status** - Main landing page showing items and their security control implementation status (matrix view)
- `/items-management` - **Manage Items** - CRUD operations for security items
- `/controls` - **Security Controls** - Manage security control definitions
- `/documents` - **Documents** - Document management (placeholder)

### Data Model

#### Core Entities
- **Item**: Represents assets requiring security controls (applications, systems, etc.)
  - Properties: name, description, category, item_type, owner, criticality (low/medium/high/critical)
- **SecurityControl**: Defines security controls from frameworks
  - Properties: name, description (simplified design)
- **ControlImplementation**: Maps controls to items with implementation status
  - Properties: item_id, control_id, status (red/yellow/green), notes, dates

#### Database Architecture

The application uses SQLite with Drizzle ORM for type-safe database access. The database file is stored as `security-tracker.db` in the root directory.

**Schema Tables:**
- `items` - Security items/assets
- `security_controls` - Security control definitions  
- `control_implementations` - Junction table mapping items to controls with status

**Database Files:**
- `src/db/schema.ts` - Drizzle schema definitions
- `drizzle/` - Generated migration files
- `security-tracker.db` - SQLite database file

#### Service Layer
`src/services/securityData.ts` provides async database functions:
- `getItems()` - Returns all security items from database
- `getSecurityControls()` - Returns all security controls from database
- `getControlImplementations()` - Returns control-to-item mappings from database
- `getControlMatrixData()` - Returns combined data for matrix view
- `updateControlImplementation()` - Updates status and notes for item-control pairs
- CRUD functions: `createItem()`, `updateItem()`, `deleteItem()`, etc.
- `getItemsWithControlStatus()` - Returns items with aggregated control statistics

### UI Components

The application leverages a comprehensive UI component system:
- **DataTable**: Advanced table with sorting, search, and custom rendering
- **Modal**: For forms and detail views
- **SearchBar**: Filtering and search functionality
- **Toast/Notification**: User feedback system
- Form components (Input, Select, FormField)

### Type System

Comprehensive TypeScript definitions in `src/types/index.ts`:
- Security domain types (Item, SecurityControl, ControlImplementation)
- Enums for criticality levels and implementation statuses
- UI component props and column definitions
- API response patterns

### Development Notes

- **Mock Data**: Replace `src/services/securityData.ts` with real API calls when ready
- **Database Migration**: Current hardcoded CSV-style data can be easily migrated to a database
- **Linting**: Currently has warnings for unused imports and any types - safe to ignore during development
- **Build**: TypeScript compilation works but has strict null check warnings