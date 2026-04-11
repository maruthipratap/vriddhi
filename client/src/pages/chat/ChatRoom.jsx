import { useEffect, useRef, useState, useCallback } from 'react'
import { useParams }                                  from 'react-router-dom'
import { useSelector, useDispatch }                   from 'react-redux'
import { setMessages, addMessage }                    from '../../store/slices/chatSlice.js'
import IconGlyph                                      from '../../components/common/IconGlyph.jsx'
import api                                            from '../../services/api.js'

const TYPING_DEBOUNCE_MS = 1500   // emit stop_typing after this long idle

export default function ChatRoom() {
  const { chatId }   = useParams()
  const dispatch     = useDispatch()
  const messages     = useSelector((s) => s.chat.messages[chatId] || [])
  const user         = useSelector((s) => s.auth.user)
  const accessToken  = useSelector((s) => s.auth.accessToken)

  const [text,      setText]      = useState('')
  const [isTyping,  setIsTyping]  = useState(false)  // other person typing
  const bottomRef                 = useRef(null)
  const socketRef                 = useRef(null)
  const typingTimer               = useRef(null)

  // ── Socket setup ──────────────────────────────────────────────
  useEffect(() => {
    // Load chat history via REST (no duplicate auth header — interceptor handles it)
    api.get(`/chats/${chatId}/messages`)
      .then(res => dispatch(setMessages({ chatId, messages: res.data.data.messages })))
      .catch(console.error)

    import('socket.io-client').then(({ io }) => {
      const socket = io(
        import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
        { auth: { token: accessToken } }
      )
      socketRef.current = socket

      socket.emit('join_chat', chatId)

      socket.on('new_message', ({ message }) => {
        dispatch(addMessage({ chatId, message }))
      })

      socket.on('chat_history', ({ messages: history }) => {
        dispatch(setMessages({ chatId, messages: history }))
      })

      // Typing indicators from other participant
      socket.on('typing',      () => setIsTyping(true))
      socket.on('stop_typing', () => setIsTyping(false))
    })

    return () => {
      clearTimeout(typingTimer.current)
      socketRef.current?.disconnect()
    }
  }, [accessToken, chatId, dispatch])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  // ── Typing emit helpers ───────────────────────────────────────
  const emitTyping = useCallback(() => {
    socketRef.current?.emit('typing', { chatId })
    clearTimeout(typingTimer.current)
    typingTimer.current = setTimeout(() => {
      socketRef.current?.emit('stop_typing', { chatId })
    }, TYPING_DEBOUNCE_MS)
  }, [chatId])

  const handleTextChange = (e) => {
    setText(e.target.value)
    if (e.target.value.trim()) emitTyping()
  }

  // ── Send message ──────────────────────────────────────────────
  const sendMessage = () => {
    if (!text.trim()) return
    clearTimeout(typingTimer.current)
    socketRef.current?.emit('stop_typing', { chatId })
    socketRef.current?.emit('send_message', { chatId, content: text.trim(), type: 'text' })
    setText('')
  }

  return (
    <div className="flex h-screen flex-col bg-muted/30">
      {/* Header */}
      <div className="page-header flex items-center gap-3 rounded-none px-4 py-4 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <IconGlyph name="store" size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Shop Chat</p>
          <p className="text-xs text-white/70">
            {isTyping ? 'Typing…' : 'Online'}
          </p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-3 overflow-y-auto bg-muted/20 px-4 py-4 pb-24">
        {messages.length === 0 && (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Start the conversation.</p>
          </div>
        )}

        {messages.map((msg, index) => {
          const isMe = msg.senderId === user?._id || msg.senderId === user?.id
          return (
            <div key={index} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs rounded-2xl px-4 py-2 text-sm ${
                isMe
                  ? 'rounded-br-sm bg-primary text-white'
                  : 'rounded-bl-sm bg-white text-foreground shadow-sm'
              }`}>
                {msg.content}
                <p className={`mt-1 text-xs ${isMe ? 'text-white/70' : 'text-muted-foreground'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}

        {/* Typing bubble */}
        {isTyping && (
          <div className="flex justify-start">
            <div className="rounded-2xl rounded-bl-sm bg-white px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                {[0, 150, 300].map(delay => (
                  <span
                    key={delay}
                    className="h-2 w-2 rounded-full bg-muted-foreground/50 animate-bounce"
                    style={{ animationDelay: `${delay}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 flex gap-2 border-t bg-white px-4 py-3 md:bottom-4 md:left-[calc(18rem+1rem)] md:right-6 md:rounded-2xl md:border md:shadow-lg">
        <input
          className="input flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={handleTextChange}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white"
        >
          <IconGlyph name="arrowRight" size={18} />
        </button>
      </div>
    </div>
  )
}
