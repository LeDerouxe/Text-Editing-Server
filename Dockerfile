FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production --no-optional && npm cache clean --force

COPY . .

EXPOSE 5000 4000