export function getDashboardPath(user) {
  if (user?.role === 'admin') return '/admin'
  if (user?.role === 'shop_owner') return '/shop/dashboard'
  return '/home'
}
