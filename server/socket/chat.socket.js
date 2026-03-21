import chatRepository from '../repositories/chat.repository.js'
import tokenService   from '../services/token.service.js'
import authRepository from '../repositories/auth.repository.js'

// Rate limiting per socket
const messageRateLimiter = new Map()

// ─────────────────────────────────────────────────────────────
// SOCKET.IO CHAT HANDLER
// ─────────────────────────────────────────────────────────────
export function registerChatHandlers(io) {

  // ── Authenticate every socket connection ──────────────────
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth.token

      if (!token) {
        return next(new Error('Authentication required'))
      }

      // Verify JWT
      let decoded
      try {
        decoded = tokenService.verifyToken(token)
      } catch {
        return next(new Error('Invalid token'))
      }

      // Check blocklist
      const isRevoked = await tokenService.isTokenRevoked(decoded.jti)
      if (isRevoked) return next(new Error('Token revoked'))

      // Get user
      const user = await authRepository.findById(decoded.userId)
      if (!user || !user.isActive) {
        return next(new Error('User not found'))
      }

      // Attach user to socket
      socket.userId   = user._id.toString()
      socket.userRole = user.role
      socket.userName = user.name

      next()
    } catch (err) {
      next(new Error('Authentication failed'))
    }
  })

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId}`)

    // Join personal room — for direct notifications
    socket.join(`user_${socket.userId}`)

    // ── Join chat room ───────────────────────────────────────
    socket.on('join_chat', async (chatId) => {
      try {
        // BOLA check — must be participant (VULN-009)
        const chat = await chatRepository
          .findByIdAndParticipant(chatId, socket.userId)

        if (!chat) {
          socket.emit('error', {
            message: 'Access denied to this chat',
            code:    'FORBIDDEN',
          })
          return
        }

        socket.join(`chat_${chatId}`)

        // Clear unread count for this user
        await chatRepository.clearUnread(chatId, socket.userId)

        // Send recent messages
        const messages = await chatRepository.getMessages(chatId)
        socket.emit('chat_history', { chatId, messages })

        console.log(`👥 ${socket.userName} joined chat ${chatId}`)
      } catch (err) {
        socket.emit('error', { message: 'Failed to join chat' })
      }
    })

    // ── Send message ─────────────────────────────────────────
    socket.on('send_message', async (data) => {
      try {
        const { chatId, content, type = 'text', metadata } = data

        // Rate limiting — max 2 messages per second (VULN-009)
        const now  = Date.now()
        const last = messageRateLimiter.get(socket.userId) || 0
        if (now - last < 500) {
          socket.emit('error', {
            message: 'Sending too fast. Please slow down.',
            code:    'RATE_LIMIT',
          })
          return
        }
        messageRateLimiter.set(socket.userId, now)

        // BOLA check
        const chat = await chatRepository
          .findByIdAndParticipant(chatId, socket.userId)
        if (!chat) {
          socket.emit('error', { message: 'Access denied', code: 'FORBIDDEN' })
          return
        }

        // Validate content
        if (!content?.trim() && type === 'text') {
          socket.emit('error', { message: 'Message cannot be empty' })
          return
        }

        // Save message using bucket pattern
        const message = await chatRepository.addMessage(chatId, {
          senderId:  socket.userId,
          type,
          content:   content?.trim(),
          metadata:  metadata || null,
          isRead:    false,
          createdAt: new Date(),
        })

        // Update chat last message
        await chatRepository.updateLastMessage(
          chatId,
          content?.substring(0, 100),
          socket.userId
        )

        // Increment unread for OTHER participants
        for (const participantId of chat.participants) {
          if (participantId.toString() !== socket.userId) {
            await chatRepository.incrementUnread(
              chatId, participantId.toString()
            )
          }
        }

        // Broadcast to everyone in chat room
        io.to(`chat_${chatId}`).emit('new_message', {
          chatId,
          message: {
            ...message,
            senderId:   socket.userId,
            senderName: socket.userName,
          },
        })

      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' })
      }
    })

    // ── Typing indicator ─────────────────────────────────────
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        chatId,
        userId:   socket.userId,
        userName: socket.userName,
        isTyping,
      })
    })

    // ── Mark messages as read ────────────────────────────────
    socket.on('mark_read', async ({ chatId }) => {
      try {
        await chatRepository.clearUnread(chatId, socket.userId)
        socket.to(`chat_${chatId}`).emit('messages_read', {
          chatId,
          readBy: socket.userId,
          readAt: new Date(),
        })
      } catch (err) {
        console.error('mark_read error:', err)
      }
    })

    // ── Leave chat ───────────────────────────────────────────
    socket.on('leave_chat', ({ chatId }) => {
      socket.leave(`chat_${chatId}`)
    })

    // ── Disconnect ───────────────────────────────────────────
    socket.on('disconnect', () => {
      messageRateLimiter.delete(socket.userId)
      console.log(`🔌 Socket disconnected: ${socket.userId}`)
    })
  })
}