# Health Agent

Lightweight npm package for reporting project health metrics to the Project Health Tracker.

## Installation

```bash
npm install health-agent
```

## Usage

```javascript
import { initHealthAgent } from 'health-agent';

initHealthAgent({
  apiKey: 'YOUR_PROJECT_API_KEY',
  trackerUrl: 'http://localhost:5000',
  reportInterval: 60000, // Optional: default 60 seconds
  enableApiTracking: true, // Optional: default true
  enableDbTracking: false, // Optional: default false
});
```

## Features

- Automatically tracks API latency (via fetch interception)
- Reports metrics every 60 seconds
- Fails silently if tracker is unreachable
- Never crashes the host application
- Lightweight and production-safe

## Manual Tracking

```javascript
import { trackApiLatency, trackDbLatency, trackError } from 'health-agent';

// Track custom API latency
trackApiLatency(150);

// Track database query latency
trackDbLatency(50);

// Track an error
trackError();
```

