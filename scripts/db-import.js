#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

async function importDatabase() {
  try {
    // Get filename from command line arguments
    const filename = process.argv[2];
    
    if (!filename) {
      console.log('❌ Please provide an export file to import');
      console.log('Usage: npm run db:import <filename>');
      console.log('Example: npm run db:import security-tracker-export-2024-01-15.json');
      console.log('\nAvailable export files:');
      
      const exportsDir = path.join(projectRoot, 'exports');
      if (fs.existsSync(exportsDir)) {
        const files = fs.readdirSync(exportsDir).filter(f => f.endsWith('.json'));
        files.forEach(file => console.log(`  - ${file}`));
      } else {
        console.log('  (No export files found)');
      }
      process.exit(1);
    }

    console.log(`📥 Importing Security Control Tracker database from ${filename}...\n`);

    // Determine file path
    let filepath;
    if (path.isAbsolute(filename)) {
      filepath = filename;
    } else if (filename.includes('/') || filename.includes('\\')) {
      filepath = path.resolve(projectRoot, filename);
    } else {
      filepath = path.join(projectRoot, 'exports', filename);
    }

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.error(`❌ Import file not found: ${filepath}`);
      process.exit(1);
    }

    // Read and parse export file
    const exportData = JSON.parse(fs.readFileSync(filepath, 'utf8'));

    // Validate export data structure
    if (!exportData.data || !exportData.metadata) {
      throw new Error('Invalid export file format');
    }

    const { items: itemsData, securityControls: controlsData, controlImplementations: implementationsData } = exportData.data;

    console.log(`📋 Import file details:`);
    console.log(`   - Exported: ${new Date(exportData.metadata.exportedAt).toLocaleString()}`);
    console.log(`   - Version: ${exportData.metadata.version}`);
    console.log(`   - Items: ${itemsData?.length || 0}`);
    console.log(`   - Controls: ${controlsData?.length || 0}`);
    console.log(`   - Implementations: ${implementationsData?.length || 0}\n`);

    // Import database connection
    const dbPath = path.join(projectRoot, 'src', 'db', 'index.ts');
    const { db, items, securityControls, controlImplementations } = await import(path.join('file://', dbPath));

    console.log('🔄 Clearing existing data...');
    
    // Clear existing data in correct order (foreign key constraints)
    await db.delete(controlImplementations);
    await db.delete(items);
    await db.delete(securityControls);

    console.log('📦 Importing new data...');

    // Insert data in correct order
    if (itemsData && itemsData.length > 0) {
      await db.insert(items).values(itemsData);
      console.log(`   ✅ Imported ${itemsData.length} items`);
    }

    if (controlsData && controlsData.length > 0) {
      await db.insert(securityControls).values(controlsData);
      console.log(`   ✅ Imported ${controlsData.length} security controls`);
    }

    if (implementationsData && implementationsData.length > 0) {
      await db.insert(controlImplementations).values(implementationsData);
      console.log(`   ✅ Imported ${implementationsData.length} control implementations`);
    }

    console.log('\n✅ Database import completed successfully!');
    console.log('🚀 Restart your application to see the imported data');

  } catch (error) {
    console.error('❌ Import failed:', error.message);
    if (error.code === 'SQLITE_CONSTRAINT') {
      console.error('💡 This might be due to data conflicts. Try wiping the database first with: npm run db:wipe');
    }
    process.exit(1);
  }
}

// Run import if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  importDatabase();
}

export default importDatabase;