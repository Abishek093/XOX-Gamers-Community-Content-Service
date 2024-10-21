import mongoose, { Document, Model } from 'mongoose';

export interface IReport extends Document {
  reporterId: mongoose.Schema.Types.ObjectId;
  targetId: mongoose.Schema.Types.ObjectId;
  targetType: 'post' | 'comment' | 'user' | 'livestream';
  reason: string;
  details?: string;
  status: 'pending' | 'reviewed' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
}

const reportSchema = new mongoose.Schema<IReport>({
  reporterId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  targetType: { 
    type: String, 
    required: true, 
    enum: ['post', 'comment', 'user', 'livestream'],
  },
  reason: { type: String, required: true },
  details: { type: String },
  status: { 
    type: String, 
    default: 'pending', 
    enum: ['pending', 'reviewed', 'resolved'],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

reportSchema.pre<IReport>('save', function (next) {
  this.updatedAt = new Date();
  next();
});

const ReportModel: Model<IReport> = mongoose.model<IReport>('Report', reportSchema);

export default ReportModel;
