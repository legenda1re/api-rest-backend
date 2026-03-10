# ─── Stage 1 : Build ──────────────────────────────────────────
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

# ─── Stage 2 : Production ─────────────────────────────────────
FROM node:18-alpine AS production

# Sécurité : ne pas tourner en root
RUN addgroup -g 1001 -S nodejs && adduser -S nodeapp -u 1001

WORKDIR /app

# Copier uniquement les fichiers nécessaires
COPY --from=builder /app/node_modules ./node_modules
COPY --chown=nodeapp:nodejs src/ ./src/
COPY --chown=nodeapp:nodejs migrations/ ./migrations/
COPY --chown=nodeapp:nodejs scripts/ ./scripts/
COPY --chown=nodeapp:nodejs package.json ./

# Créer le dossier logs
RUN mkdir -p logs && chown nodeapp:nodejs logs

USER nodeapp

EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget -qO- http://localhost:3000/api/v1/health || exit 1

CMD ["node", "src/app.js"]
