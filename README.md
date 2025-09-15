# 🏢 WorkManager – Team Productivity Platform

A simple, powerful team productivity platform where multiple users can create group projects, assign tasks, chat in real-time, visualize team performance, and use AI-powered feedback and assistance — all from a single dashboard.

Built with modern web technologies, real-time sockets, Canvas-based whiteboarding, and Gemini API integrations, **WorkManager** helps small teams stay organized and productive.

---

## ✨ Features

### 👥 Team & Project Management
Create group projects, join teams, and send connection requests.  
![Team Management](./public//Screenshot%202025-09-15%20201235.png)

### 🧑‍💼 Role Management
Team leader can assign tasks to members.  
![Role Management](./public//Screenshot%202025-09-15%20201301.png)

### 💬 Live Chat
Real-time communication between team members.  
![Live Chat](./public/Screenshot%202025-09-15%20201351.png)

### 📊 Analytics Dashboard
Productivity insights powered by **Chart.js**.  
![Analytics](./public//Screenshot%202025-09-15%20201034.png)

### 🤖 AI Assistant
Integrated assistant using Gemini APIs for intelligent feedback & support.  
![AI Assistant](./public/Screenshot%202025-09-15%20201445.png)

### 📝 Feedback System
Collect structured team feedback via AI.  
![Feedback](./public//Screenshot%202025-09-15%20201518.png)

### 🖊️ Whiteboarding
Collaborative whiteboard built using the **Canvas API**.  
![Whiteboard](./public/Screenshot%202025-09-15%20201543.png)

### 🔐 Authentication
Secure login/signup with **OAuth (Google & GitHub)**.  
![Authentication](./public/Screenshot%202025-09-15%20201603.png)


---

## 🛠️ Tech Stack
- **Frontend**: Next.js, React, Tailwind CSS  
- **Backend**: Node.js + Express (or Nest/your choice)  
- **Database**: MongoDB / PostgreSQL (your choice)  
- **Realtime**: Socket.IO  
- **Charts**: Chart.js (via react-chartjs-2) :contentReference[oaicite:2]{index=2}  
- **AI**: Gemini APIs (assistant & feedback)  
- **Whiteboard**: Canvas API (HTML5)  
- **Auth**: OAuth (Google, GitHub) — e.g., NextAuth.js or custom OAuth flow  
- **Deployment**: Vercel (frontend) + Render/Heroku/DigitalOcean (backend) / Docker

---

## 🏗️ System Architecture (high-level)
1. **Client (Next.js)**  
   - Auth via OAuth (Google/GitHub)  
   - Realtime Socket.IO client for chat & updates  
   - Canvas-based whiteboard component (synchronizes strokes via sockets)  
   - Dashboard using Chart.js for productivity visuals  

2. **API Server (Node/Express)**  
   - REST / GraphQL endpoints for projects, tasks, profiles, and notifications  
   - Socket.IO server for chat and whiteboard sync  
   - Gemini API proxy for AI assistant/feedback (keep key server-side)

3. **Database**  
   - Users, Teams, Projects, Tasks, Messages, Whiteboard sessions, Analytics events

4. **Third-party**  
   - OAuth providers (Google, GitHub)  
   - Gemini APIs for AI features  
   - (Optional) Push notification service (FCM / OneSignal) for mobile/web push

---

## ⚙️ Environment & Setup

> Put these env vars in a `.env` (or in your hosting dashboard). Replace placeholder values.

```bash
# Server
PORT=4000
DATABASE_URL=mongodb+srv://<user>:<pass>@cluster.mongodb.net/workmanager
JWT_SECRET=your_jwt_secret_here

# OAuth (Google & GitHub)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_URL=http://localhost:3000    # if using NextAuth

# Gemini / AI
GEMINI_API_KEY=sk-your_gemini_key_here

# Chart/Analytics (if needed)
ANALYTICS_API_KEY=your_analytics_key
