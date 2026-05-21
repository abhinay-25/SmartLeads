# Smart Leads Dashboard

> **An enterprise-grade CRM dashboard built with the MERN stack, featuring granular RBAC, high-performance pagination, and polished SaaS micro-interactions.**

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Docker](https://img.shields.io/badge/Docker-2CA5E0?style=for-the-badge&logo=docker&logoColor=white)](https://www.docker.com/)

---

## 📖 Overview

The **Smart Leads Dashboard** is a production-ready CRM application designed to manage, track, and analyze sales leads. Built to mirror the architecture of top-tier SaaS products (like Linear or Attio), this project focuses heavily on **developer experience, robust security, and premium UI/UX polish**.

Instead of a generic CRUD app, this project implements complex, real-world engineering solutions including multi-stage Docker builds, Zero-Trust Role-Based Access Control, and layout-preserving loading states.

## ✨ Key Features

- **🛡️ Enterprise Security & RBAC**: Implements a strict Zero-Trust architecture. Granular JWT-based permissions distinguish between `Admin` and `Sales User` roles at both the API level and the React UI layer.
- **📊 Advanced Data Handling**: Features server-side pagination, sorting, and complex `$regex` MongoDB search queries to handle large datasets efficiently.
- **📈 Real-time Analytics**: A dedicated dashboard featuring dynamic aggregation pipelines and responsive `Recharts` data visualization.
- **💾 Backend-Generated CSV Export**: Bypasses client-side memory limits by securely generating and streaming fully-filtered CSV reports directly from the MongoDB aggregations.
- **💅 Premium SaaS UX**: Includes meticulously timed Framer Motion transitions, layout-preserving table skeletons (to eliminate Cumulative Layout Shift), and highly polished dark-mode Toast notifications.
- **🐳 Production Dockerization**: Fully containerized with multi-stage builds. The React frontend is compiled and served via an ultra-lightweight **Nginx Alpine** image, completely dropping the Node runtime for maximum security and performance.

---

## 🏗️ Architecture & Tech Stack

### Frontend Architecture
- **Framework**: React 18 + TypeScript + Vite
- **State Management**: Zustand (Auth State) + React Query (Server State caching)
- **Styling**: TailwindCSS + Framer Motion (Micro-interactions) + shadcn/ui principles
- **Forms**: React Hook Form + Zod validation

### Backend Architecture
- **Runtime**: Node.js + Express.js + TypeScript
- **Database**: MongoDB + Mongoose (with advanced Aggregation Pipelines)
- **Security**: bcryptjs (hashing), jsonwebtoken (Auth), express-rate-limit, Helmet.
- **Validation**: Zod (Strict runtime schema validation)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Web Server**: Nginx (Static serving & Reverse Proxy)

---

## 📸 Screenshots

*(Add screenshots of your dashboard here)*

| Dashboard Overview | Leads Data Table |
| :---: | :---: |
| <img src="./docs/dashboard.png" width="400" alt="Dashboard View" /> | <img src="./docs/leads-table.png" width="400" alt="Leads Table View" /> |

| Role-Based Form Modals | Premium Micro-Interactions |
| :---: | :---: |
| <img src="./docs/modal.png" width="400" alt="Modal View" /> | <img src="./docs/toast.png" width="400" alt="Toast Notification" /> |

---

## 🚀 Quick Start (Docker)

The absolute easiest way to run the application is using Docker Compose.

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/smart-leads-dashboard.git
   cd smart-leads-dashboard
   ```

2. **Run with Docker Compose**
   ```bash
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend (Nginx): [http://localhost:3000](http://localhost:3000)
   - Backend API: [http://localhost:5000](http://localhost:5000)

---

## 💻 Local Development Setup

If you prefer to run the application without Docker:

### 1. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Start development server
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install

# Copy environment variables
cp .env.example .env

# Start Vite dev server
npm run dev
```

---

## 📚 API Documentation

The backend REST API is strictly validated and heavily documented.

See [API_DOCS.md](./API_DOCS.md) for detailed request/response schemas, authentication flows, and endpoint specifications.

---

## 📂 Project Structure

```text
smart-leads-dashboard/
├── backend/
│   ├── src/
│   │   ├── controllers/   # Route handlers (Thin layer)
│   │   ├── services/      # Core business logic & MongoDB aggregations
│   │   ├── models/        # Mongoose schemas
│   │   ├── routes/        # Express routers & RBAC middleware
│   │   └── validators/    # Zod schemas for runtime type-checking
│   └── Dockerfile         # Multi-stage Node.js build
│
├── frontend/
│   ├── src/
│   │   ├── components/    # Reusable UI architecture (Buttons, Modals, Skeletons)
│   │   ├── pages/         # Route-level components
│   │   ├── hooks/         # React Query & custom logic
│   │   ├── store/         # Zustand global state
│   │   └── services/      # Axios API clients
│   ├── nginx.conf         # Static SPA routing & reverse proxy
│   └── Dockerfile         # Multi-stage Vite + Nginx build
│
└── docker-compose.yml     # Container orchestration
```

---

## 👨‍💻 Author

**Your Name**
- LinkedIn: [Abhinay Palle](https://www.linkedin.com/in/abhinay-palle/)
- GitHub: [@abhinay-25](https://github.com/abhinay-25)

