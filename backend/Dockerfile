# Build frontend
FROM node:20-alpine as frontend_build
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ .
RUN npm run build

# Build backend
FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim

WORKDIR /app

# Enable bytecode compilation
ENV UV_COMPILE_BYTECODE=1

# Copy project definition
COPY backend/pyproject.toml backend/uv.lock ./

# Install dependencies
RUN uv sync --frozen --no-install-project

# Copy project source
COPY backend/ .

# Copy frontend static files
COPY --from=frontend_build /app/frontend/dist /app/static

# Install project
RUN uv sync --frozen

# Place executables in the environment at the front of the path
ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

# Run migrations (retry while the managed DB wakes up) and start the server.
CMD ["sh", "-c", "for i in $(seq 1 30); do alembic upgrade head && break || (echo 'DB not ready, retrying in 2s...'; sleep 2); done; uvicorn main:app --host 0.0.0.0 --port ${PORT:-8000}"]
