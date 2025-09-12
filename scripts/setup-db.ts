import runMigrations from '../src/db/migrate';
import seedData from '../src/db/seed';

const setupDatabase = async () => {
  try {
    await runMigrations();
    await seedData();
    console.log('🎉 Database setup complete!');
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
};

setupDatabase();