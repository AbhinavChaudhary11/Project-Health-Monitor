import axios from 'axios';

let intervalId = null;
let startTime = Date.now();
let apiLatencySum = 0;
let apiLatencyCount = 0;
let dbLatencySum = 0;
let dbLatencyCount = 0;
let errorCount = 0;
let requestCount = 0;

let config = null;

const defaultOptions = {
  reportInterval: 60000,
  enableApiTracking: true,
  enableDbTracking: false,
};

export function initHealthAgent(options) {
  if (intervalId) {
    console.warn('[Health Agent] Already initialized');
    return;
  }

  if (!options || !options.apiKey || !options.trackerUrl) {
    console.error('[Health Agent] apiKey and trackerUrl are required');
    return;
  }

  config = { ...defaultOptions, ...options };
  startTime = Date.now();

  if (config.enableApiTracking) {
    setupApiTracking();
  }

  intervalId = setInterval(() => {
    reportMetrics().catch(() => {
      // Fail silently
    });
  }, config.reportInterval);

  reportMetrics().catch(() => {
    // Fail silently on initial report
  });

  console.log('[Health Agent] Initialized');
}

export function trackApiLatency(latencyMs) {
  if (!config) return;
  apiLatencySum += latencyMs;
  apiLatencyCount++;
}

export function trackDbLatency(latencyMs) {
  if (!config) return;
  dbLatencySum += latencyMs;
  dbLatencyCount++;
}

export function trackError() {
  errorCount++;
}

export function trackRequest() {
  requestCount++;
}

function setupApiTracking() {
  if (typeof window !== 'undefined') {
    const originalFetch = window.fetch;
    window.fetch = function (...args) {
      const start = Date.now();
      return originalFetch.apply(this, args).finally(() => {
        const latency = Date.now() - start;
        trackApiLatency(latency);
        trackRequest();
      });
    };
  }

  if (typeof global !== 'undefined' && global.fetch) {
    const originalFetch = global.fetch;
    global.fetch = function (...args) {
      const start = Date.now();
      return originalFetch.apply(this, args).finally(() => {
        const latency = Date.now() - start;
        trackApiLatency(latency);
        trackRequest();
      });
    };
  }
}

async function reportMetrics() {
  if (!config) return;

  const uptime = Math.floor((Date.now() - startTime) / 1000);
  const avgApiLatency = apiLatencyCount > 0 ? apiLatencySum / apiLatencyCount : 0;
  const avgDbLatency = dbLatencyCount > 0 ? dbLatencySum / dbLatencyCount : 0;
  const errorRate = requestCount > 0 ? (errorCount / requestCount) * 100 : 0;

  try {
    await axios.post(
      `${config.trackerUrl}/api/metrics/report`,
      {
        apiLatency: Math.round(avgApiLatency),
        dbLatency: Math.round(avgDbLatency),
        errorRate: Math.round(errorRate * 100) / 100,
        uptime,
      },
      {
        headers: {
          'X-API-Key': config.apiKey,
        },
        timeout: 5000,
      }
    );

    apiLatencySum = 0;
    apiLatencyCount = 0;
    dbLatencySum = 0;
    dbLatencyCount = 0;
    errorCount = 0;
    requestCount = 0;
  } catch (error) {
    // Fail silently - don't crash the host app
  }
}

export function stopHealthAgent() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
    config = null;
    console.log('[Health Agent] Stopped');
  }
}

