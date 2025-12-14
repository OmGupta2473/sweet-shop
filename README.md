# 🍬 THE SWEET SPOT — Full Stack Sweet Shop Management System

A modern, fully functional **React + Node.js + MongoDB** web application built to manage a sweet shop’s inventory, purchases, and administration.  
The project demonstrates **JWT authentication, role-based access, inventory logic, and a clean modern UI**, following real-world development practices.

This project is built as part of a **Sweet Shop Management System Kata**, with focus on **clean code, TDD mindset, and responsible AI usage**.

---

## 🚀 Live Features

### 🛍️ Customer Features
- Browse all available sweets
- Search sweets by name and category
- Filter sweets by price range
- View real-time stock availability
- Purchase sweets
- Purchase button auto-disabled when stock = 0
- Instant stock update after purchase

### 🔐 Authentication
- User registration & login
- JWT-based authentication
- Protected routes
- Persistent login using token storage

### 🛠️ Admin Features
(Admin access via role-based authorization)
- Add new sweets
- Update sweet details (name, category, price, quantity)
- Delete sweets
- Restock sweets
- Admin-only dashboard view
- Inventory management with real-time updates

### 🎨 UI / UX
- Modern dark theme with warm accent colors
- Clean, responsive layout
- Professional card-based design
- No browser alerts — all feedback shown inside UI
- Mobile-friendly experience

---

## 📁 Project Structure

```
the-sweet-spot/
│
├── sweet-shop-backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── tests/
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── sweet-shop-frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
└── README.md
```

---

## 🧰 Tech Stack

| Tool | Purpose |
|------|---------|
| **React.js** | Frontend framework |
| **Vite** | Fast development bundler |
| **Node.js** | Backend runtime |
| **Express.js** | REST API framework |
| **MongoDB** | Database |
| **Mongoose** | ODM |
| **JWT** | Authentication |
| **Jest + Supertest** | Backend testing |
| **CSS** | Custom styling |

---

## 🔧 Installation & Setup

### 1️⃣ Clone the repository
```bash
git clone https://github.com/your-username/the-sweet-spot.git
cd the-sweet-spot
```

### 2️⃣ Backend Setup
```bash
cd sweet-shop-backend
npm install
```

Create a `.env` file using `.env.example`:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

Run backend:
```bash
npm run dev
```

### 3️⃣ Frontend Setup
```bash
cd ../sweet-shop-frontend
npm install
npm run dev
```

---

## 🔗 API Overview

### Authentication
- POST /api/auth/register
- POST /api/auth/login

### Sweets
- GET /api/sweets
- GET /api/sweets/search
- POST /api/sweets (Admin)
- PUT /api/sweets/:id (Admin)
- DELETE /api/sweets/:id (Admin)

### Inventory
- POST /api/sweets/:id/purchase
- POST /api/sweets/:id/restock (Admin)

---

## 🧪 Testing

Backend tests are written using **Jest + Supertest** following a **TDD mindset**.

```bash
npm test
```

---

## 🤖 My AI Usage

### AI Tools Used
- ChatGPT (OpenAI)
- Google Gemini
- GitHub Copilot (optional)

### How I Used AI
- Architecture planning and folder structure
- Boilerplate generation for backend APIs
- UI styling and responsiveness ideas
- Drafting and refining test cases
- Debugging and refactoring assistance

### Reflection on AI Usage
AI improved development speed and clarity.  
All AI-assisted code was reviewed, modified, and tested manually to ensure correctness and ownership.

---

## 🙌 Author
Built with ❤️ by **Om Gupta**
