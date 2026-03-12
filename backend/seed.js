import bcrypt from 'bcrypt';
import { query, initDatabase } from './db.js';

const seedDatabase = async () => {
  try {
    console.log('Initializing database...');
    await initDatabase();
    console.log('✓ Database initialized\n');

    console.log('Seeding database with sample data...\n');

    // Define 10 users with varied demographics
    const users = [
      { username: 'demo_user', password: 'demo123', age: 28, gender: 'Male' },
      { username: 'alice_smith', password: 'password123', age: 32, gender: 'Female' },
      { username: 'bob_jones', password: 'password123', age: 25, gender: 'Male' },
      { username: 'carol_white', password: 'password123', age: 45, gender: 'Female' },
      { username: 'david_brown', password: 'password123', age: 38, gender: 'Male' },
      { username: 'emma_davis', password: 'password123', age: 29, gender: 'Female' },
      { username: 'frank_wilson', password: 'password123', age: 52, gender: 'Male' },
      { username: 'grace_taylor', password: 'password123', age: 23, gender: 'Other' },
      { username: 'henry_moore', password: 'password123', age: 41, gender: 'Male' },
      { username: 'iris_clark', password: 'password123', age: 35, gender: 'Female' }
    ];

    // Insert users and collect their IDs
    const userIds = [];
    console.log('Creating users...');
    
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      
      const result = await query(
        `INSERT INTO users (username, password_hash, age, gender) 
         VALUES ($1, $2, $3, $4) 
         ON CONFLICT (username) DO UPDATE 
         SET password_hash = $2, age = $3, gender = $4
         RETURNING id`,
        [user.username, hashedPassword, user.age, user.gender]
      );
      
      userIds.push(result.rows[0].id);
      console.log(`  ✓ Created user: ${user.username} (age: ${user.age}, gender: ${user.gender})`);
    }

    console.log(`\n✓ Created ${userIds.length} users\n`);

    // Define feature names
    const featureNames = [
      'date_filter',
      'gender_filter',
      'age_filter',
      'bar_chart_click'
    ];

    // Insert 100 feature_click records spread across multiple days
    console.log('Creating feature click records...');
    const clickCounts = {};
    
    for (let i = 0; i < 100; i++) {
      // Randomly select a user
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      
      // Randomly select a feature
      const randomFeature = featureNames[Math.floor(Math.random() * featureNames.length)];
      
      // Spread timestamps across last 30 days
      const daysAgo = Math.floor(Math.random() * 30);
      
      await query(
        `INSERT INTO feature_clicks (user_id, feature_name, timestamp) 
         VALUES ($1, $2, NOW() - INTERVAL '${daysAgo} days' - INTERVAL '${Math.floor(Math.random() * 24)} hours')`,
        [randomUserId, randomFeature]
      );
      
      // Track counts for summary
      clickCounts[randomFeature] = (clickCounts[randomFeature] || 0) + 1;
    }

    console.log('✓ Created 100 feature click records\n');
    
    // Display summary
    console.log('Feature click distribution:');
    Object.keys(clickCounts).sort().forEach(feature => {
      console.log(`  ${feature}: ${clickCounts[feature]} clicks`);
    });

    console.log('\n✓ Database seeded successfully!\n');
    console.log('Demo credentials:');
    console.log('  Username: demo_user');
    console.log('  Password: demo123\n');
    console.log('All other users have password: password123\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
