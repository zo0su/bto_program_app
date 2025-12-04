FROM node:18-alpine

WORKDIR /app

# Docker CLI 설치 (judge engine을 위한)
RUN apk add --no-cache docker-cli

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

CMD ["node", "server.js"]

