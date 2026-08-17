FROM node:20-alpine AS builder

WORKDIR /app

RUN apk add --no-cache vips-dev

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY . .

FROM node:20-alpine AS runner

WORKDIR /app

RUN apk add --no-cache vips && \
    addgroup -S app && adduser -S app -G app

ENV NODE_ENV=production
ENV PORT=3001

COPY --from=builder --chown=app:app /app/node_modules ./node_modules
COPY --from=builder --chown=app:app /app/package.json ./package.json
COPY --from=builder --chown=app:app /app/server.js ./server.js
COPY --from=builder --chown=app:app /app/db.js ./db.js
COPY --from=builder --chown=app:app /app/config ./config
COPY --from=builder --chown=app:app /app/lib ./lib
COPY --from=builder --chown=app:app /app/middleware ./middleware
COPY --from=builder --chown=app:app /app/routes ./routes
COPY --from=builder --chown=app:app /app/data.json ./data.json

RUN mkdir -p /app/uploads && chown -R app:app /app/uploads

USER app

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD wget -qO- http://localhost:3001/health || exit 1

CMD ["node", "server.js"]
