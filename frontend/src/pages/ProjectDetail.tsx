import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getStatusColor, formatDate } from '../lib/utils';
import { ArrowLeft, Activity } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface HealthSnapshot {
  healthScore: number;
  status: string;
  issues: string[];
  suggestions: string[];
  generatedAt: string;
}

interface Metric {
  timestamp: string;
  apiLatency: number;
  dbLatency: number;
  errorRate: number;
  uptime: number;
}

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState<any>(null);
  const [health, setHealth] = useState<HealthSnapshot | null>(null);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
      const interval = setInterval(fetchData, 30000);
      return () => clearInterval(interval);
    }
  }, [id]);

  const fetchData = async () => {
    if (!id) return;

    try {
      const [projectRes, healthRes, metricsRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/projects/${id}/health`),
        api.get(`/projects/${id}/metrics`),
      ]);

      setProject(projectRes.data);
      setHealth(healthRes.data);
      setMetrics(metricsRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartData = metrics.map((m) => ({
    time: new Date(m.timestamp).toLocaleTimeString(),
    apiLatency: m.apiLatency,
    dbLatency: m.dbLatency,
    errorRate: m.errorRate,
  }));

  const getHealthScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-400';
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/dashboard"
          className="inline-flex items-center text-sm text-white hover:text-slate-200 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        {project && (
          <>
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {project.name}
              </h1>
              {project.description && (
                <p className="text-white">{project.description}</p>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-sm text-white">Health Score</p>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(health?.status || 'Unknown')}`}
                    >
                      {health?.status || 'Unknown'}
                    </span>
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <p className={`text-4xl font-bold ${getHealthScoreColor(health?.healthScore || null)}`}>
                      {health?.healthScore ?? 'N/A'}
                    </p>
                    {health?.healthScore !== null && (
                      <span className="text-white">/ 100</span>
                    )}
                  </div>
                  {health?.generatedAt && (
                    <p className="text-xs text-white mt-2">
                      Updated: {formatDate(health.generatedAt)}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-white mb-4">Latest Metrics</p>
                  {metrics.length > 0 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-white">API Latency</span>
                        <span className="text-sm font-medium text-white">
                          {metrics[metrics.length - 1]?.apiLatency}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white">DB Latency</span>
                        <span className="text-sm font-medium text-white">
                          {metrics[metrics.length - 1]?.dbLatency}ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-white">Error Rate</span>
                        <span className="text-sm font-medium text-white">
                          {metrics[metrics.length - 1]?.errorRate.toFixed(2)}%
                        </span>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-white">No metrics available</p>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-white mb-4">Project Info</p>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Created</span>
                      <span className="text-sm font-medium text-white">
                        {formatDate(project.createdAt)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-white">Total Metrics</span>
                      <span className="text-sm font-medium text-white">{metrics.length}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {health && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Issues</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {health.issues.length > 0 ? (
                      <ul className="space-y-2">
                        {health.issues.map((issue, index) => (
                          <li key={index} className="flex items-start">
                            <Activity className="h-4 w-4 mr-2 mt-0.5 text-white" />
                            <span className="text-sm text-white">{issue}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-white">No issues detected</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Suggestions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {health.suggestions.length > 0 ? (
                      <ul className="space-y-2">
                        {health.suggestions.map((suggestion, index) => (
                          <li key={index} className="flex items-start">
                            <span className="text-sm text-white mr-2">•</span>
                            <span className="text-sm text-white">{suggestion}</span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-white">No suggestions at this time</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {chartData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Metrics Over Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={400}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                      <XAxis
                        dataKey="time"
                        stroke="hsl(var(--muted-foreground))"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis stroke="hsl(var(--muted-foreground))" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="apiLatency"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="API Latency (ms)"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="dbLatency"
                        stroke="#10b981"
                        strokeWidth={2}
                        name="DB Latency (ms)"
                        dot={false}
                      />
                      <Line
                        type="monotone"
                        dataKey="errorRate"
                        stroke="#ef4444"
                        strokeWidth={2}
                        name="Error Rate (%)"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </div>
  );
}

