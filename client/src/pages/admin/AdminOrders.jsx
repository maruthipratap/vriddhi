import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { getAllOrders } from '../../services/admin.service.js'

function formatCurrency(paise) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format((paise || 0) / 100)
}

export default function AdminOrders() {
  const accessToken = useSelector((state) => state.auth.accessToken)
  const [orders, setOrders] = useState([])
  const [pagination, setPagination] = useState(null)
  
  const [statusFilter, setStatusFilter] = useState('')
  const [page, setPage] = useState(1)

  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadData = async (currentPage = 1) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: currentPage, limit: 15 }
      if (statusFilter) params.status = statusFilter

      const result = await getAllOrders(accessToken, params)
      setOrders(result.orders)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load system orders')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!accessToken) return
    loadData(page)
  }, [accessToken, page, statusFilter])

  return (
    <div className="dashboard-page">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Global View</p>
        <h1 className="mt-2 text-2xl font-heading font-bold text-white">System Orders</h1>
        <p className="mt-2 text-sm text-white/75">
          View all transactions happening across the entire marketplace.
        </p>
      </div>

      <div className="section-container mt-6 space-y-5">
        <div className="panel p-4 flex gap-4 items-center">
          <select className="input max-w-xs" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="out_for_delivery">Out for Delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {error && (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
        )}

        {isLoading && orders.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-muted-foreground">
                <thead className="bg-secondary text-xs uppercase text-foreground">
                  <tr>
                    <th className="px-6 py-4">Order ID</th>
                    <th className="px-6 py-4">Farmer</th>
                    <th className="px-6 py-4">Shop</th>
                    <th className="px-6 py-4">Amount</th>
                    <th className="px-6 py-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">No orders found.</td>
                    </tr>
                  ) : orders.map(order => (
                    <tr key={order._id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">{order.orderNumber}</td>
                      <td className="px-6 py-4">
                        <p>{order.farmerId?.name}</p>
                        <p className="text-xs">{order.farmerId?.phone}</p>
                      </td>
                      <td className="px-6 py-4 font-semibold text-primary">{order.shopId?.shopName}</td>
                      <td className="px-6 py-4">{formatCurrency(order.pricing.total)}</td>
                      <td className="px-6 py-4">
                        <span className="badge capitalize bg-secondary text-foreground border border-border">
                          {order.status.replace('_', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing page <span className="font-medium text-foreground">{pagination.page}</span> of <span className="font-medium text-foreground">{pagination.pages}</span>
                </p>
                <div className="flex gap-2">
                  <button 
                    disabled={page === 1} 
                    onClick={() => setPage(p => p - 1)}
                    className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
                  >Previous</button>
                  <button 
                    disabled={page === pagination.pages} 
                    onClick={() => setPage(p => p + 1)}
                    className="btn-outline px-3 py-1 text-sm disabled:opacity-50"
                  >Next</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
