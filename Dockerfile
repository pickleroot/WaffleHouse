# ========================================
# Stage 1: Build the React/Vite Frontend
# ========================================

FROM node:22-alpine AS frontend-builder

WORKDIR /app/frontend

ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL

ARG VITE_SUPABASE_URL
ENV VITE_SUPABASE_URL=$VITE_SUPABASE_URL

ARG VITE_SUPABASE_PUBLISHABLE_KEY
ENV VITE_SUPABASE_PUBLISHABLE_KEY=$VITE_SUPABASE_PUBLISHABLE_KEY

COPY frontend/package.json frontend/package-lock.json* ./
RUN npm ci || npm install

COPY frontend/ .
RUN npm run build

# ========================================
# Stage 2: Build the Java/Gradle Backend
# ========================================

FROM gradle:8.7-jdk21-alpine AS backend-builder

WORKDIR /app/backend

COPY backend/gradlew backend/build.gradle backend/settings.gradle* ./
COPY backend/gradle/ ./gradle/
COPY backend/src/ ./src/

RUN gradle installDist --no-daemon

# ========================================
# Stage 3: Final Runtime Image
# ========================================

FROM eclipse-temurin:21-jre-alpine

# Install Nginx and supervisord (to run both processes)
RUN apk add --no-cache nginx supervisor

WORKDIR /app

# Copy the built backend
COPY --from=backend-builder /app/backend/build/install/backend/ ./backend/

# Copy the built frontend into Nginx's html directory
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Add Nginx config to proxy /api calls to the backend
COPY nginx.conf /etc/nginx/nginx.conf

# Add supervisord config to manage both processes
COPY supervisord.conf /etc/supervisord.conf

EXPOSE 80

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisord.conf"]