import mongoose from 'mongoose';

const healthMetricSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
    index: true,
  },
  apiLatency: {
    type: Number,
    required: true,
    default: 0,
  },
  dbLatency: {
    type: Number,
    required: true,
    default: 0,
  },
  errorRate: {
    type: Number,
    required: true,
    default: 0,
    min: 0,
    max: 100,
  },
  uptime: {
    type: Number,
    required: true,
    default: 0,
  },
});

healthMetricSchema.index({ projectId: 1, timestamp: -1 });

export default mongoose.model('HealthMetric', healthMetricSchema);

