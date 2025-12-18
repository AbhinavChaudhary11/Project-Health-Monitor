# Project Health Tracker

A centralized web application for monitoring the health, performance, and issues of multiple software projects in real-time. Track API latency, database performance, error rates, and receive automated health analysis with actionable suggestions.

## What It Does

- **Monitor Multiple Projects**: Track health metrics from multiple applications from a single dashboard
- **Real-time Metrics**: Collect API latency, database latency, error rates, and uptime data
- **Automated Health Analysis**: Rule-based engine that calculates health scores and identifies issues
- **Actionable Insights**: Get suggestions for improving project performance
- **Lightweight Agent**: Simple npm package that reports metrics without impacting your applications

## Tech Stack

### Backend
- **Node.js** + **Express** - RESTful API server
- **MongoDB** + **Mongoose** - Database and ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** + **Vite** - Modern frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **React Router** - Navigation

### Health Agent
- **Node.js** - Lightweight npm package
- **Axios** - HTTP requests

The agent will automatically:
- Track API latency (via fetch interception)
- Report metrics every 60 seconds
- Fail silently if the tracker is unreachable


## How It Works

1. **Create a Project**: Add a new project in the dashboard to get an API key
2. **Install Agent**: Add the health agent to your project with the API key
3. **Automatic Reporting**: The agent reports metrics every 60 seconds
4. **Health Analysis**: The backend analyzes metrics and generates health scores
5. **View Dashboard**: See real-time health status, metrics, and suggestions

## Health Scoring

Health scores (0-100) are calculated based on:
- **Backend Performance** (30%) - API latency
- **Database Performance** (25%) - DB query latency
- **Error Rate** (25%) - Percentage of failed requests
- **Activity** (20%) - Recent metric reports

Status levels:
- **Healthy** (75-100): No issues detected
- **Warning** (50-74): Performance degradation detected
- **Critical** (0-49): Significant issues requiring attention

## Project Structure

```
Project Health Monitor/
├── backend/              # Express API server
│   ├── models/          # MongoDB models
│   ├── routes/          # API routes
│   ├── middleware/      # Auth middleware
│   ├── services/        # Health analysis
│   ├── scripts/         # Demo data generator
│   └── server.js        # Entry point
├── frontend/            # React application
│   └── src/
│       ├── components/  # UI components
│       ├── pages/       # Page components
│       ├── contexts/    # React contexts
│       └── lib/         # Utilities
└── health-agent/        # NPM health agent package
    └── index.js         # Agent implementation
```

**Frontend (.env)**
```
VITE_API_URL=http://localhost:5000/api
```

