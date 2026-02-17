# Stage 1: Build the SPA
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time env vars (passed via docker-compose build args)
# SERVICE_URL_LOGTO may be comma-separated: "https://auth.example.com,https://admin.example.com"
# We extract only the first URL for the frontend auth endpoint.
ARG SERVICE_URL_LOGTO=""
ARG VITE_LOGTO_APP_ID=""
ARG VITE_LOGTO_API_RESOURCE=""

# Parse first URL from SERVICE_URL_LOGTO and run the build
RUN export VITE_LOGTO_ENDPOINT=$(echo "$SERVICE_URL_LOGTO" | cut -d',' -f1 | tr -d ' ') && \
    export VITE_LOGTO_APP_ID="$VITE_LOGTO_APP_ID" && \
    export VITE_LOGTO_API_RESOURCE="$VITE_LOGTO_API_RESOURCE" && \
    echo "Building with VITE_LOGTO_ENDPOINT=$VITE_LOGTO_ENDPOINT" && \
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
