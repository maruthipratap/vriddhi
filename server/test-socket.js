import { io } from 'socket.io-client'

const TOKEN   = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OWJlYzIzZDhjYjljNGM2ZDc0MzZkMGYiLCJyb2xlIjoiZmFybWVyIiwidG9rZW5WZXJzaW9uIjowLCJqdGkiOiIyMWE3ZWU2NS1lMTFhLTQ2NDktOTMzOS04N2FkYmY0OWE2MzUiLCJpYXQiOjE3NzQxMTUzMTksImV4cCI6MTc3NDExNjIxOSwiYXVkIjoidnJpZGRoaS1hcHAiLCJpc3MiOiJ2cmlkZGhpLmluIn0.TQcM9dgUtbJsX8cc7HMDp5qvQGmiUHuPf-iNldlitdcqy1SmLjJZp-RvjEbeUmf2Z2pFG88gJHf7SHJ3LTVyf24T5gJDMleBsLJyM0o-Dl25rh3NtxPWNCaJnutCfWaabJ6eUWJp87SjZ-2hi_TgDKTl4jEmwqFlnn0C0WrBIuvj-DajBdn6M1z15IK9t2TrPeioIY94f4czOwlyKElVwgxgDP1dPGakrlrHqr1NRZ69xU4VtcDvxeEsLGgHR4p5m2yuRmfIxCmyG4oQNY2i5ayUfMa2dfPPMbg0NeKS_URrWo9-2QTe_gYlVuqg05iDz4Es49tF4vXAhHuQ4ppMfQ'
const CHAT_ID = '69bed8d4b31a629a061cb8bb'

const socket = io('http://localhost:5000', {
  auth: { token: TOKEN }
})

socket.on('connect', () => {
  console.log('✅ Connected:', socket.id)
  socket.emit('join_chat', CHAT_ID)
})

socket.on('chat_history', (data) => {
  console.log('📨 History received:', data.messages.length, 'messages')

  // Send a test message after joining
  setTimeout(() => {
    socket.emit('send_message', {
      chatId:  CHAT_ID,
      content: 'Hello! Do you have DAP fertilizer in stock?',
      type:    'text',
    })
    console.log('💬 Message sent!')
  }, 1000)
})

socket.on('new_message', (data) => {
  console.log('💬 Message received:', data.message.content)
  console.log('   From:', data.message.senderName)
  process.exit(0)
})

socket.on('error', (err) => {
  console.error('❌ Error:', err)
})