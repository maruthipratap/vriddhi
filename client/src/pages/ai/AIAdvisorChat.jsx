import { useState, useRef, useEffect } from 'react'
import { useSelector }                  from 'react-redux'
import { motion, AnimatePresence }      from 'framer-motion'

const SUGGESTED = [
  'What crops should I grow this kharif season?',
  'How to improve my soil health organically?',
  'Best fertilizer schedule for tomatoes?',
  'Pest control tips for cotton crops?',
  'When should I sow wheat in Telangana?',
  'How to identify nutrient deficiency in rice?',
]

export default function AIAdvisorChat() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const { user }    = useSelector(s => s.auth)

  const [messages,  setMessages]  = useState([])
  const [input,     setInput]     = useState('')
  const [isLoading, setLoading]   = useState(false)
  const bottomRef                 = useRef(null)
  const inputRef                  = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async (text) => {
    const content = text || input.trim()
    if (!content || isLoading) return

    const userMsg = { role: 'user', content }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Add empty assistant message to stream into
    setMessages(prev => [...prev, { role: 'assistant', content: '' }])

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/ai/chat`,
        {
          method: 'POST',
          headers: {
            'Content-Type':  'application/json',
            'Authorization': `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            message:  content,
            language: user?.language || 'en',
            history:  newMessages.slice(-6), // last 3 exchanges
          }),
        }
      )

      if (!res.ok) throw new Error('Failed')

      const data = await res.json()
      const reply = data?.data?.reply || data?.reply || 'Sorry, I could not process that.'

      // Simulate streaming by revealing text progressively
      let i = 0
      const interval = setInterval(() => {
        i += 3
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role:    'assistant',
            content: reply.slice(0, i),
          }
          return updated
        })
        if (i >= reply.length) {
          clearInterval(interval)
          setLoading(false)
        }
      }, 12)

    } catch {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role:    'assistant',
          content: 'Sorry, I could not process your request. Please try again.',
        }
        return updated
      })
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-screen md:h-[calc(100vh-0px)] pt-14 md:pt-0">
      {/* Header */}
      <div className="px-4 py-4 border-b border-border bg-secondary/30
                      flex items-center gap-3 flex-shrink-0">
        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center
                        justify-center text-xl">
          🤖
        </div>
        <div>
          <h1 className="font-heading text-lg font-bold text-foreground">
            AI Crop Advisor
          </h1>
          <p className="text-xs text-muted-foreground">
            Ask about crops, diseases, schemes, and more
          </p>
        </div>
        {messages.length > 0 && (
          <button
            onClick={() => setMessages([])}
            className="ml-auto text-xs text-muted-foreground
                       hover:text-foreground transition-colors px-2 py-1
                       border border-border rounded-lg"
          >
            Clear chat
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Empty state */}
        {messages.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="text-5xl mb-4 animate-float">🌾</div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">
              Namaste! How can I help? 👋
            </h2>
            <p className="text-muted-foreground text-sm mb-6">
              Ask me anything about farming
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
              {SUGGESTED.map(q => (
                <button
                  key={q}
                  onClick={() => sendMessage(q)}
                  className="text-xs text-left px-4 py-3 border border-border
                             rounded-xl hover:border-primary/40 hover:bg-secondary
                             transition-all text-muted-foreground hover:text-foreground"
                >
                  {q}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Message bubbles */}
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {/* Bot avatar */}
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-primary flex items-center
                                justify-center flex-shrink-0 mt-1">
                  <span className="text-primary-foreground text-sm">🤖</span>
                </div>
              )}

              {/* Bubble */}
              <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm
                              leading-relaxed ${
                                msg.role === 'user'
                                  ? 'bg-primary text-primary-foreground rounded-br-sm'
                                  : 'bg-card border border-border text-foreground rounded-bl-sm shadow-sm'
                              }`}>
                {msg.content || (
                  <div className="flex gap-1 py-1">
                    {[0, 150, 300].map(d => (
                      <div key={d}
                        className="w-2 h-2 bg-muted-foreground/50 rounded-full animate-bounce"
                        style={{ animationDelay: `${d}ms` }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* User avatar */}
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center
                                justify-center flex-shrink-0 mt-1">
                  <span className="text-sm font-bold text-foreground">
                    {user?.name?.[0]?.toUpperCase()}
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border bg-background px-4 py-3
                      pb-20 md:pb-3 flex-shrink-0">
        <div className="flex gap-2 max-w-3xl mx-auto">
          <textarea
            ref={inputRef}
            className="input flex-1 resize-none min-h-[44px] max-h-32 py-2.5"
            placeholder="Ask about crops, soil, pests, schemes..."
            rows={1}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                sendMessage()
              }
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={isLoading || !input.trim()}
            className="w-11 h-11 bg-primary rounded-xl flex items-center
                       justify-center text-primary-foreground flex-shrink-0
                       disabled:opacity-50 transition-all hover:opacity-90
                       active:scale-95"
          >
            ➤
          </button>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  )
}
