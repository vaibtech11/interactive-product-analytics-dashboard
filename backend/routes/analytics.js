import express from 'express';
import { query } from '../db.js';
import { authMiddleware } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * Validate date string format (YYYY-MM-DD)
 */
const isValidDate = (dateString) => {
  if (!dateString) return true; // Optional parameter
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(dateString)) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
};

/**
 * Validate feature_name (alphanumeric, underscore, hyphen only)
 */
const isValidFeatureName = (featureName) => {
  if (!featureName) return false;
  const regex = /^[a-zA-Z0-9_-]+$/;
  return regex.test(featureName) && featureName.length <= 255;
};

/**
 * GET /analytics
 * Main analytics endpoint returning both bar chart and line chart data
 * Query params: start_date, end_date, age, gender, feature_name
 */
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { start_date, end_date, age, gender, feature_name } = req.query;

    // Validate date parameters
    if (start_date && !isValidDate(start_date)) {
      return res.status(400).json({ 
        error: 'Invalid start_date format. Use YYYY-MM-DD' 
      });
    }

    if (end_date && !isValidDate(end_date)) {
      return res.status(400).json({ 
        error: 'Invalid end_date format. Use YYYY-MM-DD' 
      });
    }

    // Validate start_date <= end_date
    if (start_date && end_date && new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ 
        error: 'start_date must be less than or equal to end_date' 
      });
    }

   

    // Validate gender if provided
    if (gender && !['Male', 'Female', 'Other'].includes(gender)) {
      return res.status(400).json({ 
        error: 'Invalid gender. Must be Male, Female, or Other' 
      });
    }

    // Validate feature_name if provided
    if (feature_name && !isValidFeatureName(feature_name)) {
      return res.status(400).json({ 
        error: 'Invalid feature_name. Only alphanumeric characters, underscores, and hyphens are allowed' 
      });
    }

    // Build base WHERE clause for user filtering
    let baseWhereClause = 'WHERE fc.user_id = $1';
    const baseParams = [req.userId];
    let paramCount = 1;

    // Add user demographic filters (age, gender) by joining with users table
    let joinClause = '';
    if (age || gender) {
      joinClause = 'INNER JOIN users u ON fc.user_id = u.id';
      
      if (age) {
  if (age === 'under_18') {
    baseWhereClause += ` AND u.age < 18`;
  } 
  else if (age === '18_40') {
    baseWhereClause += ` AND u.age BETWEEN 18 AND 40`;
  } 
  else if (age === 'over_40') {
    baseWhereClause += ` AND u.age > 40`;
  }
}

      if (gender) {
        paramCount++;
        baseWhereClause += ` AND u.gender = $${paramCount}`;
        baseParams.push(gender);
      }
    }

    // Add date range filters
    if (start_date) {
      paramCount++;
      baseWhereClause += ` AND fc.timestamp >= $${paramCount}`;
      baseParams.push(start_date);
    }

    if (end_date) {
      paramCount++;
      baseWhereClause += ` AND fc.timestamp <= $${paramCount}`;
      baseParams.push(end_date);
    }

    // BAR CHART DATA: Total clicks per feature
    const barChartQuery = `
      SELECT 
        fc.feature_name, 
        COUNT(*) as total 
      FROM feature_clicks fc
      ${joinClause}
      ${baseWhereClause}
      GROUP BY fc.feature_name 
      ORDER BY total DESC
    `;

    const barChartResult = await query(barChartQuery, baseParams);

    // LINE CHART DATA: Clicks over time for selected feature
    let lineChartResult = { rows: [] };
    
    if (feature_name) {
      // Add feature_name filter for line chart
      const lineChartParams = [...baseParams];
      let lineChartWhere = baseWhereClause;
      paramCount++;
      lineChartWhere += ` AND fc.feature_name = $${paramCount}`;
      lineChartParams.push(feature_name);

      const lineChartQuery = `
        SELECT 
          DATE(fc.timestamp) as day, 
          COUNT(*) as clicks 
        FROM feature_clicks fc
        ${joinClause}
        ${lineChartWhere}
        GROUP BY day 
        ORDER BY day ASC
      `;

      lineChartResult = await query(lineChartQuery, lineChartParams);
    }

    // Format response
    const response = {
      barChart: barChartResult.rows.map(row => ({
        feature_name: row.feature_name,
        total: parseInt(row.total)
      })),
      lineChart: lineChartResult.rows.map(row => ({
        day: row.day.toISOString().split('T')[0],
        clicks: parseInt(row.clicks)
      })),
      filters: {
        start_date: start_date || null,
        end_date: end_date || null,
        age: age || null,
        gender: gender || null,
        feature_name: feature_name || null
      }
    };

    // Handle empty results gracefully
    if (response.barChart.length === 0) {
      response.message = 'No data found for the specified filters';
    }

    res.json(response);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch analytics',
      message: error.message 
    });
  }
});

