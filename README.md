# 🛒 Grocery Delivery Web Application

A full-stack **Grocery Delivery Platform** built with **Next.js (App Router), Node.js APIs, MongoDB, Redux Toolkit, and Stripe integration**.  
This application enables users to browse groceries, place orders, make payments, and allows admins & delivery agents to manage operations efficiently.

---

## 🚀 Features

### 👤 User Features
- User Authentication (Login/Register with NextAuth)
- Browse Grocery Items
- Add to Cart & Checkout
- Secure Online Payments (Stripe)
- View Order History
- Real-time Order Updates (Socket Integration)

### 🛠️ Admin Features
- Add Grocery Items
- View All Groceries
- Manage Orders
- Assign Delivery Agents

### 🚚 Delivery Features
- View Assigned Orders
- Accept/Reject Delivery Tasks
- Update Delivery Status

---

## 🧱 Tech Stack

### Frontend
- Next.js (App Router)
- React.js
- Tailwind CSS
- Redux Toolkit

### Backend
- Next.js API Routes
- MongoDB (Mongoose)
- NextAuth

### Integrations
- Stripe
- Cloudinary
- Socket.io

---

## 📁 Folder Structure
G_DELIVERY/
│
├── frontend/
│ ├── src/
│ │ ├── app/
│ │ │ ├── admin/
│ │ │ │ ├── add-grocery/
│ │ │ │ ├── manage-orders/
│ │ │ │ └── view-grocery/
│ │ │ │
│ │ │ ├── api/
│ │ │ │ ├── admin/
│ │ │ │ ├── auth/
│ │ │ │ │ ├── [...nextauth]/route.ts
│ │ │ │ │ └── register/route.ts
│ │ │ │ ├── delivery/
│ │ │ │ │ ├── deliver-order/
│ │ │ │ │ ├── getAssignments/
│ │ │ │ │ └── respond-assignment/
│ │ │ │ ├── user/
│ │ │ │ │ ├── order/
│ │ │ │ │ ├── payment/
│ │ │ │ │ └── stripe/
│ │ │ │ └── me/
│ │ │
│ │ │ ├── login/
│ │ │ ├── register/
│ │ │ ├── user/
│ │ │ │ ├── cart/
│ │ │ │ ├── checkOut/
│ │ │ │ ├── my-order/
│ │ │ │ └── orderSuccess/
│ │ │
│ │ ├── components/
│ │ ├── hooks/
│ │ ├── lib/
│ │ ├── models/
│ │ ├── redux/
│ │ ├── types/
│ │
│ ├── .env
│ ├── next.config.ts
│ ├── package.json
