# Contributing to Agentic README Service

Thank you for your interest in contributing to the Agentic README Service! This document provides guidelines and instructions for setting up your development environment and contributing to the project.

## Development Setup

### Prerequisites

- Node.js 18 or higher
- npm 9 or higher
- Git
- Docker (optional, for local containerized testing)
- Google Cloud SDK (optional, for deploying to Google Cloud)

### Local Development Environment

1. **Clone the repository**

   ```bash
   git clone https://github.com/bhouston/agentic-readme.git
   cd agentic-readme
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   Copy the example environment file and update it with your values:

   ```bash
   cp .env.example .env.local
   ```

   For local development, you can use the preview database connection string.

4. **Generate Prisma client**

   ```bash
   npm run prisma:generate
   ```

5. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will be available at [http://localhost:3000](http://localhost:3000).

### Using Docker

To build and run the application in a Docker container:

```bash
npm run docker:build
npm run docker:run
```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure

- `/src/app` - Next.js app directory
- `/src/components` - React components
- `/src/lib` - Utility functions and shared code
- `/prisma` - Prisma schema and migrations
- `/spec` - Project specification documents
- `/public` - Static assets

## Development Workflow

1. **Create a new branch for your changes**

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes and commit them**

   ```bash
   git add .
   git commit -m "Description of your changes"
   ```

3. **Push your changes to GitHub**

   ```bash
   git push origin feature/your-feature-name
   ```

4. **Create a pull request**

   Go to the [repository on GitHub](https://github.com/bhouston/agentic-readme) and create a pull request from your branch to the main branch.

## Testing

Run tests with:

```bash
npm test
```

For watch mode:

```bash
npm run test:watch
```

## Database Management

### Creating Migrations

When you make changes to the Prisma schema, create a migration:

```bash
npm run prisma:migrate
```

### Applying Migrations

To apply migrations to the database:

```bash
npm run prisma:migrate:prod
```

### Exploring the Database

To explore the database using Prisma Studio:

```bash
npm run prisma:studio
```

## CI/CD

The project uses GitHub Actions for continuous integration and deployment:

- Pushing to the `main` branch deploys to the preview environment
- Pushing to the `production` branch deploys to the production environment

Make sure all tests pass before creating a pull request.

## Project Phases

The project is divided into three phases:

1. **Phase 1: Basic Documentation Generation**
   - Package analysis and README generation
   - Basic web interface and API

2. **Phase 2: Sandbox Verification**
   - Secure sandbox for package testing
   - Verification of documentation claims

3. **Phase 3: Versioned Documentation**
   - Version-specific documentation
   - Model Context Protocol implementation

See [PLAN.md](./PLAN.md) for more details on the project roadmap.

## Additional Resources

- [PROJECT_SPECIFICATION.md](./spec/PROJECT_SPECIFICATION.md) - Project requirements
- [TECHNICAL_ARCHITECTURE.md](./spec/TECHNICAL_ARCHITECTURE.md) - Technical architecture
- [PLAN.md](./PLAN.md) - Development plan and roadmap