import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';

const runMigrations = async () => {
  console.log('🔄 Running database migrations...');
  
  const sqlite = new Database('./security-tracker.db');
  const db = drizzle(sqlite);
  
  await migrate(db, { migrationsFolder: 'drizzle' });
  
  console.log('✅ Migrations completed!');
  sqlite.close();
};

// Run migrations if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations().then(() => process.exit(0)).catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  });
}

export default runMigrations;