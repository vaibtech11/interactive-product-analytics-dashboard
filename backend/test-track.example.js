// Example test for POST /track endpoint
// Run with: node test-track.example.js (after starting the server and logging in)

const API_URL = 'http://localhost:5000';

// First, login to get a token
async function login() {
  const response = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: 'demo_user',
      password: 'demo123'
    })
  });
  const data = await response.json();
  return data.token;
}

async function testTrack() {
  console.log('Testing POST /track endpoint...\n');

  try {
    // Get authentication token
    console.log('Logging in...');
    const token = await login();
    console.log('✓ Logged in successfully\n');

    // Test 1: Valid feature click
    console.log('Test 1: Track valid feature click (date_filter)');
    const response1 = await fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        feature_name: 'date_filter'
      })
    });
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Response:', data1);
    console.log(response1.status === 201 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 2: Track gender_filter
    console.log('Test 2: Track gender_filter click');
    const response2 = await fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        feature_name: 'gender_filter'
      })
    });
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Response:', data2);
    console.log(response2.status === 201 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 3: Track age_filter
    console.log('Test 3: Track age_filter click');
    const response3 = await fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        feature_name: 'age_filter'
      })
    });
    const data3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Response:', data3);
    console.log(response3.status === 201 ? '✓ Test passed\n' : '✗ Test failed\n');


    // Test 4: Track bar_chart_click
    console.log('Test 4: Track bar_chart_click');
    const response4 = await fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        feature_name: 'bar_chart_click'
      })
    });
    const data4 = await response4.json();
    console.log('Status:', response4.status);
    console.log('Response:', data4);
    console.log(response4.status === 201 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 5: Empty feature_name (should fail)
    console.log('Test 5: Empty feature_name (should fail)');
    const response5 = await fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        feature_name: ''
      })
    });
    const data5 = await response5.json();
    console.log('Status:', response5.status);
    console.log('Response:', data5);
    console.log(response5.status === 400 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 6: Missing feature_name (should fail)
    console.log('Test 6: Missing feature_name (should fail)');
    const response6 = await fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({})
    });
    const data6 = await response6.json();
    console.log('Status:', response6.status);
    console.log('Response:', data6);
    console.log(response6.status === 400 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 7: Invalid feature_name with special characters (should fail)
    console.log('Test 7: Invalid feature_name with special characters (should fail)');
    const response7 = await fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        feature_name: 'invalid@feature#name'
      })
    });
    const data7 = await response7.json();
    console.log('Status:', response7.status);
    console.log('Response:', data7);
    console.log(response7.status === 400 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 8: No authentication (should fail)
    console.log('Test 8: No authentication (should fail)');
    const response8 = await fetch(`${API_URL}/track`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        feature_name: 'test_feature'
      })
    });
    const data8 = await response8.json();
    console.log('Status:', response8.status);
    console.log('Response:', data8);
    console.log(response8.status === 401 ? '✓ Test passed\n' : '✗ Test failed\n');

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testTrack();
