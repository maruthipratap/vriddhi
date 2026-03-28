import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../../services/api.js'
import chatService from '../../services/chat.service.js'
import ChatWindow from '../chat/ChatWindow.jsx'
import IconGlyph from './IconGlyph.jsx'

const SUGGESTED = [
  'What crop suits this season?',
  'What should I spray before rain?',
  'Show me government scheme options',
]

export default function FloatingSupportWidget() {
  const location = useLocation()
  const navigate = useNavigate()
  const accessToken = useSelector((state) => state.auth.accessToken)
  const user = useSelector((state) => state.auth.user)

  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState('ai')
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ask about crops, sprays, schemes, mandi rates, or nearby buying decisions.',
    },
  ])
  const [input, setInput] = useState('')
  const [isSending, setSending] = useState(false)
  const [chats, setChats] = useState([])
  const [loadingChats, setLoadingChats] = useState(false)
  const [selectedChatId, setSelectedChatId] = useState('')

  const hideWidget = useMemo(() => (
    ['/auth', '/select-role'].includes(location.pathname) ||
    location.pathname.startsWith('/chats/') ||
    location.pathname === '/ai/chat'
  ), [location.pathname])

  useEffect(() => {
    if (!open || !accessToken || tab !== 'chats') return

    let cancelled = false
    setLoadingChats(true)
    chatService.getMyChats(accessToken)
      .then((items) => {
        if (!cancelled) {
          setChats(items)
          if (!selectedChatId && items[0]?._id) {
            setSelectedChatId(items[0]._id)
          }
        }
      })
      .catch(() => {
        if (!cancelled) setChats([])
      })
      .finally(() => {
        if (!cancelled) setLoadingChats(false)
      })

    return () => {
      cancelled = true
    }
  }, [open, accessToken, tab, selectedChatId])

  if (hideWidget) return null

  const sendAiMessage = async (text) => {
    const content = (text || input).trim()
    if (!content) return

    if (!accessToken) {
      navigate('/auth?mode=register')
      return
    }

    const nextMessages = [...messages, { role: 'user', content }]
    setMessages(nextMessages)
    setInput('')
    setSending(true)

    try {
      const res = await api.post(
        '/ai/chat',
        {
          message: content,
          language: user?.language || 'en',
          state: user?.state,
          district: user?.district,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      )

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: res.data?.data?.reply || 'I could not generate a reply right now.',
        },
      ])
    } catch {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: 'The assistant is unavailable right now. Please try again in a moment.',
        },
      ])
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-[70] pointer-events-none md:pointer-events-none">
          <div className="absolute inset-0 bg-black/20 md:hidden pointer-events-auto" onClick={() => setOpen(false)} />
        </div>
      )}

      <div className="fixed z-[80] bottom-20 md:bottom-6 right-4 md:right-6 flex flex-col items-end gap-3">
        {open && (
          <div className="panel pointer-events-auto w-[calc(100vw-2rem)] md:w-[390px] h-[70vh] md:h-[620px] overflow-hidden shadow-2xl">
            <div className="hero-surface rounded-none border-0 shadow-none">
              <div className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="section-kicker text-white/70">Quick Help</p>
                    <h3 className="font-heading text-xl font-bold text-white mt-1">
                      Chat with Vriddhi
                    </h3>
                    <p className="text-sm text-white/75 mt-1">
                      AI guidance plus your shop conversations in one floating panel.
                    </p>
                  </div>
                  <button onClick={() => setOpen(false)} className="btn-ghost text-white hover:bg-white/10">
                    <IconGlyph name="close" size={18} />
                  </button>
                </div>

                <div className="mt-4 flex gap-2 rounded-full bg-white/10 p-1">
                  {[
                    { id: 'ai', label: 'AI Assistant', icon: 'bot' },
                    { id: 'chats', label: 'Shop Chats', icon: 'messageSquare' },
                  ].map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setTab(item.id)}
                      className={`flex-1 inline-flex items-center justify-center gap-2 rounded-full px-3 py-2 text-sm font-medium transition-colors ${
                        tab === item.id
                          ? 'bg-white text-primary'
                          : 'text-white/80 hover:bg-white/10'
                      }`}
                    >
                      <IconGlyph name={item.icon} size={16} />
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-background h-[calc(100%-176px)] md:h-[calc(100%-180px)]">
              {tab === 'ai' ? (
                <div className="flex flex-col h-full">
                  <div className="px-4 pt-4 pb-3 flex flex-wrap gap-2 border-b border-border">
                    {SUGGESTED.map((question) => (
                      <button
                        key={question}
                        onClick={() => sendAiMessage(question)}
                        className="rounded-full border border-border bg-white px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-primary/30"
                      >
                        {question}
                      </button>
                    ))}
                  </div>

                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                    {messages.map((message, index) => (
                      <div
                        key={`${message.role}-${index}`}
                        className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                          message.role === 'user'
                            ? 'bg-primary text-primary-foreground rounded-br-sm'
                            : 'bg-white border border-border text-foreground rounded-bl-sm shadow-sm'
                        }`}>
                          {message.content}
                        </div>
                      </div>
                    ))}
                    {isSending && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-border rounded-2xl rounded-bl-sm px-4 py-3 text-sm text-muted-foreground">
                          Thinking...
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="border-t border-border p-4">
                    <div className="flex gap-2">
                      <textarea
                        rows={1}
                        className="input flex-1 resize-none min-h-[46px] max-h-28 py-3"
                        placeholder={accessToken ? 'Ask about crops, sprays, schemes...' : 'Sign in to use the AI assistant'}
                        value={input}
                        disabled={isSending}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            sendAiMessage()
                          }
                        }}
                      />
                      <button
                        onClick={() => sendAiMessage()}
                        disabled={isSending || !input.trim()}
                        className="w-11 h-11 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-50"
                      >
                        <IconGlyph name="arrowRight" size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ) : !accessToken ? (
                <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                  <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <IconGlyph name="messageSquare" size={26} />
                  </span>
                  <h4 className="font-heading text-xl font-bold text-foreground">Sign in for shop chat</h4>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                    Open conversations with nearby shops and continue them from any page.
                  </p>
                  <button onClick={() => navigate('/auth')} className="btn-primary mt-5">
                    Open Login
                  </button>
                </div>
              ) : selectedChatId ? (
                <div className="h-full flex flex-col">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-foreground">Active conversation</p>
                      <p className="text-xs text-muted-foreground">Continue chatting without leaving the page.</p>
                    </div>
                    <button onClick={() => navigate(`/chats/${selectedChatId}`)} className="btn-outline px-3 py-2 text-xs">
                      Full View
                    </button>
                  </div>
                  <div className="grid grid-cols-[138px_minmax(0,1fr)] flex-1 min-h-0">
                    <div className="border-r border-border bg-white/70 overflow-y-auto p-2 space-y-1">
                      {loadingChats ? (
                        <div className="p-3 text-xs text-muted-foreground">Loading chats...</div>
                      ) : chats.map((chat) => (
                        <button
                          key={chat._id}
                          onClick={() => setSelectedChatId(chat._id)}
                          className={`w-full text-left rounded-2xl px-3 py-3 transition-colors ${
                            selectedChatId === chat._id
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-secondary text-foreground'
                          }`}
                        >
                          <p className="text-xs font-semibold">Shop Chat</p>
                          <p className={`mt-1 text-[11px] line-clamp-2 ${
                            selectedChatId === chat._id ? 'text-white/75' : 'text-muted-foreground'
                          }`}>
                            {chat.lastMessage || 'No messages yet'}
                          </p>
                        </button>
                      ))}
                    </div>
                    <div className="min-h-0">
                      <ChatWindow chatId={selectedChatId} />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center px-6 text-center">
                  <span className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <IconGlyph name="store" size={26} />
                  </span>
                  <h4 className="font-heading text-xl font-bold text-foreground">No conversations yet</h4>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                    Start by browsing shops and opening a chat from a product or order flow.
                  </p>
                  <button onClick={() => navigate('/browse')} className="btn-primary mt-5">
                    Browse Shops
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        <button
          onClick={() => setOpen((value) => !value)}
          className="pointer-events-auto rounded-2xl bg-primary text-primary-foreground shadow-xl shadow-[hsl(var(--primary)/0.32)] px-4 py-3 md:px-5 md:py-3 inline-flex items-center gap-3 hover:-translate-y-0.5 transition-all"
        >
          <span className="w-10 h-10 rounded-2xl bg-white/12 flex items-center justify-center">
            <IconGlyph name={open ? 'close' : 'messageSquare'} size={20} />
          </span>
          <span className="hidden sm:block text-left">
            <span className="block text-xs uppercase tracking-[0.18em] text-white/65">Support</span>
            <span className="block text-sm font-semibold">{open ? 'Close assistant' : 'Chat with Vriddhi'}</span>
          </span>
        </button>
      </div>
    </>
  )
}
