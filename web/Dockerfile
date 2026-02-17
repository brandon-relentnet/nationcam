# Stage 1: Build the SPA
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time env vars (passed via docker-compose build args)
ARG VITE_LOGTO_ENDPOINT=""
ARG VITE_LOGTO_APP_ID=""
ARG VITE_LOGTO_API_RESOURCE=""

RUN echo "Building with VITE_LOGTO_ENDPOINT=$VITE_LOGTO_ENDPOINT" && \
    npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config
COPY --from=build /app/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built static files
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
