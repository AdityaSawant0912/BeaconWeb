import { Schema, model, models } from 'mongoose'

const FenceSchema = new Schema({
    name: { type: String, required: true },
    color: { type: String, required: true },
    paths: [{
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
    }],
    createdBy: { type: String, ref: 'User' },

})

export default models.Fence || model('Fence', FenceSchema)