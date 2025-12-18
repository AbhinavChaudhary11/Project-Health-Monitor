import HealthMetric from '../models/HealthMetric.js';
import HealthSnapshot from '../models/HealthSnapshot.js';

const THRESHOLDS = {
  API_LATENCY_WARNING: 500,
  API_LATENCY_CRITICAL: 1000,
  DB_LATENCY_WARNING: 200,
  DB_LATENCY_CRITICAL: 500,
  ERROR_RATE_WARNING: 5,
  ERROR_RATE_CRITICAL: 10,
  INACTIVE_HOURS: 2,
};

export async function analyzeHealth(projectId) {
  try {
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - THRESHOLDS.INACTIVE_HOURS * 60 * 60 * 1000);

    const recentMetrics = await HealthMetric.find({
      projectId,
      timestamp: { $gte: twoHoursAgo },
    }).sort({ timestamp: -1 });

    if (recentMetrics.length === 0) {
      const snapshot = new HealthSnapshot({
        projectId,
        healthScore: 0,
        status: 'Critical',
        issues: ['No metrics received in the last 2 hours. Project appears inactive.'],
        suggestions: [
          'Check if the health agent is running in your project',
          'Verify the API key is correct',
          'Ensure the tracker URL is accessible from your project',
        ],
      });
      await snapshot.save();
      return snapshot;
    }

    const latestMetric = recentMetrics[0];
    const avgApiLatency = recentMetrics.reduce((sum, m) => sum + m.apiLatency, 0) / recentMetrics.length;
    const avgDbLatency = recentMetrics.reduce((sum, m) => sum + m.dbLatency, 0) / recentMetrics.length;
    const avgErrorRate = recentMetrics.reduce((sum, m) => sum + m.errorRate, 0) / recentMetrics.length;

    const issues = [];
    const suggestions = [];

    if (avgApiLatency > THRESHOLDS.API_LATENCY_CRITICAL) {
      issues.push('Critical API latency detected');
      suggestions.push('Optimize API endpoints, consider caching, or scale backend services');
    } else if (avgApiLatency > THRESHOLDS.API_LATENCY_WARNING) {
      issues.push('High API latency detected');
      suggestions.push('Review slow API endpoints and consider performance optimizations');
    }

    if (avgDbLatency > THRESHOLDS.DB_LATENCY_CRITICAL) {
      issues.push('Critical database latency detected');
      suggestions.push('Optimize database queries, add indexes, or consider database scaling');
    } else if (avgDbLatency > THRESHOLDS.DB_LATENCY_WARNING) {
      issues.push('High database latency detected');
      suggestions.push('Review database queries and consider adding indexes');
    }

    if (avgErrorRate > THRESHOLDS.ERROR_RATE_CRITICAL) {
      issues.push('Critical error rate detected');
      suggestions.push('Investigate error logs immediately, check for bugs or infrastructure issues');
    } else if (avgErrorRate > THRESHOLDS.ERROR_RATE_WARNING) {
      issues.push('Elevated error rate detected');
      suggestions.push('Review error logs and monitor for patterns');
    }

    if (issues.length === 0) {
      issues.push('No issues detected');
    }

    const backendScore = Math.max(0, 100 - (avgApiLatency / THRESHOLDS.API_LATENCY_CRITICAL) * 30);
    const dbScore = Math.max(0, 100 - (avgDbLatency / THRESHOLDS.DB_LATENCY_CRITICAL) * 25);
    const errorScore = Math.max(0, 100 - (avgErrorRate / THRESHOLDS.ERROR_RATE_CRITICAL) * 25);
    const activityScore = 100;

    const healthScore = Math.round(
      backendScore * 0.3 + dbScore * 0.25 + errorScore * 0.25 + activityScore * 0.2
    );

    let status = 'Healthy';
    if (healthScore < 50) {
      status = 'Critical';
    } else if (healthScore < 75) {
      status = 'Warning';
    }

    const snapshot = new HealthSnapshot({
      projectId,
      healthScore,
      status,
      issues,
      suggestions,
    });

    await snapshot.save();
    return snapshot;
  } catch (error) {
    console.error('Health analysis error:', error);
    throw error;
  }
}

