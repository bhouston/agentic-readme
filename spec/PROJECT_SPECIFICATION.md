# Agentic README Service - Project Specification

This document outlines the requirements and specifications for the Agentic README Service project. It is divided into two sections:
1. **User Instructions** - Direct requirements provided by the user
2. **Inferred Requirements** - Requirements inferred from user instructions and discussions

This specification should be maintained and updated as the project evolves and additional requirements are identified.

## User Instructions

### Project Purpose

Create an on-demand agentic-friendly README.md-like documentation service for existing npm libraries that don't have quality documentation. The service will:

1. Explore the library, read its code and existing documentation
2. Create a README.md that meets the requirements outlined in the blog post
3. Progressively enhance the documentation to be LLM-friendly
4. Base documentation on library contents and verify its accuracy

### Development Phases

#### Phase 1: Basic Documentation Generation
- Read files directly from npmjs.com
- Analyze library code and existing documentation
- Generate AI-friendly README.md files

#### Phase 2: Sandbox Verification
- Install npm libraries in a sandbox environment
- Verify assumptions by actually using the library
- Enhance/correct the auto-created README.md based on findings

#### Phase 3: Versioned Documentation
- Provide version-specific documentation
- Progressively enhance documentation to be LLM-friendly
- Verify documentation against specific versions

#### Phase 4: Agent Feedback System
- Collect structured feedback from AI agents about npm libraries
- Organize feedback by package name and version
- Aggregate solutions to common problems
- Provide insights to library authors
- Generate suggested improvements for documentation and APIs

### Technical Requirements

- Implement as TypeScript on Node.js
- Use NextJS as the web framework with App Router and src directory
- Use Prisma for database abstraction
- Use PostgreSQL hosted on Google Cloud
- Host on Cloud Run
- Run agentic coder processes as Cloud Run jobs
- Implement as a Model Context Protocol server
- Create human-usable website interface

### Infrastructure

- Google Cloud project name: agentic-readme
- GitHub repository name: agentic-readme
- Two separate environments:
  - Preview (main branch)
  - Production (production branch)
- Two separate Cloud SQL PostgreSQL instances (minimum tier with SSDs)
- Deploy using Docker with GitHub Actions
- Single Next.js app for both user-facing site and API

## Inferred Requirements

### Documentation Standards

Based on the blog post, the generated README.md files should include:

1. **Clearly Stated Purpose** - Define what the library does and how it differs from alternatives
2. **Concise Yet Comprehensive** - Provide structured overview without overwhelming detail
3. **Fully Versioned** - Ensure documentation matches the library version precisely
4. **Essential Components**:
   - Purpose and Philosophy
   - Installation instructions
   - Core Concepts
   - Quick Start Example
   - Usage Patterns & Best Practices
   - API Overview
   - Integration Guide
   - Troubleshooting
   - Links to Versioned Documentation

### Architecture

1. **Backend Services**:
   - Package Analyzer: Fetches and analyzes npm package code
   - Documentation Generator: Creates structured README files
   - Verification System: Tests documentation claims
   - Version Manager: Tracks and compares multiple versions

2. **Database Structure**:
   - Store packages, versions, and generated documentation
   - Track verification status and results
   - Manage user requests and authentication

3. **API Structure**:
   - REST API for human consumption
   - Model Context Protocol endpoint for AI agents
   - Health monitoring endpoints

4. **User Interface**:
   - Search interface for finding packages
   - Documentation display with version selection
   - Request form for generating new documentation

### Security & Performance

1. **Security**:
   - Sandbox isolation for package testing
   - Rate limiting for API requests
   - Secure database access

2. **Performance**:
   - Optimize for fast documentation retrieval
   - Cache frequently accessed documentation
   - Efficient storage of versioned documentation

### Monitoring & Maintenance

1. **Monitoring**:
   - Track documentation generation jobs
   - Monitor service health and performance
   - Log user requests and errors

2. **Maintenance**:
   - Update documentation as libraries evolve
   - Improve documentation generation algorithms
   - Enhance verification techniques

### Future Extensions

1. **Potential Enhancements**:
   - Support for more package managers (beyond npm)
   - Interactive documentation examples
   - User feedback and corrections
   - Integration with IDE plugins
   - Documentation quality scoring
   - Expanded agent feedback collection for non-npm libraries
   - Integration with other developer tools and ecosystems

### Agent Feedback System

1. **Purpose**:
   - Collect structured feedback from AI agents about their experiences with npm libraries
   - Aggregate common issues and solutions to improve documentation
   - Provide insights to library authors without overwhelming them with individual reports
   - Create a knowledge base of agent experiences to improve future interactions

2. **Feedback Collection**:
   - Capture detailed information about agent interactions with libraries
   - Record specific issues encountered and their resolution (or lack thereof)
   - Document workarounds and alternative approaches
   - Track metadata about the agent, model, and context

3. **Data Structure**:
   - Organize feedback by package name and version
   - Categorize issues by type (documentation, API design, bugs, usability)
   - Track resolution methods and effectiveness
   - Maintain metadata about feedback sources

4. **Integration Points**:
   - API endpoints for agents to submit feedback
   - User authentication via GitHub, GitLab, or other identity providers
   - Connection to GitHub issues for important bug reports
   - Dashboard for library authors to view aggregated feedback

5. **Analysis and Reporting**:
   - Summarize common issues using LLMs
   - Generate suggested improvements for documentation
   - Identify patterns across libraries and versions
   - Provide actionable insights to library authors

---

This specification will be maintained and updated as the project evolves and additional requirements are identified or clarified.