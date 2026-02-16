# Stage 1: Build the SPA
FROM node:22-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Build-time env vars (passed via docker-compose build args)
ARG VITE_PAGE_PASSWORD=""
ARG VITE_ADMIN_JWT=""
ENV VITE_PAGE_PASSWORD=$VITE_PAGE_PASSWORD
ENV VITE_ADMIN_JWT=$VITE_ADMIN_JWT

RUN npm run build

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
