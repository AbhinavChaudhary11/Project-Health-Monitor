import mongoose from 'mongoose';

const healthSnapshotSchema = new mongoose.Schema({
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,
    index: true,
  },
  healthScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100,
  },
  status: {
    type: String,
    enum: ['Healthy', 'Warning', 'Critical'],
    required: true,
  },
  issues: [{
    type: String,
  }],
  suggestions: [{
    type: String,
  }],
  generatedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

healthSnapshotSchema.index({ projectId: 1, generatedAt: -1 });

export default mongoose.model('HealthSnapshot', healthSnapshotSchema);

