import { Server } from 'socket.io'
import { registerChatHandlers } from '../socket/chat.socket.js'

export function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin:      ['http://localhost:5173', 'https://vriddhi.in'],
      credentials: true,
    },
    pingTimeout:  60000,
    pingInterval: 25000,
  })

  registerChatHandlers(io)

  return io
}