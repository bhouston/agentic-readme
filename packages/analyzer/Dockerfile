# Use Node.js LTS as the base image
FROM node:18-alpine AS base

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy package.json files for all workspaces
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml* ./
COPY packages/analyzer/package.json ./packages/analyzer/
COPY packages/shared/package.json ./packages/shared/

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy the source code
COPY packages/shared ./packages/shared
COPY packages/analyzer ./packages/analyzer

# Build shared package first
RUN pnpm --filter @agentic-readme/shared build

# Build analyzer package
RUN pnpm --filter @agentic-readme/analyzer build

# Set environment variables
ENV NODE_ENV=production

# Run the analyzer
CMD ["node", "packages/analyzer/dist/index.js"]