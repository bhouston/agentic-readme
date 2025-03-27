# Agentic README Service Development Plan

## Project Overview

The Agentic README Service is designed to automatically generate high-quality, AI-friendly README files for npm libraries. The service will analyze packages, understand their functionality, and create comprehensive documentation that follows best practices outlined in our [blog post](./blog-post.md).

## Development Phases

### Phase 1: Basic Documentation Generation

In this initial phase, the service will:
- Fetch and analyze npm package source code and existing documentation
- Generate a comprehensive README.md that follows AI-friendly documentation principles
- Focus on static analysis without executing the code
- Provide a basic web interface and API

#### Key Components:
1. **Package Analyzer**: Fetches package data from npmjs.com and parses source files
2. **Documentation Generator**: Creates structured README files based on analysis
3. **Web Interface**: Simple UI for requesting and viewing generated documentation
4. **API Endpoints**: Basic endpoints for programmatic access

### Phase 2: Sandbox Verification

This phase enhances the service with:
- Secure sandbox environment for package installation and testing
- Verification of documentation claims through actual code execution
- Correction and enhancement of documentation based on runtime behavior
- Improved web interface with documentation preview and editing capabilities

#### Key Components:
1. **Secure Sandbox**: Isolated environment for safely installing and testing npm packages
2. **Test Generator**: Creates test cases to verify functionality claims
3. **Documentation Verifier**: Compares documented behavior with actual behavior
4. **Enhanced Documentation Generator**: Updates documentation based on verification results

### Phase 3: Versioned Documentation

The final phase introduces:
- Version-specific documentation for different releases of the same package
- Differential analysis between versions to highlight changes
- Full implementation of Model Context Protocol for AI consumption
- Advanced UI with version comparison and navigation
- Comprehensive analytics on documentation quality and usage

#### Key Components:
1. **Version Manager**: Tracks and organizes multiple versions of package documentation
2. **Differential Analyzer**: Identifies and highlights changes between versions
3. **Model Context Protocol Server**: Implements the protocol for AI agent consumption
4. **Advanced Web Interface**: Version navigation, comparison, and analytics

## Technical Architecture

### Backend
- **Language/Framework**: TypeScript on Node.js
- **Web Framework**: Next.js with App Router
- **Database**: PostgreSQL on Google Cloud
- **ORM**: Prisma
- **Job Processing**: Cloud Run Jobs for agentic coding tasks
- **API**: RESTful API + GraphQL (optional for complex queries)
- **Authentication**: OAuth 2.0 (GitHub, Google)

### Frontend
- **Framework**: Next.js with React
- **Styling**: Tailwind CSS
- **State Management**: React Context API + SWR for data fetching
- **UI Components**: Headless UI + custom components

### Infrastructure
- **Hosting**: Google Cloud Run (single service for both web UI and API)
- **Database**: 
  - Google Cloud SQL (PostgreSQL) - separate instances for Preview and Production
  - Minimum tier with SSD storage for cost efficiency
- **CI/CD**: GitHub Actions with Docker builds
- **Environments**: 
  - Preview (main branch) - for testing and development
  - Production (production branch) - for stable releases
- **Monitoring**: Google Cloud Monitoring + custom analytics

## Database Schema (Prisma)

```prisma
// Core models
model Package {
  id           String   @id @default(uuid())
  name         String
  description  String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  versions     PackageVersion[]
  
  @@unique([name])
}

model PackageVersion {
  id           String   @id @default(uuid())
  version      String
  packageId    String
  package      Package  @relation(fields: [packageId], references: [id])
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  readme       Readme?
  verifications Verification[]
  
  @@unique([packageId, version])
}

model Readme {
  id              String   @id @default(uuid())
  packageVersionId String   @unique
  packageVersion   PackageVersion @relation(fields: [packageVersionId], references: [id])
  content         String
  verified        Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  generationJobId String?
  verificationJobId String?
}

model Verification {
  id              String   @id @default(uuid())
  packageVersionId String
  packageVersion   PackageVersion @relation(fields: [packageVersionId], references: [id])
  status          VerificationStatus
  results         Json
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  jobId           String?
}

enum VerificationStatus {
  PENDING
  RUNNING
  SUCCEEDED
  FAILED
}

// User models
model User {
  id           String   @id @default(uuid())
  email        String   @unique
  name         String?
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
  requests     Request[]
}

model Request {
  id           String   @id @default(uuid())
  userId       String
  user         User     @relation(fields: [userId], references: [id])
  packageName  String
  version      String?
  status       RequestStatus
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum RequestStatus {
  PENDING
  PROCESSING
  COMPLETED
  FAILED
}
```

## API Endpoints

### REST API

- `GET /api/packages` - List all packages
- `GET /api/packages/:name` - Get package details
- `GET /api/packages/:name/versions` - List all versions of a package
- `GET /api/packages/:name/versions/:version` - Get specific version details
- `GET /api/packages/:name/versions/:version/readme` - Get README for specific version
- `POST /api/packages` - Request README generation for a package
- `POST /api/packages/:name/versions/:version/verify` - Request verification of a README

### Model Context Protocol Endpoints

- `/mcp` - Model Context Protocol endpoint

## Implementation Plan

### Phase 1 Implementation (4-6 weeks)

#### Week 1-2: Setup and Core Infrastructure
- Set up project repository and infrastructure
- Implement database schema and migrations
- Create basic Next.js application structure
- Implement authentication system
- Set up CI/CD pipelines

#### Week 3-4: Package Analysis and README Generation
- Implement package fetching from npmjs.com
- Create source code analyzer
- Develop documentation generator
- Build basic web interface

#### Week 5-6: API and Testing
- Implement REST API endpoints
- Create unit and integration tests
- Perform security review
- Deploy preview environment

### Phase 2 Implementation (6-8 weeks)

#### Week 1-2: Sandbox Environment
- Create secure sandbox for package installation
- Implement package testing infrastructure
- Develop test case generator

#### Week 3-5: Verification System
- Build documentation verification system
- Enhance README generator with verification results
- Implement job scheduling and monitoring

#### Week 6-8: Enhanced Web Interface
- Create documentation preview and editing UI
- Implement user dashboard
- Add analytics and monitoring
- Deploy to production

### Phase 3 Implementation (8-10 weeks)

#### Week 1-3: Version Management
- Implement version tracking system
- Create differential analyzer
- Build version comparison UI

#### Week 4-6: Model Context Protocol
- Implement Model Context Protocol server
- Create AI-specific endpoints and responses
- Develop protocol documentation

#### Week 7-10: Advanced Features and Optimization
- Add advanced analytics
- Optimize performance
- Enhance security
- Final production deployment

## Monitoring and Maintenance

- Implement comprehensive logging
- Set up error tracking and alerting
- Create usage analytics dashboard
- Establish regular security audits
- Plan for ongoing improvements based on user feedback

## Conclusion

This development plan outlines a phased approach to building the Agentic README Service. Each phase builds upon the previous one, allowing for incremental delivery of value while managing complexity. The service will ultimately provide a valuable tool for both human developers and AI coding assistants to better understand and utilize npm libraries through high-quality, verified documentation.