import { useEffect, useRef } from 'react'
import { useDispatch }       from 'react-redux'
import { io }                from 'socket.io-client'
import { addMessage, setConnected, setTyping } from '../store/slices/chatSlice.js'
import { fetchMyOrders }                       from '../store/slices/orderSlice.js'

export function useSocket(accessToken) {
  const dispatch   = useDispatch()
  const socketRef  = useRef(null)

  useEffect(() => {
    if (!accessToken) return

    const socket = io(
      import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000',
      { auth: { token: accessToken } }
    )

    socketRef.current = socket

    socket.on('connect', () => {
      dispatch(setConnected(true))
    })

    socket.on('disconnect', () => {
      dispatch(setConnected(false))
    })

    socket.on('new_message', ({ chatId, message }) => {
      dispatch(addMessage({ chatId, message }))
    })

    socket.on('user_typing', ({ chatId, userId, isTyping }) => {
      dispatch(setTyping({ chatId, userId, isTyping }))
    })

    // ── Order status updates ──────────────────────────────────
    // Server emits ORDER_UPDATED to user_${farmerId} room when shop updates order status
    socket.on('ORDER_UPDATED', (payload) => {
      // Re-fetch page 1 of orders so the list reflects the new status
      dispatch(fetchMyOrders(1))
      
      // Fire a system alert toast or notification if supported
      if (window.Notification && Notification.permission === 'granted') {
        new Notification('Vriddhi Order Update', { body: payload.message })
      } else {
        alert(payload.message) // Fallback toast natively
      }
    })

    return () => {
      socket.disconnect()
      dispatch(setConnected(false))
    }
  }, [accessToken])

  return socketRef
}
