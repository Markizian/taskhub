FROM node:20-alpine AS deps
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci


# ===== builder =====
FROM node:20-alpine AS builder
WORKDIR /app

# Build-time args
ARG MONGODB_URI
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

ENV NODE_ENV=production
ENV MONGODB_URI=${MONGODB_URI}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV AUTH_SECRET=${NEXTAUTH_SECRET}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ===== runner =====
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3000

# Runtime args
ARG MONGODB_URI
ARG NEXTAUTH_SECRET
ARG NEXTAUTH_URL

ENV MONGODB_URI=${MONGODB_URI}
ENV NEXTAUTH_SECRET=${NEXTAUTH_SECRET}
ENV NEXTAUTH_URL=${NEXTAUTH_URL}
ENV AUTH_SECRET=${NEXTAUTH_SECRET}

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

CMD ["npm", "run", "start"]