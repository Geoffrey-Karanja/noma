# 🍽️ NOMA — Premium Food Delivery Platform

> *Food that feels like a story.*

NOMA is a full-stack, production-grade food delivery web application built with Node.js, Express, SQLite, and vanilla HTML/CSS/JavaScript. Designed with a neon futuristic aesthetic, NOMA delivers a premium user experience across all devices.

![NOMA](https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&q=80)

---

## ✨ Features

### User Experience
- 🌑 Neon futuristic dark UI with cyan/magenta glow effects
- 📱 Fully responsive across all screen sizes
- ⚡ SPA-like page transitions and smooth animations
- 🔍 Smart search — filter by cuisine, restaurant name, or dish
- 🎯 Mood-based filtering chips
- 🎲 Surprise Me — AI-style random meal generator

### Core Functionality
- 🔐 Full authentication — signup, login, JWT tokens
- 🍽️ 12 restaurants across 11 cuisines with 140+ dishes
- 🛒 Persistent cart with quantity controls
- 📦 Order placement with real-time tracking simulation
- 📋 Full order history with expandable details
- 🔄 One-click reorder from history

### Gamification
- ⭐ Points system — earn 1 point per dollar spent
- 🔥 Daily streak tracking
- 🏆 4 loyalty tiers — Bronze, Silver, Gold, Diamond
- 📊 Personal stats dashboard

### Business Pages
- 🏢 About page with team, mission, and stats
- 📬 Contact form
- 💼 Careers page with job listings
- 🤝 Restaurant partner application
- 📝 Blog with food stories

---

## 🛠️ Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | HTML5, CSS3, Vanilla JavaScript     |
| Styling    | Bootstrap 5 + Custom CSS            |
| Backend    | Node.js + Express.js                |
| Database   | SQLite via better-sqlite3           |
| Auth       | JWT (jsonwebtoken) + bcryptjs       |
| Dev Tools  | Nodemon, dotenv                     |

---

## 📁 Project Structure

noma/
├── backend/
│   ├── controllers/
│   │   ├── authController.js      # Signup, login, profile
│   │   ├── menuController.js      # Restaurants, menu items
│   │   ├── cartController.js      # Cart CRUD operations
│   │   └── orderController.js     # Place orders, history
│   ├── middleware/
│   │   └── authMiddleware.js      # JWT verification
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── menuRoutes.js
│   │   ├── cartRoutes.js
│   │   └── orderRoutes.js
│   ├── db/
│   │   └── database.js            # SQLite setup + seed data
│   └── server.js                  # Express app entry point
├── frontend/
│   ├── css/
│   │   └── style.css              # Global design system
│   ├── js/                        # (modular JS files)
│   ├── index.html                 # Homepage
│   ├── menu.html                  # Restaurant browser
│   ├── cart.html                  # Cart + checkout
│   ├── orders.html                # Order history + rewards
│   └── about.html                 # Company pages
├── .env                           # Environment variables
├── .gitignore
├── package.json
└── README.md

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18 or higher
- npm v8 or higher

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Geoffrey-Karanja/noma.git
cd noma

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.example .env
# Edit .env and set your JWT_SECRET

# 4. Start development server
npm run dev
```

### Environment Variables

Create a `.env` file in the root directory:
PORT=5000
JWT_SECRET=your_super_secret_key_here

### Access the App
http://localhost:5000

The database is created and seeded automatically on first run.

---

## 🔌 API Reference

### Auth
| Method | Endpoint              | Auth     | Description        |
|--------|-----------------------|----------|--------------------|
| POST   | /api/auth/signup      | Public   | Create account     |
| POST   | /api/auth/login       | Public   | Login + get token  |
| GET    | /api/auth/profile     | Required | Get user profile   |

### Menu
| Method | Endpoint                    | Auth   | Description              |
|--------|-----------------------------|--------|--------------------------|
| GET    | /api/menu/restaurants       | Public | All restaurants          |
| GET    | /api/menu/restaurants/:id   | Public | Restaurant + menu        |
| GET    | /api/menu/items             | Public | Menu items with filters  |
| GET    | /api/menu/surprise          | Public | Random meal generator    |

### Cart
| Method | Endpoint        | Auth     | Description       |
|--------|-----------------|----------|-------------------|
| GET    | /api/cart       | Required | View cart         |
| POST   | /api/cart       | Required | Add item          |
| PUT    | /api/cart/:id   | Required | Update quantity   |
| DELETE | /api/cart/:id   | Required | Remove item       |
| DELETE | /api/cart       | Required | Clear cart        |

### Orders
| Method | Endpoint          | Auth     | Description        |
|--------|-------------------|----------|--------------------|
| POST   | /api/orders       | Required | Place order        |
| GET    | /api/orders       | Required | Order history      |
| GET    | /api/orders/:id   | Required | Single order       |

---

## 🗄️ Database Schema

```sql
users         — id, name, email, password, points, streak, last_order
restaurants   — id, name, cuisine, image_emoji, rating, delivery_time, min_order
menu_items    — id, restaurant_id, name, description, price, category, image_emoji
cart          — id, user_id, menu_item_id, quantity
orders        — id, user_id, restaurant_id, total, status, address, created_at
order_items   — id, order_id, menu_item_id, quantity, price
```

---

## 🌍 Deployment

This app is deployed on **Render.com**.

Live URL: [https://noma-food.onrender.com](https://noma-food.onrender.com)

---

## 📸 Screenshots

| Page | Description |
|------|-------------|
| Home | Hero with real food photography, search, mood filters |
| Menu | 12 restaurants, filter by cuisine, full menu with photos |
| Cart | Live cart, order summary, delivery tracking simulation |
| Orders | Rewards dashboard, order history, reorder in one click |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

## 👨‍💻 Author

Built with obsession by **Senior Sir Geoffrey** ✦

---

*© 2026 NOMA Technologies Ltd.*