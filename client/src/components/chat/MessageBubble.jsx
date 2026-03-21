export default function MessageBubble({ message, isMe }) {
  const time = new Date(message.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit', minute: '2-digit'
  })

  if (message.type === 'product_card' && message.metadata?.product) {
    const p = message.metadata.product
    return (
      <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
        <div className="bg-white border border-gray-200 rounded-2xl p-3
                        max-w-xs shadow-sm">
          <p className="text-xs text-gray-500 mb-1">📦 Product shared</p>
          <p className="font-semibold text-dark text-sm">{p.name}</p>
          <p className="text-forest font-bold text-sm">
            ₹{(p.basePrice / 100).toFixed(0)}
          </p>
          <p className="text-xs text-gray-400 mt-1">{time}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`max-w-xs px-4 py-2.5 rounded-2xl ${
        isMe
          ? 'bg-forest text-white rounded-br-sm'
          : 'bg-white text-dark shadow-sm rounded-bl-sm border border-gray-100'
      }`}>
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={`text-xs mt-1 ${
          isMe ? 'text-green-200' : 'text-gray-400'
        }`}>
          {time} {isMe && (message.isRead ? '✓✓' : '✓')}
        </p>
      </div>
    </div>
  )
}