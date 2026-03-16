# ♻️ RecycleLink

**An On-Demand Resource Recovery Platform**

RecycleLink is a full-stack application designed to simplify and incentivize recycling.
It connects **residents who want to dispose of recyclable materials** with **drivers who collect and process them**, while providing **real-time fleet tracking and administrative analytics**.

The goal is to make recycling **more accessible, traceable, and rewarding**, while supporting **Extended Producer Responsibility (EPR)** and sustainable waste management practices.

---

# 🚀 Features

### 👤 Resident

* Schedule recyclable material pickups
* Track pickup history
* Generate QR code for pickup verification
* Earn **Eco-Points** based on material weight

### 🚚 Driver

* View assigned pickup routes
* Navigate to resident locations
* Scan QR codes to verify pickups
* Submit actual weight collected

### 🛠 Admin

* Monitor driver fleet in real time
* Assign drivers to pickup requests
* View recycling analytics and reports
* Track sustainability metrics

---

# 🧰 Tech Stack

### Frontend

* **React**
* **Vite**
* **Axios**
* **Google Maps API**

### Backend

* **Node.js**
* **Express.js**
* **MongoDB**
* **Mongoose**

### Other Technologies

* **JWT Authentication**
* **WebSockets** (Real-time driver tracking)
* **QR Code verification**
* **Role-based access control**

---

# 🏗 System Architecture

```
Frontend (React + Vite)
        │
        │ REST API + WebSockets
        ▼
Backend (Node.js + Express)
        │
        ▼
MongoDB Database
```

The backend manages:

* Authentication
* Pickup requests
* Driver routing
* Reward calculation
* Real-time fleet updates

---

# 📂 Project Structure

```
recyclelink/
│
├── backend/
│   ├── db/
│   │   └── connect.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Driver.js
│   │   ├── PickupRequest.js
│   │   ├── Reward.js
│   │   └── Route.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── pickups.js
│   │   ├── driver.js
│   │   └── admin.js
│   ├── seed.js
│   └── server.js
│
└── frontend/
    ├── index.html
    ├── vite.config.js
    └── src/
        ├── components/
        ├── context/
        ├── pages/
        └── services/
```

---

# ⚙️ Installation & Setup

## 1️⃣ Clone the repository

```bash
git clone https://github.com/yourusername/recyclelink.git
cd recyclelink
```

---

## 2️⃣ Backend Setup

```bash
cd backend
npm install
```

Create `.env`

```
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_secret_key
```

Run server:

```bash
npm run seed
npm run dev
```

Backend runs at:

```
http://localhost:3001
```

---

## 3️⃣ Frontend Setup

```bash
cd frontend
npm install
```

Create `.env`

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

Run frontend:

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 👥 Demo Accounts

| Role     | Email                                                       | Password    |
| -------- | ----------------------------------------------------------- | ----------- |
| Admin    | [admin@recyclelink.com](mailto:admin@recyclelink.com)       | admin123    |
| Driver   | [driver@recyclelink.com](mailto:driver@recyclelink.com)     | driver123   |
| Resident | [resident@recyclelink.com](mailto:resident@recyclelink.com) | resident123 |

---

# 📊 Reward System

| Material | Points / kg | Payment |
| -------- | ----------- | ------- |
| E-Waste  | 50          | ₹5.00   |
| Metal    | 30          | ₹3.00   |
| Plastic  | 15          | ₹1.50   |
| Glass    | 10          | ₹1.00   |
| Paper    | 8           | ₹0.80   |
| Organic  | 5           | ₹0.50   |

Residents earn points or payouts based on the **actual weight of recyclable materials collected**.

---

# 🔐 Authentication & Security

* JWT based authentication
* Role-based route protection
* Secure API endpoints
* Middleware validation

---

# 📡 Real-Time Features

Drivers broadcast location updates using **WebSockets**, allowing the admin dashboard to display:

* Live driver positions
* Active pickup routes
* Fleet monitoring

---

# 🌍 Future Improvements

* Mobile app (React Native)
* AI route optimization
* Payment gateway integration
* Smart recycling bin integration
* Carbon footprint analytics

---

# 🤝 Contributing

Contributions are welcome.
Feel free to fork the repository and submit pull requests.

---

# 📜 License

This project is released under the **MIT License**.

---

# 👨‍💻 Author

Built as a sustainability-focused full-stack project exploring **real-time systems, logistics, and environmental impact through technology**.
