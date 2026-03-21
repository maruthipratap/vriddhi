export default function AdminDashboard() {
  return (
    <div className="pb-20">
      <div className="bg-dark px-4 py-4">
        <h2 className="text-gold font-bold text-lg">⚙️ Admin Dashboard</h2>
        <p className="text-gray-400 text-sm">Platform management</p>
      </div>
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Total Users',    value: '—', icon: '👥', color: 'bg-blue-50'   },
            { label: 'Total Shops',    value: '—', icon: '🏪', color: 'bg-green-50'  },
            { label: 'Total Orders',   value: '—', icon: '📦', color: 'bg-yellow-50' },
            { label: 'Pending Verify', value: '—', icon: '⏳', color: 'bg-red-50'    },
          ].map((stat, i) => (
            <div key={i} className={`${stat.color} rounded-2xl p-4`}>
              <p className="text-3xl mb-2">{stat.icon}</p>
              <p className="text-2xl font-bold text-dark">{stat.value}</p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 card">
          <p className="text-gray-400 text-sm text-center py-4">
            Admin features coming soon
          </p>
        </div>
      </div>
    </div>
  )
}