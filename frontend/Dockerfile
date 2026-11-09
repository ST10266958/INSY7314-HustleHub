# syntax=docker/dockerfile:1
# ---- Stage 1: build the React app ----
FROM node:26-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
# The API address is baked into the bundle at build time (Vite reads it from VITE_API_URL).
ARG VITE_API_URL=https://localhost:5000/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

# ---- Stage 2: serve the static files with nginx (non-root) ----
FROM nginxinc/nginx-unprivileged:1.27-alpine AS runtime
# The template is rendered at start-up so the CSP can include the API origin (API_ORIGIN).
COPY nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
ENV API_ORIGIN=https://localhost:5000
EXPOSE 8080
HEALTHCHECK --interval=15s --timeout=5s --retries=5 CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