/**
 * GET /analytics/feature-summary
 * Return total clicks per feature
 * Optional filters: startDate, endDate
 */
router.get('/feature-summary', authMiddleware, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Validate date parameters
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ 
        error: 'Invalid startDate format. Use YYYY-MM-DD' 
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ 
        error: 'Invalid endDate format. Use YYYY-MM-DD' 
      });
    }

    // Build parameterized query
    let queryText = `
      SELECT 
        feature_name, 
        COUNT(*) as count 
      FROM feature_clicks 
      WHERE user_id = $1
    `;
    const params = [req.userId];
    let paramCount = 1;

    if (startDate) {
      paramCount++;
      queryText += ` AND timestamp >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      queryText += ` AND timestamp <= $${paramCount}`;
      params.push(endDate);
    }

    queryText += ' GROUP BY feature_name ORDER BY count DESC';

    const result = await query(queryText, params);

    // Handle empty results gracefully
    if (result.rows.length === 0) {
      return res.json({ 
        data: [],
        message: 'No feature clicks found for the specified period'
      });
    }

    res.json({ 
      data: result.rows.map(row => ({
        feature_name: row.feature_name,
        count: parseInt(row.count)
      }))
    });
  } catch (error) {
    console.error('Feature summary error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch feature summary',
      message: error.message 
    });
  }
});

/**
 * GET /analytics/feature-timeline
 * Return clicks over time for selected feature
 * Required: feature_name
 * Optional: startDate, endDate
 */
router.get('/feature-timeline', authMiddleware, async (req, res) => {
  try {
    const { feature_name, startDate, endDate } = req.query;

    // Validate required feature_name parameter
    if (!feature_name) {
      return res.status(400).json({ 
        error: 'feature_name parameter is required' 
      });
    }

    if (!isValidFeatureName(feature_name)) {
      return res.status(400).json({ 
        error: 'Invalid feature_name. Only alphanumeric characters, underscores, and hyphens are allowed' 
      });
    }

    // Validate date parameters
    if (startDate && !isValidDate(startDate)) {
      return res.status(400).json({ 
        error: 'Invalid startDate format. Use YYYY-MM-DD' 
      });
    }

    if (endDate && !isValidDate(endDate)) {
      return res.status(400).json({ 
        error: 'Invalid endDate format. Use YYYY-MM-DD' 
      });
    }

    // Build parameterized query
    let queryText = `
      SELECT 
        DATE(timestamp) as day, 
        COUNT(*) as count 
      FROM feature_clicks 
      WHERE user_id = $1 AND feature_name = $2
    `;
    const params = [req.userId, feature_name];
    let paramCount = 2;

    if (startDate) {
      paramCount++;
      queryText += ` AND timestamp >= $${paramCount}`;
      params.push(startDate);
    }

    if (endDate) {
      paramCount++;
      queryText += ` AND timestamp <= $${paramCount}`;
      params.push(endDate);
    }

    queryText += ' GROUP BY day ORDER BY day ASC';

    const result = await query(queryText, params);

    // Handle empty results gracefully
    if (result.rows.length === 0) {
      return res.json({ 
        feature_name,
        data: [],
        message: 'No clicks found for this feature in the specified period'
      });
    }

    res.json({ 
      feature_name,
      data: result.rows.map(row => ({
        day: row.day.toISOString().split('T')[0],
        count: parseInt(row.count)
      }))
    });
  } catch (error) {
    console.error('Feature timeline error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch feature timeline',
      message: error.message 
    });
  }
});

export default router;
