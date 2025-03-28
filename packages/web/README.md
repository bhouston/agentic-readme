# @agentic-readme/web

Web application for the Agentic README Service.

## Features

- Next.js web application
- API endpoints for package analysis
- User interface for viewing and requesting README files
- Model Context Protocol (MCP) server for AI consumption

## Development

```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start
```

## API Endpoints

- `GET /api/packages` - List packages
- `POST /api/packages` - Request README generation for a package
- `GET /api/packages/:name` - Get package details
- `GET /api/health` - Health check endpoint
- `POST /api/mcp` - Model Context Protocol endpoint