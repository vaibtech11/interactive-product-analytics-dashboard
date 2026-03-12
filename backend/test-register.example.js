// Example test for POST /register endpoint
// Run with: node test-register.example.js (after starting the server)

const API_URL = 'http://localhost:5000';

async function testRegister() {
  console.log('Testing POST /register endpoint...\n');

  // Test 1: Valid registration
  console.log('Test 1: Valid registration');
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'password123',
        age: 25,
        gender: 'Male'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log('✓ Test passed\n');
  } catch (error) {
    console.error('✗ Test failed:', error.message, '\n');
  }

  // Test 2: Duplicate username
  console.log('Test 2: Duplicate username');
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'testuser123',
        password: 'password456',
        age: 30,
        gender: 'Female'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log(data.error === 'Username already exists' ? '✓ Test passed\n' : '✗ Test failed\n');
  } catch (error) {
    console.error('✗ Test failed:', error.message, '\n');
  }


  // Test 3: Invalid username (too short)
  console.log('Test 3: Invalid username (too short)');
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'ab',
        password: 'password123',
        age: 25,
        gender: 'Male'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log(response.status === 400 ? '✓ Test passed\n' : '✗ Test failed\n');
  } catch (error) {
    console.error('✗ Test failed:', error.message, '\n');
  }

  // Test 4: Invalid password (too short)
  console.log('Test 4: Invalid password (too short)');
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'validuser',
        password: '12345',
        age: 25,
        gender: 'Male'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log(response.status === 400 ? '✓ Test passed\n' : '✗ Test failed\n');
  } catch (error) {
    console.error('✗ Test failed:', error.message, '\n');
  }

  // Test 5: Invalid gender
  console.log('Test 5: Invalid gender');
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: 'anotheruser',
        password: 'password123',
        age: 25,
        gender: 'Unknown'
      })
    });
    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Response:', data);
    console.log(response.status === 400 ? '✓ Test passed\n' : '✗ Test failed\n');
  } catch (error) {
    console.error('✗ Test failed:', error.message, '\n');
  }
}

testRegister();
