#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

// Import database connection
const dbPath = path.join(projectRoot, 'src', 'db', 'index.ts');

async function exportDatabase() {
  try {
    console.log('📦 Exporting Security Control Tracker database...\n');

    // Dynamic import of the database
    const { db, items, securityControls, controlImplementations } = await import(path.join('file://', dbPath));

    // Fetch all data
    const itemsData = await db.select().from(items);
    const controlsData = await db.select().from(securityControls);
    const implementationsData = await db.select().from(controlImplementations);

    // Create export data structure
    const exportData = {
      metadata: {
        exportedAt: new Date().toISOString(),
        version: '1.0.0',
        application: 'Security Control Tracker',
        totalItems: itemsData.length,
        totalControls: controlsData.length,
        totalImplementations: implementationsData.length
      },
      data: {
        items: itemsData,
        securityControls: controlsData,
        controlImplementations: implementationsData
      }
    };

    // Create exports directory if it doesn't exist
    const exportsDir = path.join(projectRoot, 'exports');
    if (!fs.existsSync(exportsDir)) {
      fs.mkdirSync(exportsDir, { recursive: true });
    }

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    const filename = `security-tracker-export-${timestamp}.json`;
    const filepath = path.join(exportsDir, filename);

    // Write export file
    fs.writeFileSync(filepath, JSON.stringify(exportData, null, 2));

    console.log('✅ Database exported successfully!');
    console.log(`📁 Export file: ${filepath}`);
    console.log(`📊 Exported data:`);
    console.log(`   - ${exportData.metadata.totalItems} items`);
    console.log(`   - ${exportData.metadata.totalControls} security controls`);
    console.log(`   - ${exportData.metadata.totalImplementations} control implementations`);
    console.log(`\n💡 To import this data later, use: npm run db:import ${filename}`);

  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

// Run export if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  exportDatabase();
}

export default exportDatabase;