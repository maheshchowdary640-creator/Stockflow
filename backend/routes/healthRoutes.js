const express = require('express');
const router = express.Router();
const { getHealthStatus } = require('../controllers/healthController');

/**
 * @route   GET /api/health
 * @desc    Check API and database health status
 * @access  Public
 */
router.get('/', getHealthStatus);

module.exports = router;
