FROM node:22-alpine

WORKDIR /app

# Set environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
ENV DATABASE_URL="file:./db/custom.db"

# Copy package files and install
COPY package.json bun.lock ./
RUN npm install

# Copy source and build
COPY . .
RUN npx prisma generate
RUN npm run build

# Copy public and .next/static
COPY --chown=node:node public ./public
COPY --chown=node:node .next/static .next/static

# Create directory for database
RUN mkdir -p db

USER node

EXPOSE 3000

CMD ["npm", "start"]
