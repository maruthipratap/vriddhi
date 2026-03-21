import { Router }       from 'express'
import chatRepository   from '../repositories/chat.repository.js'
import { protect }      from '../middleware/auth.middleware.js'

const router = Router()
router.use(protect)

// Get or create chat with a shop
router.post('/with-shop/:shopId', async (req, res, next) => {
  try {
    const chat = await chatRepository.findOrCreate(
      req.user.id,
      req.params.shopId,
      req.query.orderId || null
    )
    res.status(200).json({ success: true, data: { chat } })
  } catch (err) {
    next(err)
  }
})

// Get all my chats
router.get('/', async (req, res, next) => {
  try {
    const chats = await chatRepository.findUserChats(req.user.id)
    res.status(200).json({
      success: true,
      data: { chats, count: chats.length }
    })
  } catch (err) {
    next(err)
  }
})

// Get messages for a chat
router.get('/:chatId/messages', async (req, res, next) => {
  try {
    // BOLA check
    const chat = await chatRepository
      .findByIdAndParticipant(req.params.chatId, req.user.id)
    if (!chat) {
      return res.status(404).json({
        success: false,
        message: 'Chat not found',
        code:    'NOT_FOUND',
      })
    }

    const messages = await chatRepository
      .getMessages(req.params.chatId)

    res.status(200).json({
      success: true,
      data: { messages, count: messages.length }
    })
  } catch (err) {
    next(err)
  }
})

export default router