import dotenv from 'dotenv'
import mongoose from 'mongoose'
import fs from 'fs'
import { connectDB } from '../config/db.js'
import User from '../models/User.js'

dotenv.config()

const email = process.env.ADMIN_EMAIL || 'admin@vriddhi.in'
const password = process.env.ADMIN_PASSWORD || 'Admin@123'
const name = process.env.ADMIN_NAME || 'Vriddhi Admin'
const phone = process.env.ADMIN_PHONE || '9876543210'
const language = process.env.ADMIN_LANGUAGE || 'en'

async function getAvailablePhone(preferredPhone, currentUserId = null) {
  const existing = await User.findOne({
    phone: preferredPhone,
    ...(currentUserId ? { _id: { $ne: currentUserId } } : {}),
  })

  if (!existing) return preferredPhone

  for (let counter = 1; counter < 1000; counter += 1) {
    const candidate = `9${String(876543210 + counter).padStart(9, '0')}`
    const taken = await User.findOne({
      phone: candidate,
      ...(currentUserId ? { _id: { $ne: currentUserId } } : {}),
    })
    if (!taken) return candidate
  }

  throw new Error('Could not find an available phone number for the admin user')
}

async function createOrUpdateAdmin() {
  await connectDB()

  let user = await User.findOne({ email }).select('+password')
  const availablePhone = await getAvailablePhone(phone, user?._id)

  if (!user) {
    user = new User({
      name,
      email,
      phone: availablePhone,
      password,
      role: 'admin',
      language,
      isVerified: true,
      isActive: true,
      consent: {
        given: true,
        version: 'seed-script',
        timestamp: new Date(),
        ip: '127.0.0.1',
      },
    })

    await user.save()

    console.log(`Admin user created.`)
    console.log(`Email: ${email}`)
    console.log(`Password: ${password}`)
    console.log(`Phone: ${availablePhone}`)
    return
  }

  user.name = name
  user.phone = availablePhone
  user.language = language
  user.role = 'admin'
  user.isVerified = true
  user.isActive = true
  user.password = password
  user.markModified('password')

  await user.save()

  console.log(`Admin user updated.`)
  console.log(`Email: ${email}`)
  console.log(`Password: ${password}`)
  console.log(`Phone: ${availablePhone}`)
}

createOrUpdateAdmin()
  .catch((error) => {
    fs.writeFileSync('err.log', error.stack, 'utf8')
    console.error('Failed to create admin user:', error.message)
    process.exitCode = 1
  })
  .finally(async () => {
    await mongoose.disconnect()
  })
