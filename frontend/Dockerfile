# Build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine
# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copy built app
COPY --from=build /app/build /usr/share/nginx/html

# Nginx needs to run as root in Alpine
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]