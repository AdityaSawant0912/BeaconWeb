import { Schema, model, models, Document } from 'mongoose'

export interface IUser extends Document {
  name: string;
  email: string;
  image?: string;
  emailVerified?: boolean;
  // Potentially lastKnownLocation: { lat: number, lng: number, timestamp: Date }
  // if you want to store it directly on the User model for quick access.
}

const UserSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  image: {
    type: String,
    required: false
  },
  emailVerified: {
    type: Boolean,
    required: false
  }
})

export default models.User || model('User', UserSchema)