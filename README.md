# Tripco

A premium full-stack travel booking platform.

## Features
- **3 Roles**: Traveler, Company, Admin
- **Traveler**: Explore trips, advanced search, book trips, manage bookings
- **Company**: Dashboard analytics, create trips, manage trips, view bookings
- **Admin**: Platform oversight
- **Design**: Premium UI with dark mode components, glassmorphism, animations (Tailwind + Lucide + framer-style CSS)
- **Tech Stack**: MongoDB, Express, React (Vite), Node.js, Zustand, Axios

## Setup Instructions

### Backend Setup (Server)
1. `cd server`
2. `npm install`
3. Make sure MongoDB is running or the `MONGO_URL` in `server/.env` points to a valid cluster (e.g. MongoDB Atlas).
4. `npm run start` (Dev mode) or `npm run start:prod` (Production)
   - Server runs on `http://localhost:8000`

### Frontend Setup (Client)
1. `cd client`
2. `npm install`
3. Make sure `VITE_API_URL=http://localhost:8000/api` is in `client/.env`
4. `npm run dev`
   - Client runs on `http://localhost:5173`

## Deployment
You can deploy this application using Docker Compose. Make sure Docker is installed on your machine.

1. `docker-compose up -d --build`
2. The application will be available at `http://localhost:5173`
