# Vibe Coding Snake Game

A modern Snake game with a retro aesthetic, featuring multiplayer spectator mode, leaderboards, and game persistence.
<img width="1549" height="782" alt="image" src="https://github.com/user-attachments/assets/4175166b-6ea3-4207-acb9-60ebab8c84c8" />

![Uploading image.png…]()

## Tech Stack

### Frontend
- **Framework**: React + TypeScript + Vite
- **UI**: Shadcn/ui components
- **State Management**: React Query
- **Testing**: Vitest

### Backend
- **Framework**: FastAPI (Python)
- **Package Manager**: uv
- **Testing**: pytest + httpx

## Getting Started

### Prerequisites
- Node.js (v18+)
- Python (3.12+)
- uv (Python package manager)

### Installation

#### Backend Setup
```bash
cd backend
make install  # or: uv sync
```

#### Frontend Setup
```bash
cd frontend
npm install
```

## Running the Application

### Quick Start (Recommended)
Run both frontend and backend with a single command:
```bash
npm run dev
```

### Individual Commands
If you prefer to run them separately:

#### Backend
```bash
cd backend
make dev
```

#### Frontend
```bash
cd frontend
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs

## Testing

### Backend Tests
```bash
cd backend
make test  # or: uv run pytest tests.py
```

### Frontend Tests
```bash
cd frontend
npm test
```

### API Verification (Integration Test)
```bash
cd backend
make verify  # or: uv run python verify_api.py
```

## Project Structure

```
vibe-coding-snake/
├── backend/
│   ├── src/
│   │   ├── models.py       # Pydantic models
│   │   ├── mock_db.py      # In-memory database
│   │   └── routers/        # API endpoints
│   ├── main.py             # FastAPI app
│   ├── tests.py            # Unit tests
│   ├── verify_api.py       # Integration tests
│   ├── Makefile            # Backend commands
│   └── pyproject.toml      # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # API client
│   │   ├── lib/            # Game logic
│   │   └── __tests__/      # Tests
│   └── package.json        # Node dependencies
└── openapi.yaml            # API specification
```

## Development

### Backend Commands
- `make dev` - Start development server
- `make test` - Run tests
- `make verify` - Verify API endpoints
- `make install` - Install dependencies
- `make clean` - Clean cache files
- `make help` - Show all commands

### Frontend Commands
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run lint` - Lint code

## API Documentation

The backend automatically generates interactive API documentation:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc
- **OpenAPI Spec**: `/openapi.yaml`

## Features

- 🎮 Classic Snake gameplay with two modes (Pass-through & Walls)
- 👥 Spectator mode to watch other players
- 🏆 Global leaderboard with filtering
- 💾 Game state persistence
- 🔐 User authentication
- 📱 Responsive design
- ✅ Comprehensive test coverage

## Deployment

### Deploy to Render
The easiest way to deploy this application is using Render.

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

1. Click the button above.
2. Connect your GitHub repository.
3. Render will automatically detect the `render.yaml` blueprint and set up:
   - PostgreSQL Database
   - Web Service (Frontend + Backend)

Once deployed, your application will be available at your Render URL.

## Author

**Mashel Odera**

## License

MIT
