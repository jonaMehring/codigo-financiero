FROM node:20-alpine

WORKDIR /app

# deps root
COPY package*.json ./
RUN npm ci

# deps client
COPY client/package*.json ./client/
RUN npm --prefix client ci

# build client
COPY client ./client
RUN npm --prefix client run build

# server
COPY server ./server

ENV NODE_ENV=production
EXPOSE 3000

CMD ["node", "server/index.js"]
