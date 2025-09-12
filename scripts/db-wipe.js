#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createInterface } from 'readline';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

function askForConfirmation(question) {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

async function wipeDatabase() {
  try {
    const skipConfirm = process.argv.includes('--force') || process.argv.includes('-f');

    console.log('🧹 Security Control Tracker - Database Wipe\n');
    console.log('⚠️  WARNING: This will permanently delete ALL data in your database!');
    console.log('   - All items will be removed');
    console.log('   - All security controls will be removed');  
    console.log('   - All control implementations will be removed\n');

    if (!skipConfirm) {
      console.log('💡 Tip: Create a backup first with: npm run db:export\n');
      
      const confirmed = await askForConfirmation('Are you sure you want to continue? Type "yes" to confirm: ');
      
      if (!confirmed) {
        console.log('❌ Database wipe cancelled');
        process.exit(0);
      }
    }

    console.log('\n🔄 Wiping database...');

    // Import database connection
    const dbPath = path.join(projectRoot, 'src', 'db', 'index.ts');
    const { db, items, securityControls, controlImplementations } = await import(path.join('file://', dbPath));

    // Get counts before deletion
    const itemCount = (await db.select().from(items)).length;
    const controlCount = (await db.select().from(securityControls)).length;
    const implementationCount = (await db.select().from(controlImplementations)).length;

    console.log(`📊 Found ${itemCount} items, ${controlCount} controls, ${implementationCount} implementations`);

    // Delete all data in correct order (foreign key constraints)
    await db.delete(controlImplementations);
    console.log('   ✅ Cleared control implementations');
    
    await db.delete(items);
    console.log('   ✅ Cleared items');
    
    await db.delete(securityControls);
    console.log('   ✅ Cleared security controls');

    console.log('\n✅ Database wiped successfully!');
    console.log('🔄 The database is now completely empty');
    console.log('\n💡 Next steps:');
    console.log('   - Add fresh data: npm run db:seed');
    console.log('   - Import backup: npm run db:import <filename>');
    console.log('   - Restart your application to see changes');

  } catch (error) {
    console.error('❌ Database wipe failed:', error.message);
    process.exit(1);
  }
}

// Alternative method: Delete the entire database file
async function wipeComplete() {
  try {
    const dbFile = path.join(projectRoot, 'security-tracker.db');
    
    if (fs.existsSync(dbFile)) {
      console.log('🗑️  Deleting database file completely...');
      fs.unlinkSync(dbFile);
      console.log('✅ Database file deleted!');
      console.log('💡 Run migrations to recreate: npm run db:migrate');
    } else {
      console.log('ℹ️  No database file found');
    }
  } catch (error) {
    console.error('❌ Failed to delete database file:', error.message);
    process.exit(1);
  }
}

// Check command line arguments
const args = process.argv.slice(2);

if (args.includes('--complete')) {
  // Wipe by deleting the entire database file
  wipeComplete();
} else {
  // Wipe by clearing all table data
  if (import.meta.url === `file://${process.argv[1]}`) {
    wipeDatabase();
  }
}

export default wipeDatabase;