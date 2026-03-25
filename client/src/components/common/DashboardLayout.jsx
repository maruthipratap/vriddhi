import { useSelector } from 'react-redux'
import DashboardNavbar from './DashboardNavbar.jsx'
import FarmerSidebar   from '../dashboard/FarmerSidebar.jsx'
import ShopSidebar     from '../dashboard/ShopSidebar.jsx'

export default function DashboardLayout({ children }) {
  const { user } = useSelector(s => s.auth)
  const isShop   = user?.role === 'shop_owner'

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile top navbar */}
      <DashboardNavbar />

      <div className="flex flex-1 pt-14">
        {/* Desktop sidebar */}
        {isShop ? <ShopSidebar /> : <FarmerSidebar />}

        {/* Main content */}
        <main className="flex-1 min-w-0 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
