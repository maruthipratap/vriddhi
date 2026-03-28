import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { getVerificationShops, updateVerificationStatus } from '../../services/admin.service.js'

const filters = ['pending', 'verified', 'rejected', 'suspended', 'all']

export default function Verifications() {
  const accessToken = useSelector((state) => state.auth.accessToken)
  const [activeFilter, setActiveFilter] = useState('pending')
  const [shops, setShops] = useState([])
  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionState, setActionState] = useState({})
  const loadedFilters = useRef(new Set())

  useEffect(() => {
    if (!accessToken || loadedFilters.current.has(activeFilter)) return
    loadedFilters.current.add(activeFilter)

    let cancelled = false

    async function load() {
      setLoading(true)
      setError('')
      try {
        const result = await getVerificationShops(accessToken, activeFilter)
        if (!cancelled) setShops(result)
      } catch (err) {
        if (!cancelled) {
          if (err.response?.status === 404) {
            setError('Your deployed backend does not have the new admin verification routes yet. Redeploy the server to enable this page.')
          } else {
            setError(err.response?.data?.message || 'Failed to load shop verifications')
          }
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [accessToken, activeFilter])

  async function handleAction(shopId, status) {
    const note = window.prompt(
      status === 'verified'
        ? 'Add an optional note for this approval:'
        : `Add a reason for marking this shop as ${status}:`,
      ''
    )

    setActionState((current) => ({ ...current, [shopId]: status }))
    setError('')

    try {
      const updated = await updateVerificationStatus(accessToken, shopId, { status, note: note || '' })
      setShops((current) =>
        current
          .map((shop) => (shop._id === shopId ? { ...shop, ...updated } : shop))
          .filter((shop) => activeFilter === 'all' || shop.verificationStatus === activeFilter)
      )
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update verification status')
    } finally {
      setActionState((current) => ({ ...current, [shopId]: '' }))
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-header rounded-b-[2rem] shadow-sm">
        <p className="section-kicker text-white/70">Trust &amp; Safety</p>
        <h1 className="mt-2 text-2xl font-heading font-bold text-white">Shop Verifications</h1>
        <p className="mt-2 text-sm text-white/75">
          Review onboarding details, approve genuine sellers, and reject weak submissions.
        </p>
      </div>

      <div className="section-container mt-6 space-y-5">
        <div className="flex flex-wrap gap-2">
          {filters.map((filter) => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                activeFilter === filter
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border bg-white text-muted-foreground hover:text-foreground'
              }`}
            >
              {filter[0].toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        {error && (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : shops.length === 0 ? (
          <div className="panel p-8 text-center text-muted-foreground">
            No shops found for the current filter.
          </div>
        ) : (
          <div className="space-y-4">
            {shops.map((shop) => (
              <div key={shop._id} className="panel p-5">
                <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <h2 className="text-xl font-heading text-foreground">{shop.shopName}</h2>
                      <span className={`badge ${
                        shop.verificationStatus === 'verified'
                          ? 'bg-green-100 text-green-700'
                          : shop.verificationStatus === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : shop.verificationStatus === 'suspended'
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-secondary text-primary'
                      }`}>
                        {shop.verificationStatus}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Owner: {shop.owner?.name || 'Unknown'} - {shop.owner?.email || 'No email'} - {shop.owner?.phone || 'No phone'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {shop.address?.village || shop.address?.street || 'Address unavailable'}, {shop.address?.district || 'District'}, {shop.address?.state || 'State'}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {(shop.categories || []).map((category) => (
                        <span key={category} className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-primary">
                          {category.replace('_', ' ')}
                        </span>
                      ))}
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-2xl border border-border p-3">
                        <p className="text-xs text-muted-foreground">License</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{shop.licenseNumber || 'Not provided'}</p>
                      </div>
                      <div className="rounded-2xl border border-border p-3">
                        <p className="text-xs text-muted-foreground">GST</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{shop.gstNumber || 'Not provided'}</p>
                      </div>
                      <div className="rounded-2xl border border-border p-3">
                        <p className="text-xs text-muted-foreground">Orders</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{shop.totalOrders || 0}</p>
                      </div>
                      <div className="rounded-2xl border border-border p-3">
                        <p className="text-xs text-muted-foreground">Rating</p>
                        <p className="mt-1 text-sm font-medium text-foreground">{shop.rating || 0}</p>
                      </div>
                    </div>
                    {shop.verificationNote && (
                      <div className="rounded-2xl bg-secondary p-3 text-sm text-foreground">
                        <span className="font-medium">Last note:</span> {shop.verificationNote}
                      </div>
                    )}
                  </div>

                  <div className="flex min-w-[220px] flex-col gap-3">
                    <button
                      onClick={() => handleAction(shop._id, 'verified')}
                      disabled={!!actionState[shop._id]}
                      className="btn-primary justify-center"
                    >
                      {actionState[shop._id] === 'verified' ? 'Approving...' : 'Approve'}
                    </button>
                    <button
                      onClick={() => handleAction(shop._id, 'rejected')}
                      disabled={!!actionState[shop._id]}
                      className="btn-outline justify-center border-red-200 text-red-700 hover:bg-red-50"
                    >
                      {actionState[shop._id] === 'rejected' ? 'Rejecting...' : 'Reject'}
                    </button>
                    <button
                      onClick={() => handleAction(shop._id, 'suspended')}
                      disabled={!!actionState[shop._id]}
                      className="btn-outline justify-center border-amber-200 text-amber-700 hover:bg-amber-50"
                    >
                      {actionState[shop._id] === 'suspended' ? 'Updating...' : 'Suspend'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
