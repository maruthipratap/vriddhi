import Chat          from '../models/Chat.js'
import MessageBucket from '../models/Message.js'

const chatRepository = {

  // ── Find or create chat between farmer and shop ───────────
  async findOrCreate(farmerId, shopId, orderId = null) {
    let chat = await Chat.findOne({
      participants: { $all: [farmerId, shopId] },
      shopId,
    })

    if (!chat) {
      chat = await Chat.create({
        participants:  [farmerId, shopId],
        shopId,
        orderId,
        unreadCount:   {},
        lastMessageAt: new Date(),
      })
    }
    return chat
  },

  async findById(id) {
    return Chat.findById(id)
  },

  // BOLA check — user must be participant
  async findByIdAndParticipant(chatId, userId) {
    return Chat.findOne({
      _id:          chatId,
      participants: userId,
    })
  },

  async findUserChats(userId) {
    return Chat.find({ participants: userId })
      .sort({ lastMessageAt: -1 })
      .limit(50)
  },

  async updateLastMessage(chatId, message, senderId) {
    return Chat.findByIdAndUpdate(chatId, {
      $set: {
        lastMessage:   message,
        lastMessageAt: new Date(),
        lastMessageBy: senderId,
      }
    })
  },

  async incrementUnread(chatId, userId) {
    return Chat.findByIdAndUpdate(chatId, {
      $inc: { [`unreadCount.${userId}`]: 1 }
    })
  },

  async clearUnread(chatId, userId) {
    return Chat.findByIdAndUpdate(chatId, {
      $set: { [`unreadCount.${userId}`]: 0 }
    })
  },

  // ── Message bucketing ─────────────────────────────────────
  async addMessage(chatId, message) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find today's bucket with space (max 100 messages)
    let bucket = await MessageBucket.findOne({
      chatId,
      bucketDate: today,
      count:      { $lt: 100 },
    })

    if (!bucket) {
      // Create new bucket for today
      bucket = await MessageBucket.create({
        chatId,
        bucketDate:     today,
        messages:       [],
        count:          0,
        firstMessageAt: new Date(),
        lastMessageAt:  new Date(),
      })
    }

    // Add message to bucket
    await MessageBucket.findByIdAndUpdate(bucket._id, {
      $push: { messages: message },
      $inc:  { count: 1 },
      $set:  { lastMessageAt: new Date() },
    })

    return message
  },

  async getMessages(chatId, limit = 50, beforeDate = null) {
    const query = { chatId }
    if (beforeDate) query.bucketDate = { $lte: beforeDate }

    const buckets = await MessageBucket
      .find(query)
      .sort({ bucketDate: -1 })
      .limit(5)   // last 5 buckets = up to 500 messages

    // Flatten and sort messages
    const messages = buckets
      .flatMap(b => b.messages)
      .filter(m => !m.isDeleted)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit)

    return messages.reverse()
  },
}

export default chatRepository