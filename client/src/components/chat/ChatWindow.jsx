import { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch }    from 'react-redux'
import { addMessage, setMessages }     from '../../store/slices/chatSlice.js'
import MessageBubble                   from './MessageBubble.jsx'
import api                             from '../../services/api.js'

export default function ChatWindow({ chatId }) {
  const dispatch    = useDispatch()
  const user        = useSelector(s => s.auth.user)
  const accessToken = useSelector(s => s.auth.accessToken)
  const messages    = useSelector(s => s.chat.messages[chatId] || [])
  const [text, setText]     = useState('')
  const [socket, setSocket] = useState(null)
  const bottomRef           = useRef(null)

  useEffect(() => {
    // Load history
    api.get(`/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    }).then(res => {
      dispatch(setMessages({ chatId, messages: res.data.data.messages }))
    })

    // Connect socket
    import('socket.io-client').then(({ io }) => {
      const s = io(
        import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
        { auth: { token: accessToken } }
      )
      s.emit('join_chat', chatId)
      s.on('new_message', ({ message }) => {
        dispatch(addMessage({ chatId, message }))
      })
      s.on('chat_history', ({ messages: hist }) => {
        dispatch(setMessages({ chatId, messages: hist }))
      })
      setSocket(s)
    })

    return () => socket?.disconnect()
  }, [chatId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = () => {
    if (!text.trim()) return
    socket?.emit('send_message', {
      chatId, content: text.trim(), type: 'text'
    })
    setText('')
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-1">
        {messages.map((msg, i) => (
          <MessageBubble
            key={i}
            message={msg}
            isMe={msg.senderId === user?._id || msg.senderId === user?.id}
          />
        ))}
        <div ref={bottomRef}/>
      </div>

      {/* Input */}
      <div className="border-t bg-white px-4 py-3 flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="Type a message..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          className="w-11 h-11 bg-forest rounded-xl flex items-center
                     justify-center text-white text-lg"
        >
          ➤
        </button>
      </div>
    </div>
  )
}