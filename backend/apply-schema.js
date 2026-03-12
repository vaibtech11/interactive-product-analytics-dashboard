import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from './db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function applySchema() {
  try {
    console.log('Reading schema.sql file...');
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('Applying schema to database...');
    await pool.query(schema);

    console.log('✓ Schema applied successfully!');
    console.log('Tables created:');
    console.log('  - users');
    console.log('  - feature_clicks');
    console.log('  - events');
    console.log('Indexes created for optimal analytics performance');

    process.exit(0);
  } catch (error) {
    console.error('Error applying schema:', error);
    process.exit(1);
  }
}

applySchema();
