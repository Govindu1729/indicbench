FROM node:22-alpine

WORKDIR /app

# Install bun and npm globally
RUN npm install -g bun

# Copy package files
COPY package.json ./
COPY bun.lock ./

# Install dependencies
RUN bun install

# Copy source
COPY . .

# Build with standalone output
ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# Production runtime
CMD ["node", ".next/standalone/server.js"]
