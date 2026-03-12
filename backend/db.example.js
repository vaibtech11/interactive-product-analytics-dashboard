// Example usage of the database connection pool

import pool from './db.js';
// OR: import { query } from './db.js';

// Example 1: Direct pool usage
async function exampleDirectPoolUsage() {
  try {
    const result = await pool.query('SELECT 1');
    console.log('Direct pool query result:', result.rows);
  } catch (error) {
    console.error('Query error:', error);
  }
}

// Example 2: Using the query helper function
import { query } from './db.js';

async function exampleQueryHelper() {
  try {
    // Simple query
    const result = await query('SELECT NOW()');
    console.log('Current time:', result.rows[0]);

    // Parameterized query
    const users = await query(
      'SELECT * FROM users WHERE email = $1',
      ['demo@example.com']
    );
    console.log('User:', users.rows[0]);
  } catch (error) {
    console.error('Query error:', error);
  }
}

// Example 3: Transaction
async function exampleTransaction() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const insertUser = await client.query(
      'INSERT INTO users (email, password) VALUES ($1, $2) RETURNING id',
      ['test@example.com', 'hashedpassword']
    );
    
    const userId = insertUser.rows[0].id;
    
    await client.query(
      'INSERT INTO events (user_id, event_name, event_type) VALUES ($1, $2, $3)',
      [userId, 'signup', 'user_action']
    );
    
    await client.query('COMMIT');
    console.log('Transaction completed successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Transaction error:', error);
  } finally {
    client.release();
  }
}

// Run examples
// exampleDirectPoolUsage();
// exampleQueryHelper();
// exampleTransaction();
