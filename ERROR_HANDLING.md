# Error Handling Documentation

## Backend Error Responses

All backend errors return clear JSON responses with appropriate HTTP status codes.

### Authentication Errors

#### Duplicate Username (400)
```json
{
  "error": "Username already exists"
}
```

#### Invalid JWT (401)
```json
{
  "error": "Unauthorized",
  "message": "Invalid token"
}
```

#### Expired JWT (401)
```json
{
  "error": "Unauthorized",
  "message": "Token expired"
}
```

#### Missing Token (401)
```json
{
  "error": "Unauthorized",
  "message": "No authorization header provided"
}
```

### Validation Errors

#### Invalid Date Range (400)
```json
{
  "error": "start_date must be less than or equal to end_date"
}
```

#### Invalid Date Format (400)
```json
{
  "error": "Invalid start_date format. Use YYYY-MM-DD"
}
```

#### Invalid Age (400)
```json
{
  "error": "Invalid age. Must be between 13 and 120"
}
```

#### Invalid Gender (400)
```json
{
  "error": "Invalid gender. Must be Male, Female, or Other"
}
```

#### Invalid Feature Name (400)
```json
{
  "error": "Invalid feature_name. Only alphanumeric characters, underscores, and hyphens are allowed"
}
```

#### Missing Required Field (400)
```json
{
  "error": "feature_name is required"
}
```

### Empty Results

#### No Data Found (200)
```json
{
  "barChart": [],
  "lineChart": [],
  "message": "No data found for the specified filters"
}
```

#### No Feature Clicks (200)
```json
{
  "data": [],
  "message": "No feature clicks found for the specified period"
}
```

### Server Errors (500)
```json
{
  "error": "Failed to fetch analytics",
  "message": "Database connection error"
}
```

## Frontend Error Handling

### Components

#### ErrorMessage Component
- Displays error messages with icon
- Provides "Try Again" button for retryable errors
- Red color scheme for visibility

#### EmptyState Component
- Shows when no data is available
- Different icons for different contexts (chart, search, database)
- Helpful messages guiding user actions

### Error Cases Handled

1. **Network Errors**
   - Connection timeout
   - Server unavailable
   - Shows: "Failed to load analytics data. Please try again."

2. **Authentication Errors**
   - Invalid/expired token
   - Automatically redirects to login page
   - Clears local storage

3. **Validation Errors**
   - Invalid date range
   - Invalid filter values
   - Shows specific error message from backend

4. **Empty Results**
   - No data for selected filters
   - Shows EmptyState with helpful message
   - Suggests adjusting filters or date range

5. **Loading States**
   - Spinner animation during data fetch
   - "Loading analytics..." message
   - Prevents multiple simultaneous requests

### User Experience

- Clear, actionable error messages
- Visual feedback (icons, colors)
- Retry functionality where appropriate
- Graceful degradation (empty states instead of crashes)
- Automatic recovery (redirect to login on auth errors)

## Testing Error Scenarios

### Test Invalid Date Range
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/analytics?start_date=2026-12-31&end_date=2026-01-01"
```

### Test Invalid Age
```bash
curl -H "Authorization: Bearer TOKEN" \
  "http://localhost:5000/analytics?age=150"
```

### Test Invalid Token
```bash
curl -H "Authorization: Bearer invalid_token" \
  "http://localhost:5000/analytics"
```

### Test Empty Feature Name
```bash
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"feature_name":""}' \
  "http://localhost:5000/track"
```

### Test Duplicate Username
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"username":"demo_user","password":"test123"}' \
  "http://localhost:5000/register"
```
