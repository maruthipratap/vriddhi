import mongoose from 'mongoose'

const chatSchema = new mongoose.Schema(
  {
    // Always exactly 2 participants: [farmerId, shopOwnerId]
    participants: [{
      type:  mongoose.Schema.Types.ObjectId,
      ref:   'User',
    }],

    shopId: {
      type: mongoose.Schema.Types.ObjectId,
      ref:  'Shop',
      index: true,
    },

    // Optional order context
    orderId: {
      type:    mongoose.Schema.Types.ObjectId,
      ref:     'Order',
      default: null,
    },

    // Denormalized for performance — last message preview
    lastMessage:   { type: String,  default: '' },
    lastMessageAt: { type: Date,    default: null, index: true },
    lastMessageBy: {
      type:    mongoose.Schema.Types.ObjectId,
      default: null,
    },

    // Unread counts per user — Map: userId → count
    unreadCount: {
      type:    Map,
      of:      Number,
      default: {},
    },

    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
)

// ── Indexes ───────────────────────────────────────────────────
chatSchema.index({ participants: 1, lastMessageAt: -1 })
chatSchema.index({ participants: 1, shopId: 1 }, { unique: true })

const Chat = mongoose.model('Chat', chatSchema)
export default Chat