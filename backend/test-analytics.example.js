// Example test for GET /analytics endpoint
// Run with: node test-analytics.example.js (after starting server and seeding data)

const API_URL = 'http://localhost:5000';

// Login to get token
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

async function testAnalytics() {
  console.log('Testing GET /analytics endpoint...\n');

  try {
    const token = await login();
    console.log('✓ Logged in successfully\n');

    // Test 1: Get all analytics (no filters)
    console.log('Test 1: Get all analytics (no filters)');
    const response1 = await fetch(`${API_URL}/analytics`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data1 = await response1.json();
    console.log('Status:', response1.status);
    console.log('Bar Chart Data:', data1.barChart);
    console.log('Line Chart Data:', data1.lineChart);
    console.log('Filters:', data1.filters);
    console.log(response1.status === 200 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 2: Get analytics with date range
    console.log('Test 2: Get analytics with date range');
    const response2 = await fetch(
      `${API_URL}/analytics?start_date=2026-03-01&end_date=2026-03-31`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data2 = await response2.json();
    console.log('Status:', response2.status);
    console.log('Bar Chart Data:', data2.barChart);
    console.log('Filters:', data2.filters);
    console.log(response2.status === 200 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 3: Get analytics with feature_name (includes line chart)
    console.log('Test 3: Get analytics with feature_name');
    const response3 = await fetch(
      `${API_URL}/analytics?feature_name=dashboard_view`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data3 = await response3.json();
    console.log('Status:', response3.status);
    console.log('Bar Chart Data:', data3.barChart);
    console.log('Line Chart Data:', data3.lineChart);
    console.log(response3.status === 200 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 4: Get analytics with age filter
    console.log('Test 4: Get analytics with age filter');
    const response4 = await fetch(
      `${API_URL}/analytics?age=28`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data4 = await response4.json();
    console.log('Status:', response4.status);
    console.log('Bar Chart Data:', data4.barChart);
    console.log('Filters:', data4.filters);
    console.log(response4.status === 200 ? '✓ Test passed\n' : '✗ Test failed\n');


    // Test 5: Get analytics with gender filter
    console.log('Test 5: Get analytics with gender filter');
    const response5 = await fetch(
      `${API_URL}/analytics?gender=Male`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data5 = await response5.json();
    console.log('Status:', response5.status);
    console.log('Bar Chart Data:', data5.barChart);
    console.log('Filters:', data5.filters);
    console.log(response5.status === 200 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 6: Get analytics with all filters
    console.log('Test 6: Get analytics with all filters');
    const response6 = await fetch(
      `${API_URL}/analytics?start_date=2026-02-01&end_date=2026-03-31&age=28&gender=Male&feature_name=export_data`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data6 = await response6.json();
    console.log('Status:', response6.status);
    console.log('Bar Chart Data:', data6.barChart);
    console.log('Line Chart Data:', data6.lineChart);
    console.log('Filters:', data6.filters);
    console.log(response6.status === 200 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 7: Invalid date range (start_date > end_date)
    console.log('Test 7: Invalid date range (should fail)');
    const response7 = await fetch(
      `${API_URL}/analytics?start_date=2026-03-31&end_date=2026-03-01`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data7 = await response7.json();
    console.log('Status:', response7.status);
    console.log('Response:', data7);
    console.log(response7.status === 400 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 8: Invalid age
    console.log('Test 8: Invalid age (should fail)');
    const response8 = await fetch(
      `${API_URL}/analytics?age=150`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data8 = await response8.json();
    console.log('Status:', response8.status);
    console.log('Response:', data8);
    console.log(response8.status === 400 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 9: Invalid gender
    console.log('Test 9: Invalid gender (should fail)');
    const response9 = await fetch(
      `${API_URL}/analytics?gender=Unknown`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data9 = await response9.json();
    console.log('Status:', response9.status);
    console.log('Response:', data9);
    console.log(response9.status === 400 ? '✓ Test passed\n' : '✗ Test failed\n');

    // Test 10: Invalid date format
    console.log('Test 10: Invalid date format (should fail)');
    const response10 = await fetch(
      `${API_URL}/analytics?start_date=03-12-2026`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );
    const data10 = await response10.json();
    console.log('Status:', response10.status);
    console.log('Response:', data10);
    console.log(response10.status === 400 ? '✓ Test passed\n' : '✗ Test failed\n');

  } catch (error) {
    console.error('Test error:', error.message);
  }
}

testAnalytics();
