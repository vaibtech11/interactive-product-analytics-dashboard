import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;

// Create connection pool with Neon-compatible SSL configuration
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

// Test connection
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected database error:', err);
});

// Helper function for queries
export const query = (text, params) => pool.query(text, params);

// Initialize database tables
export const initDatabase = async () => {
  try {
    // Test connection
    await pool.query('SELECT 1');
    console.log('Database connection verified');

    // Create users table with new schema
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT UNIQUE,
        email VARCHAR(255) UNIQUE,
        password VARCHAR(255) NOT NULL,
        password_hash TEXT,
        age INTEGER,
        gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create feature_clicks table
    await query(`
      CREATE TABLE IF NOT EXISTS feature_clicks (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        feature_name TEXT NOT NULL,
        timestamp TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create events table (for backward compatibility)
    await query(`
      CREATE TABLE IF NOT EXISTS events (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        event_name VARCHAR(255) NOT NULL,
        event_type VARCHAR(100) NOT NULL,
        metadata JSONB,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `);

    // Create indexes for feature_clicks
    await query(`
      CREATE INDEX IF NOT EXISTS idx_feature_name ON feature_clicks(feature_name)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_timestamp ON feature_clicks(timestamp)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_user_id ON feature_clicks(user_id)
    `);

    // Create indexes for events table
    await query(`
      CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at)
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type)
    `);

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

// Export pool as default for direct usage
export default pool;
