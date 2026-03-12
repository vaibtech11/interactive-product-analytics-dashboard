import bcrypt from 'bcrypt';
import { query, initDatabase } from './db.js';

const seedDatabase = async () => {
  try {
    await initDatabase();

    console.log('Seeding database with sample data...');

    // Create demo users with new schema
    const hashedPassword = await bcrypt.hash('demo123', 10);
    
    const users = [
      { username: 'demo_user', email: 'demo@example.com', age: 28, gender: 'Male' },
      { username: 'jane_doe', email: 'jane@example.com', age: 32, gender: 'Female' },
      { username: 'alex_smith', email: 'alex@example.com', age: 25, gender: 'Other' }
    ];

    const userIds = [];
    
    for (const user of users) {
      const result = await query(
        `INSERT INTO users (username, email, password, password_hash, age, gender) 
         VALUES ($1, $2, $3, $4, $5, $6) 
         ON CONFLICT (email) DO UPDATE 
         SET username = $1, password = $3, password_hash = $4, age = $5, gender = $6
         RETURNING id`,
        [user.username, user.email, hashedPassword, hashedPassword, user.age, user.gender]
      );
      userIds.push(result.rows[0].id);
      console.log(`✓ Created user: ${user.username}`);
    }

    // Seed feature_clicks
    const features = [
      'dashboard_view',
      'export_data',
      'filter_apply',
      'chart_interaction',
      'settings_open',
      'profile_edit',
      'report_generate'
    ];

    let clickCount = 0;
    for (let i = 0; i < 100; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const randomFeature = features[Math.floor(Math.random() * features.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      
      await query(
        `INSERT INTO feature_clicks (user_id, feature_name, timestamp) 
         VALUES ($1, $2, NOW() - INTERVAL '${daysAgo} days')`,
        [randomUserId, randomFeature]
      );
      clickCount++;
    }
    console.log(`✓ Created ${clickCount} feature clicks`);

    // Seed events table (for backward compatibility)
    const eventTypes = ['click', 'view', 'purchase', 'signup'];
    const eventNames = ['button_click', 'page_view', 'product_purchase', 'user_signup'];

    let eventCount = 0;
    for (let i = 0; i < 50; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const randomType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
      const randomName = eventNames[Math.floor(Math.random() * eventNames.length)];
      const daysAgo = Math.floor(Math.random() * 30);
      
      await query(
        `INSERT INTO events (user_id, event_name, event_type, metadata, created_at) 
         VALUES ($1, $2, $3, $4, NOW() - INTERVAL '${daysAgo} days')`,
        [randomUserId, randomName, randomType, JSON.stringify({ value: Math.floor(Math.random() * 100) })]
      );
      eventCount++;
    }
    console.log(`✓ Created ${eventCount} events`);

    console.log('\n✓ Database seeded successfully!');
    console.log('\nDemo credentials:');
    console.log('  Email: demo@example.com');
    console.log('  Password: demo123');
    
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
