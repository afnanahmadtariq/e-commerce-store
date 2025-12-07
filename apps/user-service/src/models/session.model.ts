import mongoose, { Schema, Document } from 'mongoose';

export interface ISessionDocument extends Document {
  userId: mongoose.Types.ObjectId;
  refreshToken: string;
  userAgent: string;
  ipAddress: string;
  expiresAt: Date;
  isValid: boolean;
  createdAt: Date;
}

const SessionSchema = new Schema<ISessionDocument>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  refreshToken: {
    type: String,
    required: true,
    unique: true,
  },
  userAgent: {
    type: String,
    required: true,
  },
  ipAddress: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  isValid: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: { createdAt: true, updatedAt: false },
});

// Clean up expired sessions
SessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Session = mongoose.model<ISessionDocument>('Session', SessionSchema);
