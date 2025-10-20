# CliniSync - Your Secure Foundation for Wellness

## Overview

CliniSync is a modern, secure multi-tenant SaaS platform designed for physical therapy clinics. The platform enables clinic management, patient tracking, staff coordination, and intelligent session scheduling with automated cascade rescheduling capabilities.

**Key Features:**
- 🏥 Multi-clinic tenant isolation for GDPR compliance
- 👥 Role-based access control (System Admin, Clinic Admin, Staff)
- 📅 Smart scheduling with cascade rescheduling for follow-up sessions
- 🎨 Customizable clinic branding with dynamic color themes
- 📊 Comprehensive patient and staff management
- 🔒 Secure authentication with JWT

## Technologies Used

### Backend
- **Node.js** & **Express.js** - RESTful API server
- **MySQL** - Relational database with soft multi-tenancy
- **JWT** - Secure authentication
- **Bcrypt** - Password hashing

### Frontend
- **React** - UI library
- **Vite** - Fast build tool
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **Lucide React** - Icon library
- **Chroma.js** - Dynamic color palette generation

### Architecture
- Soft Multi-Tenancy (Discriminator Column Pattern)
- Data Access Layer (DAL) for database abstraction
- Service Layer for business logic
- Middleware for authentication, authorization, and tenant isolation

## Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL (v8+)
- npm or yarn

### Installation

1. Clone the repository
2. Install backend dependencies: `npm install`
3. Install frontend dependencies: `cd frontend && npm install`
4. Configure environment variables (create `.env` file)
5. Initialize database: `npm run init-db`
6. Start backend: `npm run dev`
7. Start frontend: `cd frontend && npm run dev`

## License

Proprietary - All rights reserved
