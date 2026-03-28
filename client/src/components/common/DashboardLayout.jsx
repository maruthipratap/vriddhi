import { useSelector } from 'react-redux'
import DashboardNavbar from './DashboardNavbar.jsx'
import FarmerSidebar from '../dashboard/FarmerSidebar.jsx'
import ShopSidebar from '../dashboard/ShopSidebar.jsx'
import AdminSidebar from '../dashboard/AdminSidebar.jsx'

export default function DashboardLayout({ children }) {
  const { user } = useSelector((state) => state.auth)
  const isShop = user?.role === 'shop_owner'
  const isAdmin = user?.role === 'admin'

  return (
    <div className="page-shell mesh-bg flex flex-col">
      <DashboardNavbar />

      <div className="flex flex-1 pt-16">
        {isAdmin ? <AdminSidebar /> : isShop ? <ShopSidebar /> : <FarmerSidebar />}

        <main className="flex-1 min-w-0 overflow-auto">
          <div className="min-h-[calc(100vh-4rem)] px-0 md:px-4 lg:px-6 pb-28 md:pb-10">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
