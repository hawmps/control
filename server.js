import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './src/db/schema.ts';
import { eq, and } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the dist directory (built frontend)
app.use(express.static(path.join(__dirname, 'dist')));

// Database setup
const dbPath = process.env.NODE_ENV === 'production' ? '/app/data/security-tracker.db' : './security-tracker.db';
const sqlite = new Database(dbPath);
const db = drizzle(sqlite, { schema });

// Database setup function
const setupDatabase = async () => {
  try {
    migrate(db, { migrationsFolder: './drizzle' });
    console.log('Database migrations completed');
    console.log('Skipping seeding to avoid foreign key issues - use npm run db:seed if needed');
  } catch (error) {
    console.log('Database setup warning:', error.message);
  }
};

// Initialize database
setupDatabase();

// API Routes

// Items
app.get('/api/items', async (req, res) => {
  try {
    const items = await db.select().from(schema.items);
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/items', async (req, res) => {
  try {
    const [newItem] = await db.insert(schema.items).values({
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).returning();
    res.json(newItem);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/items/:id', async (req, res) => {
  try {
    await db.update(schema.items)
      .set({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .where(eq(schema.items.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/items/:id', async (req, res) => {
  try {
    await db.delete(schema.controlImplementations).where(eq(schema.controlImplementations.item_id, parseInt(req.params.id)));
    await db.delete(schema.items).where(eq(schema.items.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Security Controls
app.get('/api/controls', async (req, res) => {
  try {
    const controls = await db.select().from(schema.securityControls);
    res.json(controls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/controls', async (req, res) => {
  try {
    const [newControl] = await db.insert(schema.securityControls).values({
      ...req.body,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }).returning();
    res.json(newControl);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/controls/:id', async (req, res) => {
  try {
    await db.update(schema.securityControls)
      .set({
        ...req.body,
        updated_at: new Date().toISOString()
      })
      .where(eq(schema.securityControls.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/controls/:id', async (req, res) => {
  try {
    await db.delete(schema.controlImplementations).where(eq(schema.controlImplementations.control_id, parseInt(req.params.id)));
    await db.delete(schema.securityControls).where(eq(schema.securityControls.id, parseInt(req.params.id)));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Control Implementations
app.get('/api/implementations', async (req, res) => {
  try {
    const implementations = await db.select().from(schema.controlImplementations);
    res.json(implementations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/implementations/:itemId/:controlId', async (req, res) => {
  try {
    const { status, notes } = req.body;
    await db.update(schema.controlImplementations)
      .set({ 
        status, 
        notes, 
        updated_at: new Date().toISOString() 
      })
      .where(and(
        eq(schema.controlImplementations.item_id, parseInt(req.params.itemId)),
        eq(schema.controlImplementations.control_id, parseInt(req.params.controlId))
      ));
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Matrix data (combined endpoint)
app.get('/api/matrix', async (req, res) => {
  try {
    const controls = await db.select().from(schema.securityControls);
    const items = await db.select().from(schema.items);
    const implementations = await db.select().from(schema.controlImplementations);

    const result = {
      controls,
      environments: items.map(item => {
        const itemImplementations = implementations.filter(impl => impl.item_id === item.id);
        const controlStatuses = controls.reduce((acc, control) => {
          const impl = itemImplementations.find(impl => impl.control_id === control.id);
          acc[control.id] = {
            status: impl?.status || 'red',
            notes: impl?.notes || 'Not implemented'
          };
          return acc;
        }, {});

        return {
          ...item,
          controlStatuses
        };
      })
    };

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Serve React app for all non-API routes (SPA fallback)
app.use((req, res, next) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
  } else {
    next();
  }
});

app.listen(port, () => {
  console.log(`Security Tracker API server running at http://localhost:${port}`);
});