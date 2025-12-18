import express from 'express';
import Project from '../models/Project.js';
import HealthSnapshot from '../models/HealthSnapshot.js';
import HealthMetric from '../models/HealthMetric.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticateToken);

router.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const project = new Project({
      name,
      description: description || '',
      owner: req.user.userId,
    });

    await project.save();

    res.status(201).json(project);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Failed to create project' });
  }
});

router.get('/', async (req, res) => {
  try {
    const projects = await Project.find({ owner: req.user.userId })
      .select('-__v')
      .sort({ createdAt: -1 });

    const projectsWithHealth = await Promise.all(
      projects.map(async (project) => {
        const latestSnapshot = await HealthSnapshot.findOne({ projectId: project._id })
          .sort({ generatedAt: -1 })
          .limit(1);

        const latestMetric = await HealthMetric.findOne({ projectId: project._id })
          .sort({ timestamp: -1 })
          .limit(1);

        return {
          ...project.toObject(),
          latestHealth: latestSnapshot
            ? {
                healthScore: latestSnapshot.healthScore,
                status: latestSnapshot.status,
                generatedAt: latestSnapshot.generatedAt,
              }
            : null,
          lastReportTime: latestMetric?.timestamp || null,
        };
      })
    );

    res.json(projectsWithHealth);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

router.get('/:id/health', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const latestSnapshot = await HealthSnapshot.findOne({ projectId: project._id })
      .sort({ generatedAt: -1 })
      .limit(1);

    if (!latestSnapshot) {
      return res.json({
        projectId: project._id,
        healthScore: null,
        status: 'Unknown',
        issues: [],
        suggestions: ['No health data available yet. Metrics will appear once the agent starts reporting.'],
        generatedAt: null,
      });
    }

    res.json(latestSnapshot);
  } catch (error) {
    console.error('Get health error:', error);
    res.status(500).json({ error: 'Failed to fetch health data' });
  }
});

router.get('/:id/metrics', async (req, res) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user.userId,
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const limit = parseInt(req.query.limit) || 100;
    const metrics = await HealthMetric.find({ projectId: project._id })
      .sort({ timestamp: -1 })
      .limit(limit)
      .select('-__v');

    res.json(metrics.reverse());
  } catch (error) {
    console.error('Get metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

export default router;

