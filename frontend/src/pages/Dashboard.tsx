import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../lib/api';
import { Card, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { getStatusColor, formatDate } from '../lib/utils';
import { Plus, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

interface Project {
  _id: string;
  name: string;
  description: string;
  apiKey: string;
  latestHealth: {
    healthScore: number;
    status: string;
    generatedAt: string;
  } | null;
  lastReportTime: string | null;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
    const interval = setInterval(fetchProjects, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await api.get('/projects');
      setProjects(response.data);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const getHealthScoreColor = (score: number | null) => {
    if (score === null) return 'text-slate-400';
    if (score >= 75) return 'text-green-600 dark:text-green-400';
    if (score >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Activity className="h-6 w-6 text-white" />
              <h1 className="text-xl font-semibold text-white">
                Project Health Tracker
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-white">{user?.email}</span>
              <Button variant="ghost" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-white">Projects</h2>
            <p className="text-white mt-1">Monitor the health of your applications</p>
          </div>
          <Button onClick={() => navigate('/projects/new')}>
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-12 text-white">Loading projects...</div>
        ) : projects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-white mb-4">No projects yet</p>
            <Button onClick={() => navigate('/projects/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Project
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project, index) => (
              <motion.div
                key={project._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Link to={`/projects/${project._id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white mb-1">
                            {project.name}
                          </h3>
                          {project.description && (
                            <p className="text-sm text-white line-clamp-2">
                              {project.description}
                            </p>
                          )}
                        </div>
                      </div>

                      {project.latestHealth ? (
                        <>
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <p className="text-xs text-white mb-1">Health Score</p>
                              <p className={`text-3xl font-bold ${getHealthScoreColor(project.latestHealth.healthScore)}`}>
                                {project.latestHealth.healthScore}
                              </p>
                            </div>
                            <div>
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.latestHealth.status)}`}
                              >
                                {project.latestHealth.status}
                              </span>
                            </div>
                          </div>
                          {project.lastReportTime && (
                            <p className="text-xs text-white">
                              Last report: {formatDate(project.lastReportTime)}
                            </p>
                          )}
                        </>
                      ) : (
                        <div className="py-4 text-center">
                          <p className="text-sm text-white">No health data yet</p>
                          <p className="text-xs text-white mt-1">
                            Set up the health agent to start monitoring
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

