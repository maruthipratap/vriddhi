import { Server } from 'socket.io'
import { registerChatHandlers } from '../socket/chat.socket.js'

// ── Singleton io reference ────────────────────────────────────
// Import getIO() anywhere in the server to emit without prop-drilling
let _io = null

export function getIO() {
  return _io
}

export function initSocket(httpServer) {
  _io = new Server(httpServer, {
    cors: {
      origin:      ['http://localhost:5173', 'https://vriddhi.in'],
      credentials: true,
    },
    pingTimeout:  60000,
    pingInterval: 25000,
  })

  registerChatHandlers(_io)

  return _io
}
