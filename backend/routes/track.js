import express from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';
import { trackRateLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

/**
 * Validate feature_name (alphanumeric, underscore, hyphen only)
 */
const isValidFeatureName = (featureName) => {
  if (!featureName) return false;
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(featureName) && featureName.length <= 255;
};

/**
 * POST /track
 * Log user interaction with a feature
 * Required: feature_name
 * Rate limited: 100 requests per 15 minutes
 */
router.post('/', trackRateLimiter, authMiddleware, async (req, res) => {
  try {
    const { feature_name } = req.body;

    // Reject empty feature_name values
    if (!feature_name || feature_name.trim() === '') {
      return res.status(400).json({ 
        error: 'feature_name is required' 
      });
    }

    // Validate feature_name format
    if (!isValidFeatureName(feature_name)) {
      return res.status(400).json({ 
        error: 'Invalid feature_name. Only alphanumeric characters, underscores, and hyphens are allowed' 
      });
    }

    // Insert record into feature_clicks table with current timestamp
    const result = await query(
      `INSERT INTO feature_clicks (user_id, feature_name, timestamp) 
       VALUES ($1, $2, NOW()) 
       RETURNING id, user_id, feature_name, timestamp`,
      [req.userId, feature_name]
    );

    const clickRecord = result.rows[0];

    res.status(201).json({
      success: true,
      message: 'Feature click tracked successfully',
      data: {
        id: clickRecord.id,
        user_id: clickRecord.user_id,
        feature_name: clickRecord.feature_name,
        timestamp: clickRecord.timestamp
      }
    });
  } catch (error) {
    console.error('Track feature click error:', error);
    res.status(500).json({ 
      error: 'Failed to track feature click',
      message: error.message 
    });
  }
});

/**
 * POST /track/event (legacy endpoint for backward compatibility)
 * Logs to events table if it exists
 */
router.post('/event', authMiddleware, async (req, res) => {
  try {
    const { event_name, event_type, metadata } = req.body;

    if (!event_name || !event_type) {
      return res.status(400).json({ 
        error: 'event_name and event_type are required' 
      });
    }

    const result = await query(
      `INSERT INTO events (user_id, event_name, event_type, metadata, created_at) 
       VALUES ($1, $2, $3, $4, NOW()) 
       RETURNING id, user_id, event_name, event_type, created_at`,
      [req.userId, event_name, event_type, JSON.stringify(metadata || {})]
    );

    res.status(201).json({
      success: true,
      message: 'Event tracked successfully',
      event: result.rows[0]
    });
  } catch (error) {
    console.error('Event tracking error:', error);
    res.status(500).json({ 
      error: 'Failed to track event',
      message: error.message 
    });
  }
});

export default router;
