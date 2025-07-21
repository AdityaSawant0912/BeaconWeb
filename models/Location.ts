import { Schema, model, models } from 'mongoose'

const LocationSchema = new Schema({
    userId: {
        type: String,
        ref: 'User',
        required: true
        // Removed unique: true to allow multiple location entries per user
    },
    coordinate: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    },
    timestamp: {
        type: Date, // Timestamp of this specific location record
        default: Date.now,
        required: true
    },
    // You might add other location-related data here, e.g.,
    // accuracy: Number,
    // speed: Number,
    // heading: Number,
});

// Add a TTL (Time-To-Live) index to automatically remove documents
// older than 24 hours (86400 seconds)
LocationSchema.index({ timestamp: 1 }, { expireAfterSeconds: 86400 });

export default models.Location || model('Location', LocationSchema)