import { useSelector, useDispatch } from 'react-redux'
import { loginUser, registerUser,
         logoutUser, clearError }   from '../store/slices/authSlice.js'

export function useAuth() {
  const dispatch = useDispatch()
  const { user, accessToken, isLoading, error } = useSelector(s => s.auth)

  return {
    user,
    accessToken,
    isLoading,
    error,
    isLoggedIn:  !!user,
    isFarmer:    user?.role === 'farmer',
    isShopOwner: user?.role === 'shop_owner',
    login:       (data) => dispatch(loginUser(data)),
    register:    (data) => dispatch(registerUser(data)),
    logout:      ()     => dispatch(logoutUser()),
    clearError:  ()     => dispatch(clearError()),
  }
}