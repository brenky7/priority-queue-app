# Build stage for backend
FROM node:20-alpine AS backend-builder
WORKDIR /app/backend
COPY backend/package.json backend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY backend/ ./
RUN yarn build

# Build stage for frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package.json frontend/yarn.lock ./
RUN yarn install --frozen-lockfile
COPY frontend/ ./
RUN yarn build

# Production stage
FROM node:20-alpine
WORKDIR /app
# Copy backend build and dependencies
COPY --from=backend-builder /app/backend/dist ./dist
COPY --from=backend-builder /app/backend/package.json ./
RUN yarn install --frozen-lockfile --production
# Copy frontend build
COPY --from=frontend-builder /app/frontend/dist ./public
# Create .env for production if not mounting externally
COPY .env.example .env
EXPOSE 5050
CMD ["yarn", "start"]