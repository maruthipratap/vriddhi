import { useEffect, useRef, useState } from 'react'
import { useParams }                   from 'react-router-dom'
import { useSelector, useDispatch }    from 'react-redux'
import { setMessages, addMessage }     from '../../store/slices/chatSlice.js'
import api                             from '../../services/api.js'

export default function ChatRoom() {
  const { chatId }    = useParams()
  const dispatch      = useDispatch()
  const socketRef     = useSelector(s => s.chat.isConnected)
  const accessToken   = useSelector(s => s.auth.accessToken)
  const messages      = useSelector(s => s.chat.messages[chatId] || [])
  const user          = useSelector(s => s.auth.user)
  const [text, setText]     = useState('')
  const bottomRef           = useRef(null)
  const socketInstance      = useRef(null)

  useEffect(() => {
    // Load chat history
    api.get(`/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(res => {
      dispatch(setMessages({ chatId, messages: res.data.data.messages }))
    }).catch(console.error)

    // Connect socket
    import('socket.io-client').then(({ io }) => {
      const socket = io(
        import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
        { auth: { token: accessToken } }
      )
      socketInstance.current = socket

      socket.emit('join_chat', chatId)

      socket.on('new_message', ({ message }) => {
        dispatch(addMessage({ chatId, message }))
      })

      socket.on('chat_history', ({ messages: hist }) => {
        dispatch(setMessages({ chatId, messages: hist }))
      })
    })

    return () => socketInstance.current?.disconnect()
  }, [chatId])

  // Scroll to bottom on new message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!text.trim()) return
    socketInstance.current?.emit('send_message', {
      chatId, content: text.trim(), type: 'text'
    })
    setText('')
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="bg-forest px-4 py-4 flex items-center gap-3">
        <div className="w-9 h-9 bg-gold rounded-full flex items-center
                        justify-center text-xl">
          🏪
        </div>
        <div>
          <p className="text-white font-semibold text-sm">Shop Chat</p>
          <p className="text-green-200 text-xs">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 space-y-3
                      bg-gray-50">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-400 text-sm">
              Start the conversation! 👋
            </p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMe = msg.senderId === user?._id ||
                       msg.senderId === user?.id
          return (
            <div key={i}
              className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs px-4 py-2 rounded-2xl text-sm
                              ${isMe
                                ? 'bg-forest text-white rounded-br-sm'
                                : 'bg-white text-dark shadow-sm rounded-bl-sm'
                              }`}>
                {msg.content}
                <p className={`text-xs mt-1 ${isMe ? 'text-green-200' : 'text-gray-400'}`}>
                  {new Date(msg.createdAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit', minute: '2-digit'
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="fixed bottom-16 left-0 right-0 bg-white border-t
                      px-4 py-3 flex gap-2">
        <input
          className="input flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
        />
        <button
          onClick={sendMessage}
          className="w-12 h-12 bg-forest rounded-xl flex items-center
                     justify-center text-white text-xl"
        >
          ➤
        </button>
      </div>
    </div>
  )
}