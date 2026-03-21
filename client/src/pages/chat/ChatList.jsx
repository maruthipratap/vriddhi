import { useEffect, useState }     from 'react'
import { Link }                    from 'react-router-dom'
import { useSelector }             from 'react-redux'
import api                         from '../../services/api.js'

export default function ChatList() {
  const accessToken = useSelector(s => s.auth.accessToken)
  const [chats, setChats]       = useState([])
  const [isLoading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/chats', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })
    .then(res => setChats(res.data.data.chats))
    .catch(console.error)
    .finally(() => setLoading(false))
  }, [])

  return (
    <div className="pb-20">
      <div className="bg-forest px-4 py-4">
        <h2 className="text-white font-bold text-lg">Messages 💬</h2>
      </div>

      <div className="px-4 mt-4">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-forest
                            border-t-transparent rounded-full animate-spin"/>
          </div>
        ) : chats.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-3">💬</div>
            <p className="text-gray-500">No conversations yet</p>
            <p className="text-gray-400 text-sm mt-1">
              Visit a shop and start chatting!
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map(chat => (
              <Link
                key={chat._id}
                to={`/chats/${chat._id}`}
                className="card flex items-center gap-3 hover:border-forest
                           transition-all"
              >
                <div className="w-12 h-12 bg-green-100 rounded-full flex
                                items-center justify-center text-2xl">
                  🏪
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-dark text-sm">
                    Shop Chat
                  </p>
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {chat.lastMessage || 'No messages yet'}
                  </p>
                </div>
                {chat.lastMessageAt && (
                  <p className="text-xs text-gray-400">
                    {new Date(chat.lastMessageAt).toLocaleDateString('en-IN')}
                  </p>
                )}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}