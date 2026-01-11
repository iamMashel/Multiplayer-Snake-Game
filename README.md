# 🐍 Vibe Coding Snake Game

![Build Status](https://github.com/iamMashel/vibe-coding-snake/actions/workflows/ci-cd.yml/badge.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.12+-blue.svg)
![TypeScript](https://img.shields.io/badge/typescript-5.0+-blue.svg)

A modern, mobile-optimized reimplementation of the classic Snake game. Built with a focus on "vibe," responsiveness, and real-time multiplayer features.

**[Play Live Demo](https://vibe-coding-snake.onrender.com)**

---

## 📸 Gameplay Preview

<!-- TODO: Upload a gameplay video or GIF and replace the link below -->
![Gameplay Demo](docs/demo-placeholder.gif)

<!-- TODO: Add screenshots of Desktop and Mobile views here -->
<p align="center">
  <img src="docs/mobile-screenshot-placeholder.png" width="300" alt="Mobile View" />
  <img src="docs/desktop-screenshot-placeholder.png" width="500" alt="Desktop View" />
</p>

## ✨ Features

- **🐍 Classic & Modern Modes**:
    - **Pass-through**: Relaxed gameplay where you warp through walls.
    - **Walls**: High-stakes mode where walls are deadly (1.5x Score Multiplier!).
- **📱 Mobile-First Design**:
    - Fully responsive `100dvh` layout (no scrolling!).
    - Custom ergonomic Touch D-Pad and Gestures.
    - "Neon Arcade" aesthetic with glassmorphism UI.
- **👀 Spectator Mode**: Live spectate other players in real-time.
- **🏆 Live Leaderboard**: Global high scores tracked via persistent database.
- **💾 Auto-Persistence**: Game state saves automatically; reload and resume right where you left off.
- **🛡️ Secure**: Secure HTTP-only cookies and robust authentication.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + Shadcn/UI + Lucide Icons
- **State**: React Query + Custom Hooks
- **Testing**: Vitest + React Testing Library

### Backend
- **API**: FastAPI (Python 3.12)
- **Database**: PostgreSQL (Production) / SQLite (Dev) + SQLAlchemy ORM
- **Migrations**: Alembic
- **Testing**: Pytest + HTTPX

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.12+)
- [uv](https://github.com/astral-sh/uv) (Fast Python package manager)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/iamMashel/vibe-coding-snake.git
   cd vibe-coding-snake
   ```

2. **Backend Setup**
   ```bash
   cd backend
   make install
   # Or manually: uv sync
   ```

3. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   ```

### Running Locally (The "Vibe" Way)

Run the entire stack with a single command from the root/frontend:

```bash
cd frontend
npm run dev
```

*   **Frontend**: http://localhost:5173
*   **Backend**: http://localhost:8000
*   **API Docs**: http://localhost:8000/docs

## 🧪 Testing

We maintain high code quality with full regression suites.

- **Frontend Tests**: `cd frontend && npm test`
- **Backend Tests**: `cd backend && make test`
- **Integration Check**: `cd backend && make verify`

## 📦 Deployment

The project is configured for seamless deployment on **Render**.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Fork this repo.
2. Click the button above.
3. Render auto-configures the Web Service and PostgreSQL database.

## 🤝 Contributing

Contributions are welcome! Please check out the [issues](https://github.com/iamMashel/vibe-coding-snake/issues) page.

1. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
2. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
3. Push to the Branch (`git push origin feature/AmazingFeature`)
4. Open a Pull Request

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.

---

*Built with ❤️ by Mashel Odera*
