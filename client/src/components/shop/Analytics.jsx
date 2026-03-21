export default function Analytics({ orders = [] }) {
  const totalRevenue = orders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.pricing?.total || 0), 0)

  const todayOrders = orders.filter(o => {
    const today = new Date()
    const orderDate = new Date(o.createdAt)
    return orderDate.toDateString() === today.toDateString()
  })

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1
    return acc
  }, {})

  const stats = [
    {
      label: 'Total Revenue',
      value: `₹${(totalRevenue / 100).toFixed(0)}`,
      icon:  '💰',
      color: 'bg-green-50 text-green-700',
    },
    {
      label: "Today's Orders",
      value: todayOrders.length,
      icon:  '📦',
      color: 'bg-blue-50 text-blue-700',
    },
    {
      label: 'Total Orders',
      value: orders.length,
      icon:  '📋',
      color: 'bg-purple-50 text-purple-700',
    },
    {
      label: 'Pending',
      value: statusCounts.pending || 0,
      icon:  '⏳',
      color: 'bg-yellow-50 text-yellow-700',
    },
  ]

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 mb-4">
        {stats.map((stat, i) => (
          <div key={i} className={`${stat.color} rounded-2xl p-4`}>
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-xs opacity-75 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Status breakdown */}
      {Object.keys(statusCounts).length > 0 && (
        <div className="card">
          <p className="font-bold text-dark mb-3 text-sm">Order Status</p>
          <div className="space-y-2">
            {Object.entries(statusCounts).map(([status, count]) => (
              <div key={status}
                className="flex items-center justify-between text-sm">
                <span className="capitalize text-gray-600">
                  {status.replace('_', ' ')}
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-20 bg-gray-100 rounded-full h-2">
                    <div
                      className="bg-forest h-2 rounded-full"
                      style={{ width: `${(count / orders.length) * 100}%` }}
                    />
                  </div>
                  <span className="font-bold text-dark w-4 text-right">
                    {count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}