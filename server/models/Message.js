import mongoose from 'mongoose'

// Bucketed message schema — from architecture audit
// Groups messages in daily buckets of max 100
// Reduces document count by 100x
const messageBucketSchema = new mongoose.Schema(
  {
    chatId:    {
      type:  mongoose.Schema.Types.ObjectId,
      ref:   'Chat',
      index: true,
    },
    bucketDate: { type: Date, index: true }, // date only

    messages: [{
      _id:      { type: mongoose.Schema.Types.ObjectId,
                  default: () => new mongoose.Types.ObjectId() },
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      type:     {
        type:    String,
        enum:    ['text','image','product_card','order_update','ai_suggestion'],
        default: 'text',
      },
      content:  { type: String, default: '' },
      metadata: { type: mongoose.Schema.Types.Mixed, default: null },
      isRead:   { type: Boolean, default: false },
      readAt:   { type: Date,    default: null  },
      isDeleted:{ type: Boolean, default: false },
      createdAt:{ type: Date,    default: Date.now },
    }],

    count:          { type: Number, default: 0 },   // max 100
    firstMessageAt: { type: Date },
    lastMessageAt:  { type: Date },
  },
  { timestamps: false }
)

messageBucketSchema.index({ chatId: 1, bucketDate: -1 })

const MessageBucket = mongoose.model('MessageBucket', messageBucketSchema)
export default MessageBucket