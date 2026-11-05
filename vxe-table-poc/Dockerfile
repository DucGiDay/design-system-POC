# WORKSPACE = site-dev | site-staging | site-product (chọn file .env.* khi build)
FROM node:22-alpine AS builder
ARG WORKSPACE=site-dev
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build:${WORKSPACE}

FROM nginx:stable-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
