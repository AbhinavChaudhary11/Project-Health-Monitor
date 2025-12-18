import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { ArrowLeft, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function CreateProject() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdProject, setCreatedProject] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await api.post('/projects', { name, description });
      setCreatedProject(response.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (createdProject) {
    const trackerUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
    const setupCode = `import { initHealthAgent } from 'health-agent';

initHealthAgent({
  apiKey: '${createdProject.apiKey}',
  trackerUrl: '${trackerUrl}',
});`;

    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-white hover:text-slate-200 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

          <Card>
            <CardHeader>
              <CardTitle>Project Created Successfully!</CardTitle>
              <CardDescription>Set up the health agent in your project to start monitoring</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-white">API Key</label>
                <div className="flex items-center space-x-2">
                  <Input value={createdProject.apiKey} readOnly className="font-mono text-sm" />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(createdProject.apiKey)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-white mt-1">
                  Keep this key secure. You'll need it to configure the health agent.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-white">Installation Steps</label>
                <ol className="list-decimal list-inside space-y-2 text-sm text-white">
                  <li className="mb-2 text-white">Install the health-agent package in your project:
                    <pre className="mt-1 p-3 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-xs text-slate-900 dark:text-slate-100">
                      npm install health-agent
                    </pre>
                  </li>
                  <li className="mb-2 text-white">Add the initialization code to your project entry point:
                    <div className="relative mt-1">
                      <pre className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg font-mono text-xs overflow-x-auto text-slate-900 dark:text-slate-100">
                        {setupCode}
                      </pre>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute top-2 right-2"
                        onClick={() => copyToClipboard(setupCode)}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  </li>
                  <li className="text-white">The agent will automatically start reporting metrics every 60 seconds</li>
                </ol>
              </div>

              <div className="flex space-x-4 pt-4">
                <Button onClick={() => navigate('/dashboard')}>Go to Dashboard</Button>
                <Button variant="outline" onClick={() => navigate(`/projects/${createdProject._id}`)}>
                  View Project
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/dashboard" className="inline-flex items-center text-sm text-white hover:text-slate-200 mb-6">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>

        <Card>
          <CardHeader>
            <CardTitle>Create New Project</CardTitle>
            <CardDescription>Add a new project to monitor</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm dark:bg-red-950 dark:text-red-400">
                  {error}
                </div>
              )}
              <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2 text-white">
                  Project Name *
                </label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="My Awesome Project"
                />
              </div>
              <div>
                <label htmlFor="description" className="block text-sm font-medium mb-2 text-white">
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="flex min-h-[80px] w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-50 dark:ring-offset-slate-950 dark:placeholder:text-slate-400 dark:focus-visible:ring-slate-300"
                  placeholder="A brief description of your project"
                />
              </div>
              <div className="flex space-x-4 pt-4">
                <Button type="submit" disabled={loading}>
                  {loading ? 'Creating...' : 'Create Project'}
                </Button>
                <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

