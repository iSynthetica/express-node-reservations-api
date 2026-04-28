FROM node:20-slim AS builder

WORKDIR /app

RUN corepack enable
RUN apt-get update && apt-get install -y --no-install-recommends python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
RUN npm rebuild better-sqlite3 --build-from-source

COPY tsconfig.json ./
COPY src ./src
RUN pnpm build
RUN HUSKY=0 pnpm prune --prod --ignore-scripts

FROM node:20-slim AS runtime

WORKDIR /app

RUN corepack enable

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY data ./data

ENV NODE_ENV=production
ENV PORT=3200

EXPOSE 3200

CMD ["node", "dist/index.js"]
