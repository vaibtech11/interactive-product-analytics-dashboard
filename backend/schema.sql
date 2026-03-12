-- PostgreSQL Schema for Interactive Product Analytics Dashboard
-- Compatible with Neon PostgreSQL

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS feature_clicks CASCADE;
DROP TABLE IF EXISTS events CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    age INTEGER,
    gender TEXT CHECK (gender IN ('Male', 'Female', 'Other')),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create feature_clicks table
CREATE TABLE feature_clicks (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    feature_name TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT NOW()
);

-- Create events table (for backward compatibility with existing code)
CREATE TABLE events (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    event_name VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for analytics performance on feature_clicks
CREATE INDEX idx_feature_name ON feature_clicks(feature_name);
CREATE INDEX idx_timestamp ON feature_clicks(timestamp);
CREATE INDEX idx_user_id ON feature_clicks(user_id);

-- Create indexes for events table
CREATE INDEX idx_events_user_id ON events(user_id);
CREATE INDEX idx_events_created_at ON events(created_at);
CREATE INDEX idx_events_event_type ON events(event_type);

-- Add comments for documentation
COMMENT ON TABLE users IS 'Stores user account information';
COMMENT ON TABLE feature_clicks IS 'Tracks user interactions with product features';
COMMENT ON TABLE events IS 'General event tracking table';

COMMENT ON COLUMN users.username IS 'Unique username for login';
COMMENT ON COLUMN users.password_hash IS 'Bcrypt hashed password';
COMMENT ON COLUMN users.age IS 'User age (optional)';
COMMENT ON COLUMN users.gender IS 'User gender: Male, Female, or Other';

COMMENT ON COLUMN feature_clicks.user_id IS 'Reference to users table';
COMMENT ON COLUMN feature_clicks.feature_name IS 'Name of the feature clicked';
COMMENT ON COLUMN feature_clicks.timestamp IS 'When the click occurred';
