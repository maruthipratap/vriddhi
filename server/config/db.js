import mongoose from 'mongoose'
import config   from './index.js'

export async function connectDB() {
  try {
    const conn = await mongoose.connect(config.db.uri, config.db.options)
    console.log(`✅ MongoDB connected: ${conn.connection.host}`)

    // Monitor connection
    mongoose.connection.on('disconnected', () => {
      console.error('❌ MongoDB disconnected')
    })
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB error:', err.message)
    })

  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message)
    process.exit(1)   // crash fast — don't run without DB
  }
}