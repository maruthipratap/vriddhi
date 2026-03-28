import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { setMessages, addMessage } from '../../store/slices/chatSlice.js'
import IconGlyph from '../../components/common/IconGlyph.jsx'
import api from '../../services/api.js'

export default function ChatRoom() {
  const { chatId } = useParams()
  const dispatch = useDispatch()
  const accessToken = useSelector((s) => s.auth.accessToken)
  const messages = useSelector((s) => s.chat.messages[chatId] || [])
  const user = useSelector((s) => s.auth.user)
  const [text, setText] = useState('')
  const bottomRef = useRef(null)
  const socketInstance = useRef(null)

  useEffect(() => {
    api.get(`/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    }).then((res) => {
      dispatch(setMessages({ chatId, messages: res.data.data.messages }))
    }).catch(console.error)

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

      socket.on('chat_history', ({ messages: history }) => {
        dispatch(setMessages({ chatId, messages: history }))
      })
    })

    return () => socketInstance.current?.disconnect()
  }, [accessToken, chatId, dispatch])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!text.trim()) return
    socketInstance.current?.emit('send_message', {
      chatId,
      content: text.trim(),
      type: 'text',
    })
    setText('')
  }

  return (
    <div className="flex h-screen flex-col bg-muted/30">
      <div className="page-header flex items-center gap-3 rounded-none px-4 py-4 shadow-sm">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <IconGlyph name="store" size={18} />
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Shop Chat</p>
          <p className="text-xs text-white/70">Online</p>
        </div>
      </div>

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
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-16 left-0 right-0 flex gap-2 border-t bg-white px-4 py-3 md:bottom-4 md:left-[calc(18rem+1rem)] md:right-6 md:rounded-2xl md:border md:shadow-lg">
        <input
          className="input flex-1"
          placeholder="Type a message..."
          value={text}
          onChange={(e) => setText(e.target.value)}
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
