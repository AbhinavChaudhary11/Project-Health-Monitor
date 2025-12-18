import jwt from 'jsonwebtoken';

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

export const authenticateApiKey = async (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey) {
    return res.status(401).json({ error: 'API key required' });
  }

  try {
    const Project = (await import('../models/Project.js')).default;
    const project = await Project.findOne({ apiKey });
    
    if (!project) {
      return res.status(403).json({ error: 'Invalid API key' });
    }
    
    req.project = project;
    next();
  } catch (error) {
    res.status(500).json({ error: 'Authentication error' });
  }
};

