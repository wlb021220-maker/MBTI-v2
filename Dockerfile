FROM node:18-alpine AS build
WORKDIR /app
COPY mbti-frontend/package.json mbti-frontend/package-lock.json ./
RUN npm cache clean --force && npm install --legacy-peer-deps
COPY --chown=node:node mbti-frontend/ ./
RUN chmod +x node_modules/.bin/vite && npm run build

FROM nginx:alpine
COPY mbti-frontend/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]