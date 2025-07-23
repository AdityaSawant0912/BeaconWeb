import { Schema, model, models, Document, Types} from 'mongoose'

export interface ISharePermission extends Document {
  sharerId: Types.ObjectId; // User who is sharing their location
  viewerId: Types.ObjectId; // User who is allowed to view the sharer's location
  status: 'active' | 'pending_request' | 'rejected' | 'paused';
  createdAt: Date;
  expiresAt?: Date; // Optional: for temporary sharing
}


const SharePermissionSchema = new Schema({
  sharerId: {
    type: String, // The user who is sharing their location
    ref: 'User',
    required: true
  },
  viewerId: {
    type: String, // The user who is allowed to view the sharer's location
    ref: 'User',
    required: true
  },
  status: {
    type: String, // e.g., 'active', 'pending_request', 'rejected'
    enum: ['active', 'pending_request', 'rejected', 'paused'],
    default: 'active',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date, // Optional: for temporary sharing
    required: false
  }
});

// Ensure unique sharing relationships (a sharer shares with a viewer only once)
SharePermissionSchema.index({ sharerId: 1, viewerId: 1 }, { unique: true });

export default models.SharePermission || model('SharePermission', SharePermissionSchema)