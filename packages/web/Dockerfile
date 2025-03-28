# Use Node.js LTS as the base image
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json files for all workspaces
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/web/package.json ./packages/web/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the source code
COPY packages/shared ./packages/shared
COPY packages/web ./packages/web

# Build shared package first
RUN pnpm --filter @agentic-readme/shared build

# Build web package
RUN pnpm --filter @agentic-readme/web build

# Set environment variables
ENV NODE_ENV=production
ENV PORT=8080

# Expose the port
EXPOSE 8080

# Run the web server
CMD ["pnpm", "--filter", "@agentic-readme/web", "start"]