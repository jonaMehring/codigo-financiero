# ---------- Build (client + server deps) ----------
FROM node:20-alpine AS build
WORKDIR /app

# Copiamos package manifests primero para cache
COPY package.json ./
COPY client/package.json ./client/package.json
COPY server/package.json ./server/package.json

# Instalamos dependencias (sin npm ci)
RUN npm install
RUN npm --prefix client install
RUN npm --prefix server install

# Copiamos el código
COPY client ./client
COPY server ./server

# Build del client
RUN npm --prefix client run build

# ---------- Runtime ----------
FROM node:20-alpine AS runtime
WORKDIR /app

ENV NODE_ENV=production

# Copiamos server y el build del client
COPY --from=build /app/server ./server
COPY --from=build /app/client/dist ./client/dist

# Instalamos solo deps del server para runtime
COPY server/package.json ./server/package.json
RUN npm --prefix server install --omit=dev

EXPOSE 3000

CMD ["node", "server/index.js"]
