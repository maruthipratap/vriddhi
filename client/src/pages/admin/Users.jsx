import { useEffect, useRef, useState } from 'react'
import { useSelector } from 'react-redux'
import { getAllUsers, updateUserStatus } from '../../services/admin.service.js'
import IconGlyph from '../../components/common/IconGlyph.jsx'

export default function Users() {
  const accessToken = useSelector((state) => state.auth.accessToken)
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)

  const [isLoading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [actionState, setActionState] = useState({})

  const debounceRef = useRef(null)

  const loadData = async (currentPage = 1, currentSearch = search) => {
    setLoading(true)
    setError('')
    try {
      const params = { page: currentPage, limit: 20 }
      if (roleFilter) params.role = roleFilter
      if (statusFilter) params.status = statusFilter
      if (currentSearch) params.search = currentSearch

      const result = await getAllUsers(accessToken, params)
      setUsers(result.users)
      setPagination(result.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!accessToken) return
    loadData(page)
  }, [accessToken, page, roleFilter, statusFilter])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => {
      setPage(1)
      loadData(1, search)
    }, 400)
    return () => clearTimeout(debounceRef.current)
  }, [search])

  async function handleToggleStatus(userId, currentStatus) {
    if (!window.confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this user?`)) return

    setActionState(curr => ({ ...curr, [userId]: true }))
    try {
      const updatedUser = await updateUserStatus(accessToken, userId, !currentStatus)
      setUsers(curr => curr.map(u => u._id === userId ? updatedUser : u))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status')
    } finally {
      setActionState(curr => ({ ...curr, [userId]: false }))
    }
  }

  return (
    <div className="dashboard-page">
      <div className="page-header rounded-b-[2rem] shadow-sm flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="section-kicker text-white/70">Access Control</p>
          <h1 className="mt-2 text-2xl font-heading font-bold text-white">User Management</h1>
          <p className="mt-2 text-sm text-white/75">
            Monitor platform members, pause suspicious accounts, and govern the ecosystem.
          </p>
        </div>
      </div>

      <div className="section-container mt-6 space-y-5">
        <div className="panel p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <IconGlyph name="search" size={18} />
            </span>
            <input 
              type="text" 
              className="input pl-10" 
              placeholder="Search name, phone, or email..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex gap-3 w-full md:w-auto">
            <select className="input" value={roleFilter} onChange={e => { setRoleFilter(e.target.value); setPage(1) }}>
              <option value="">All Roles</option>
              <option value="farmer">Farmers</option>
              <option value="shop_owner">Shop Owners</option>
              <option value="agronomist">Agronomists</option>
              <option value="admin">Admins</option>
            </select>
            <select className="input" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setPage(1) }}>
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        {error && (
          <div className="card border-red-200 bg-red-50 text-sm text-red-700">{error}</div>
        )}

        {isLoading && users.length === 0 ? (
          <div className="flex justify-center py-12">
            <div className="h-10 w-10 rounded-full border-4 border-primary border-t-transparent animate-spin" />
          </div>
        ) : (
          <div className="panel overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-muted-foreground">
                <thead className="bg-secondary text-xs uppercase text-foreground">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Contact</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {users.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center">No users found.</td>
                    </tr>
                  ) : users.map(user => (
                    <tr key={user._id} className="hover:bg-secondary/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-semibold text-foreground">{user.name}</p>
                        <p className="text-xs">Joined {new Date(user.createdAt).toLocaleDateString()}</p>
                      </td>
                      <td className="px-6 py-4">
                        <p>{user.phone}</p>
                        <p className="text-xs">{user.email}</p>
                      </td>
                      <td className="px-6 py-4">
                        <span className="badge bg-primary/10 text-primary capitalize">{user.role.replace('_', ' ')}</span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {user.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => handleToggleStatus(user._id, user.isActive)}
                          disabled={actionState[user._id]}
                          className={`btn-outline ${user.isActive ? 'border-red-200 text-red-700 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}
                        >
                          {actionState[user._id] ? 'Updating...' : user.isActive ? 'Suspend' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {pagination && pagination.pages > 1 && (
              <div className="flex items-center justify-between border-t border-border px-6 py-4">
                <p className="text-sm text-muted-foreground">
                  Showing page <span className="font-medium text-foreground">{pagination.page}</span> of <span className="font-medium text-foreground">{pagination.pages}</span> ({pagination.total} total)
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
