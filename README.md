# Agentic README Service

A service that automatically generates high-quality, AI-friendly README files for npm libraries that lack proper documentation.

## Overview

Agentic README Service analyzes npm libraries by:
1. Reading source code and existing documentation
2. Generating comprehensive, structured README files following best practices
3. Verifying assumptions through sandbox testing
4. Providing versioned, accurate documentation

The service is available as both:
- A web interface for human users
- A Model Context Protocol server for AI consumption

## Features

- **Automated Documentation Generation**: Create high-quality READMEs for any npm package
- **Sandbox Verification**: Test-driven validation of documentation claims
- **Version-Specific Documentation**: Documentation tailored to specific package versions
- **Progressive Enhancement**: Continuous improvement of documentation quality
- **AI and Human Friendly**: Optimized for both human developers and AI coding assistants

## Project Specification

The project specification is maintained in the `/spec` directory:

- [PROJECT_SPECIFICATION.md](./spec/PROJECT_SPECIFICATION.md) - Defines the project requirements, divided into:
  - **User Instructions**: Direct requirements provided by the user
  - **Inferred Requirements**: Requirements derived from user instructions

- [TECHNICAL_ARCHITECTURE.md](./spec/TECHNICAL_ARCHITECTURE.md) - Details the technical architecture:
  - System components and their implementation
  - Data flow and processing pipelines
  - Deployment architecture and infrastructure

These specification documents serve as the source of truth for the project's purpose and design. They help maintain clarity as the project evolves and ensure that all contributors understand both the explicit requirements and the reasoning behind implementation decisions.

## Development Status

This project is currently in development. See [PLAN.md](./PLAN.md) for the roadmap and development phases, and the [GitHub Issues](https://github.com/bhouston/agentic-readme/issues) for specific tasks.

### Preview Environment

A preview environment is available at:
- **URL**: [https://preview-374802729603.us-central1.run.app](https://preview-374802729603.us-central1.run.app)
- **Health Endpoint**: [https://preview-374802729603.us-central1.run.app/api/health](https://preview-374802729603.us-central1.run.app/api/health)
- **MCP Endpoint**: [https://preview-374802729603.us-central1.run.app/api/mcp](https://preview-374802729603.us-central1.run.app/api/mcp)

The preview environment is automatically updated when changes are merged into the main branch.

## License

MIT