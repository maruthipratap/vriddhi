# 🌾 Vriddhi — India's Hyperlocal Agri Marketplace

> **"Grow More. Earn More. Live More."**

[![Live Demo](https://img.shields.io/badge/Live-vriddhi--india.vercel.app-green?style=for-the-badge)](https://vriddhi-india.vercel.app)
[![API](https://img.shields.io/badge/API-vriddhi--api.onrender.com-blue?style=for-the-badge)](https://vriddhi-api.onrender.com/health)
[![GitHub](https://img.shields.io/badge/GitHub-maruthipratap%2Fvriddhi-black?style=for-the-badge&logo=github)](https://github.com/maruthipratap/vriddhi)

---

## 📖 About

Vriddhi is a **hyperlocal agricultural marketplace** connecting Indian farmers with nearby fertilizer shops, seed suppliers, and agri-input dealers — powered by AI.

Think **Swiggy/Zomato for agricultural supplies** — farmers discover verified shops within 20km, browse products, chat with shop owners, place orders, and get AI-powered crop advice — all in their local language.

---

## 🚀 Live Links

| Service | URL |
|---------|-----|
| 🌐 Frontend | https://vriddhi-india.vercel.app |
| 🔗 Backend API | https://vriddhi-api.onrender.com |
| ❤️ Health Check | https://vriddhi-api.onrender.com/health |

---

## ✨ Features

### 👨‍🌾 For Farmers
- 📍 **Nearby Shop Discovery** — Find verified agri shops within 20km using geolocation
- 🛒 **Browse & Order** — Seeds, fertilizers, pesticides, tools and more
- 💬 **Real-time Chat** — Direct messaging with shop owners via Socket.io
- 📦 **Order Tracking** — Full order lifecycle with COD & online payments
- 📅 **Crop Calendar** — AI-generated activity schedule for the full season
- 📈 **Mandi Prices** — Live market prices from 1000+ mandis across India
- 🏛️ **Govt Schemes** — Find schemes you qualify for with application guide
- 🌾 **Community Forum** — Ask questions, get expert answers

### 🏪 For Shop Owners
- 📦 **Inventory Management** — Add/edit products with stock tracking
- 📋 **Order Management** — Accept, process, and deliver orders
- 📊 **Analytics Dashboard** — Revenue, orders, and performance metrics
- 💬 **Customer Chat** — Chat with all customers in one place

### 🤖 12 AI Features (Powered by Claude API)

| # | Feature | Description |
|---|---------|-------------|
| 1 | 🌱 Seed Recommender | Top varieties for your soil + season |
| 2 | 🧪 Fertilizer Advisor | Full-season input schedule |
| 3 | 🔬 Disease Identifier | Photo upload → diagnosis + treatment |
| 4 | 📄 Soil Analyzer | NPK analysis + fertilizer plan |
| 5 | ☁️ Weather Advisor | Spray/sow timing based on forecast |
| 6 | 📅 Crop Calendar | AI activity schedule with reminders |
| 7 | 💰 Cost Calculator | Input cost → profit forecast |
| 8 | 🏛️ Scheme Matcher | Eligible government schemes |
| 9 | 📈 Mandi Predictor | Best time to sell crops |
| 10 | 💬 Multilingual Chat | AI in Hindi, Telugu, Tamil |
| 11 | 👁️ Seed Quality Check | Visual authenticity scanner |
| 12 | 📦 Reorder Predictor | Smart stock alerts for shops |

---

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI Framework |
| Redux Toolkit | State Management |
| Tailwind CSS | Styling |
| Socket.io Client | Real-time chat |
| React Router v6 | Navigation |
| Axios | API calls |

### Backend
| Technology | Purpose |
|-----------|---------|
| Node.js + Express | Server |
| MongoDB Atlas | Database |
| Redis (Upstash) | Cache + Sessions |
| Socket.io | Real-time communication |
| JWT (RS256) | Authentication |
| BullMQ | Job queues |
| Cloudinary | Image storage |
| Razorpay | Payments |
| Claude API | AI features |

### Infrastructure
| Service | Usage |
|---------|-------|
| Vercel | Frontend hosting |
| Render | Backend hosting |
| MongoDB Atlas | Cloud database (Mumbai) |
| Upstash Redis | Cloud cache (Singapore) |
| GitHub | Version control |

---

## 📁 Project Structure

```
vriddhi/
├── client/                      # React Frontend
│   ├── public/images/           # Static assets
│   └── src/
│       ├── components/
│       │   ├── landing/         # Landing page sections
│       │   ├── common/          # Shared components
│       │   ├── farmer/          # Farmer components
│       │   ├── shop/            # Shop components
│       │   ├── chat/            # Chat components
│       │   └── ai/              # AI components
│       ├── pages/
│       │   ├── landing/         # Public landing page
│       │   ├── auth/            # Login / Register
│       │   ├── farmer/          # Farmer dashboard
│       │   ├── shop/            # Shop dashboard
│       │   ├── chat/            # Chat pages
│       │   ├── ai/              # AI tool pages
│       │   └── admin/           # Admin pages
│       ├── store/               # Redux store + slices
│       ├── hooks/               # Custom React hooks
│       ├── services/            # API service layer
│       └── locales/             # i18n (EN/HI/TE)
│
└── server/                      # Node.js Backend
    ├── config/                  # DB, Redis, Socket config
    ├── models/                  # Mongoose models
    ├── repositories/            # Data access layer
    ├── services/                # Business logic
    ├── controllers/             # HTTP handlers
    ├── middleware/              # Auth, error, upload
    ├── routes/                  # API routes (/api/v1)
    ├── socket/                  # Socket.io handlers
    └── utils/                   # Helpers
```

---

## ⚡ Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Redis (Upstash recommended)

### Installation

```bash
# Clone the repo
git clone https://github.com/maruthipratap/vriddhi.git
cd vriddhi

# Install all dependencies
npm run install:all

# Generate RS256 keys
cd server && mkdir keys
node -e "
const crypto = require('crypto');
const fs = require('fs');
const { privateKey, publicKey } = crypto.generateKeyPairSync('rsa', {
  modulusLength: 2048,
  publicKeyEncoding:  { type: 'spki',  format: 'pem' },
  privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
});
fs.writeFileSync('keys/private.pem', privateKey);
fs.writeFileSync('keys/public.pem',  publicKey);
console.log('RS256 keys generated!');
"

# Configure environment
cp server/.env.example server/.env
cp client/.env.example client/.env
# Edit both .env files with your credentials

# Run development servers
cd .. && npm run dev
```

### Environment Variables

**server/.env**
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/vriddhi
REDIS_URL=rediss://default:pass@host.upstash.io:6379
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d
JWT_ISSUER=vriddhi.in
JWT_AUDIENCE=vriddhi-app
COOKIE_SECRET=your_64_char_random_string
ANTHROPIC_API_KEY=sk-ant-...
CLOUDINARY_CLOUD_NAME=your_cloud
CLOUDINARY_API_KEY=your_key
CLOUDINARY_API_SECRET=your_secret
RAZORPAY_KEY_ID=rzp_test_...
RAZORPAY_KEY_SECRET=your_secret
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api/v1
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🔐 Security Features

- **RS256 JWT** — Asymmetric signing (private key signs, public verifies)
- **Token Revocation** — Redis blocklist for instant logout
- **httpOnly Cookies** — Refresh tokens unreachable by JavaScript
- **BOLA Protection** — Every resource scoped to authenticated user
- **Atomic Stock** — MongoDB `findOneAndUpdate` with `$gte` guard prevents oversell
- **Rate Limiting** — 4-layer: global, auth, AI, SMS
- **NoSQL Injection** — `express-mongo-sanitize` + Zod validation
- **Payment Verification** — Razorpay HMAC-SHA256 signature verification
- **DPDP Compliance** — Consent tracking + data deletion endpoint

---

## 📡 API Reference

```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
POST   /api/v1/auth/logout
GET    /api/v1/auth/me

GET    /api/v1/shops/nearby?lat=&lng=&radius=
POST   /api/v1/shops
GET    /api/v1/shops/:slug

GET    /api/v1/products/nearby?lat=&lng=
GET    /api/v1/products/:id
POST   /api/v1/products

POST   /api/v1/orders
GET    /api/v1/orders/my
POST   /api/v1/orders/verify-payment

GET    /api/v1/chats
POST   /api/v1/chats/with-shop/:shopId
GET    /api/v1/chats/:chatId/messages

POST   /api/v1/ai/recommend-seeds
POST   /api/v1/ai/identify-disease
POST   /api/v1/ai/fertilizer-advice
POST   /api/v1/ai/match-schemes
POST   /api/v1/ai/cost-profit
POST   /api/v1/ai/weather-advice
POST   /api/v1/ai/chat
```

---

## 🌍 Multilingual Support

| Language | Code |
|----------|------|
| English  | en   |
| हिंदी   | hi   |
| తెలుగు  | te   |
| தமிழ்   | ta   |
| ಕನ್ನಡ   | kn   |

---

## 👥 User Roles

| Role | Description |
|------|-------------|
| 🧑‍🌾 Farmer | Browse, buy, chat, get AI advice |
| 🏪 Shop Owner | Sell, manage inventory, analytics |
| 🧑‍🔬 Agronomist | Verified expert, answer forum questions |
| 🚜 Equipment Renter | List tractors/harvesters for rental |
| 👨‍💼 Admin | Verify shops, manage platform |

---

## 💰 Business Model

| Revenue Stream | Amount |
|---------------|--------|
| Order Commission | 2–3% per transaction |
| Shop Subscription | ₹500/month |
| Featured Listings | ₹200–500/week |
| AI Premium | ₹99/month |
| Equipment Rental | 5–8% commission |

---

## 🗺️ Roadmap

### Phase 1 ✅ Complete
- Auth system (JWT RS256)
- Shop + Product discovery (geolocation)
- Order system (COD)
- Real-time chat (Socket.io)
- 7 AI endpoints
- Landing page + Dashboard
- Deployed (Render + Vercel)

### Phase 2 🔄 In Progress
- [ ] Razorpay online payments
- [ ] Real Claude AI (add credits)
- [ ] Push notifications (FCM)
- [ ] Image uploads (Cloudinary)
- [ ] Equipment rental module

### Phase 3 📋 Planned
- [ ] PWA offline support
- [ ] Voice input (multilingual)
- [ ] WhatsApp Business integration
- [ ] Custom domain (vriddhi.in)
- [ ] Government scheme API

---

## 📊 Architecture Highlights

- **Repository Pattern** — DB layer abstracted behind interfaces
- **Circuit Breakers** — Cascade failure prevention
- **Bulkhead Pattern** — Isolated concurrency pools per feature
- **Message Bucketing** — 100x fewer chat documents
- **Shop-First Geo** — Geo on shops (3.5K) not products (200K)
- **Provider Abstraction** — AI/storage/payments all swappable
- **Atomic Stock** — Race condition prevention
- **Event Sourcing** — Full order audit trail

---

## 🤝 Contributing

```bash
git checkout -b feature/your-feature
git commit -m "feat: your feature"
git push origin feature/your-feature
# Open Pull Request
```

---

## 📄 License

MIT © 2026 Vriddhi

---

## 👨‍💻 Author

**Maruthi Pratap**
- GitHub: [@maruthipratap](https://github.com/maruthipratap)
- Live: [vriddhi-india.vercel.app](https://vriddhi-india.vercel.app)

---

> 🌾 *From seed to harvest, we're with you.*