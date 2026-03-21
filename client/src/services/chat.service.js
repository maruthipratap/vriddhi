import api from './api.js'

const chatService = {
  async getMyChats(token) {
    const res = await api.get('/chats', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data.chats
  },

  async getOrCreateChat(shopId, token, orderId = null) {
    const url = orderId
      ? `/chats/with-shop/${shopId}?orderId=${orderId}`
      : `/chats/with-shop/${shopId}`
    const res = await api.post(url, {}, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data.chat
  },

  async getMessages(chatId, token) {
    const res = await api.get(`/chats/${chatId}/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return res.data.data.messages
  },
}

export default chatService