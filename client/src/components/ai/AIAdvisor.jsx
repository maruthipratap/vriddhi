import { useState }    from 'react'
import { useSelector } from 'react-redux'
import api             from '../../services/api.js'

export default function AIAdvisor() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const user        = useSelector(s => s.auth.user)
  const [message, setMessage] = useState('')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Namaste ${user?.name?.split(' ')[0] || 'Farmer'}! 🌾 I am Vriddhi AI. Ask me anything about farming — crop selection, disease treatment, fertilizers, or government schemes!`
    }
  ])
  const [isLoading, setLoading] = useState(false)

  const send = async () => {
    if (!message.trim()) return

    const userMsg = { role: 'user', content: message }
    setMessages(prev => [...prev, userMsg])
    setMessage('')
    setLoading(true)

    try {
      const res = await api.post('/ai/chat',
        { message, language: user?.language || 'en' },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.data.data.reply
      }])
    } catch {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I am having trouble right now. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-96 bg-gray-50 rounded-2xl overflow-hidden
                    border border-gray-200">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-xs px-4 py-2.5 rounded-2xl text-sm ${
              msg.role === 'user'
                ? 'bg-forest text-white rounded-br-sm'
                : 'bg-white text-dark shadow-sm rounded-bl-sm'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-2xl px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-forest rounded-full animate-bounce"
                     style={{ animationDelay: '0ms' }}/>
                <div className="w-2 h-2 bg-forest rounded-full animate-bounce"
                     style={{ animationDelay: '150ms' }}/>
                <div className="w-2 h-2 bg-forest rounded-full animate-bounce"
                     style={{ animationDelay: '300ms' }}/>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t bg-white p-3 flex gap-2">
        <input
          className="input flex-1 text-sm"
          placeholder="Ask about crops, diseases, schemes..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && send()}
        />
        <button
          onClick={send}
          disabled={isLoading}
          className="w-10 h-10 bg-forest rounded-xl flex items-center
                     justify-center text-white disabled:opacity-50"
        >
          ➤
        </button>
      </div>
    </div>
  )
}