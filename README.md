# 🌾 Vriddhi — Agri Marketplace

> **"Grow More. Earn More. Live More."**

India's hyperlocal marketplace connecting farmers with fertilizer shops, seed suppliers, and agricultural input dealers — powered by AI.

## 🚀 Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | React.js + Vite + Tailwind CSS |
| State | Redux Toolkit + RTK Query |
| Maps | Leaflet.js + OpenStreetMap |
| Real-time | Socket.io |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas |
| Cache | Redis |
| AI | Claude API (Anthropic) |
| Payments | Razorpay |
| Notifications | Firebase FCM |

## 📁 Project Structure

```
vriddhi/
├── client/          # React frontend
├── server/          # Node.js backend
└── package.json     # Root scripts
```

## ⚡ Quick Start

```bash
# Clone the repo
git clone https://github.com/yourusername/vriddhi.git
cd vriddhi

# Install all dependencies
npm run install:all

# Add environment variables
cp server/.env.example server/.env
cp client/.env.example client/.env

# Run both client and server
npm run dev
```

## 🌍 Features

- 📍 Location-based shop discovery
- 🌱 Seeds, Fertilizers, Pesticides & more
- 💬 Real-time farmer ↔ shop chat
- 🤖 12 AI-powered farming tools
- 📊 Live mandi price tracking
- 🏛️ Government scheme matcher
- 📅 AI crop calendar generator

## 👥 User Roles

- 🧑‍🌾 Farmer
- 🏪 Shop Owner
- 🧑‍🔬 Agronomist
- 🚜 Equipment Renter
- 👨‍💼 Admin

## 📄 License

MIT © 2025 Vriddhi
