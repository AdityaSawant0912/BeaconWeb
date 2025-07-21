import { Schema, model, models } from 'mongoose'

const UserSchema = new Schema({
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