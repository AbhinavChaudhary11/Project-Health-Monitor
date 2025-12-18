import express from 'express';
import HealthMetric from '../models/HealthMetric.js';
import { authenticateApiKey } from '../middleware/auth.js';
import { analyzeHealth } from '../services/healthAnalyzer.js';

const router = express.Router();

router.post('/report', authenticateApiKey, async (req, res) => {
  try {
    const { apiLatency, dbLatency, errorRate, uptime } = req.body;

    if (
      typeof apiLatency !== 'number' ||
      typeof dbLatency !== 'number' ||
      typeof errorRate !== 'number' ||
      typeof uptime !== 'number'
    ) {
      return res.status(400).json({ error: 'Invalid metric values' });
    }

    const metric = new HealthMetric({
      projectId: req.project._id,
      apiLatency,
      dbLatency,
      errorRate: Math.max(0, Math.min(100, errorRate)),
      uptime,
    });

    await metric.save();

    await analyzeHealth(req.project._id);

    res.json({ success: true, metricId: metric._id });
  } catch (error) {
    console.error('Report metric error:', error);
    res.status(500).json({ error: 'Failed to report metric' });
  }
});

export default router;

