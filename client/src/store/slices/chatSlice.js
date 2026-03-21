import { createSlice } from '@reduxjs/toolkit'

const chatSlice = createSlice({
  name: 'chat',
  initialState: {
    chats:          [],
    activeChat:     null,
    messages:       {},   // chatId → messages[]
    isConnected:    false,
    typingUsers:    {},   // chatId → userId
  },
  reducers: {
    setChats(state, action) {
      state.chats = action.payload
    },
    setActiveChat(state, action) {
      state.activeChat = action.payload
    },
    setMessages(state, action) {
      const { chatId, messages } = action.payload
      state.messages[chatId] = messages
    },
    addMessage(state, action) {
      const { chatId, message } = action.payload
      if (!state.messages[chatId]) state.messages[chatId] = []
      state.messages[chatId].push(message)
    },
    setConnected(state, action) {
      state.isConnected = action.payload
    },
    setTyping(state, action) {
      const { chatId, userId, isTyping } = action.payload
      if (isTyping) {
        state.typingUsers[chatId] = userId
      } else {
        delete state.typingUsers[chatId]
      }
    },
  },
})

export const {
  setChats, setActiveChat, setMessages,
  addMessage, setConnected, setTyping,
} = chatSlice.actions
export default chatSlice.reducer