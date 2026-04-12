import mongoose from 'mongoose'

// Stores browser push subscriptions per user.
// One user can have multiple devices.
const pushSubscriptionSchema = new mongoose.Schema({
  userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  endpoint: { type: String, required: true, unique: true },
  keys: {
    p256dh: { type: String, required: true },
    auth:   { type: String, required: true },
  },
}, { timestamps: true })

export default mongoose.model('PushSubscription', pushSubscriptionSchema)
