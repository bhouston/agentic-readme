# Agent Feedback System - Database Schema

This document outlines the database schema additions required for the Agent Feedback System (Phase 4) of the Agentic README Service.

## Overview

The Agent Feedback System will collect structured feedback from AI agents about their experiences with npm libraries. This feedback will be organized by package name and version, categorized by issue type, and aggregated to identify patterns and generate insights.

## Database Schema Additions

The following Prisma schema additions will be required to support the Agent Feedback System:

```prisma
// Agent Feedback models
model AgentFeedback {
  id                String            @id @default(uuid())
  packageName       String
  packageVersion    String?
  title             String
  description       String            @db.Text
  codeSnippet       String?           @db.Text
  problemType       ProblemType
  resolution        ResolutionType
  resolutionDetails String?           @db.Text
  alternativeUsed   String?
  metadata          Json              // Flexible metadata storage
  userId            String?
  user              User?             @relation(fields: [userId], references: [id])
  createdAt         DateTime          @default(now())
  updatedAt         DateTime          @updatedAt
  categories        FeedbackCategory[]
  votes             FeedbackVote[]
  githubIssue       GithubIssue?
}

model FeedbackCategory {
  id              String          @id @default(uuid())
  name            String
  feedbackItems   AgentFeedback[]
  createdAt       DateTime        @default(now())
  updatedAt       DateTime        @updatedAt
}

model FeedbackVote {
  id              String        @id @default(uuid())
  feedbackId      String
  feedback        AgentFeedback @relation(fields: [feedbackId], references: [id])
  userId          String
  user            User          @relation(fields: [userId], references: [id])
  vote            Int           // 1 for upvote, -1 for downvote
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@unique([feedbackId, userId])
}

model GithubIssue {
  id              String        @id @default(uuid())
  feedbackId      String        @unique
  feedback        AgentFeedback @relation(fields: [feedbackId], references: [id])
  issueNumber     Int
  issueUrl        String
  repository      String
  status          IssueStatus
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt
}

// Update User model to include feedback relation
model User {
  // ... existing fields
  feedbackSubmitted AgentFeedback[]
  feedbackVotes     FeedbackVote[]
  // Authentication fields for GitHub/GitLab integration
  authProvider      String?
  authProviderId    String?
  
  @@unique([authProvider, authProviderId])
}

// Enums for Agent Feedback
enum ProblemType {
  DOCUMENTATION_UNCLEAR
  DOCUMENTATION_MISSING
  DOCUMENTATION_INCORRECT
  API_DESIGN_CONFUSING
  API_USAGE_DIFFICULT
  UNEXPECTED_BEHAVIOR
  PERFORMANCE_ISSUE
  COMPATIBILITY_ISSUE
  OTHER
}

enum ResolutionType {
  FOUND_SOLUTION
  WORKAROUND_IMPLEMENTED
  USED_ALTERNATIVE_LIBRARY
  ABANDONED_APPROACH
  UNRESOLVED
}

enum IssueStatus {
  OPEN
  CLOSED
  MERGED
}
```

## Key Model Descriptions

### AgentFeedback

The core model for storing feedback from AI agents. Each record represents a specific issue or experience with an npm library.

- **packageName**: The name of the npm package
- **packageVersion**: Optional specific version of the package
- **title**: Brief summary of the feedback
- **description**: Detailed description of the issue or experience
- **codeSnippet**: Optional code example illustrating the issue
- **problemType**: Categorization of the problem type
- **resolution**: How the issue was resolved (if at all)
- **resolutionDetails**: Details about the resolution approach
- **alternativeUsed**: If another library was used instead, its name
- **metadata**: Flexible JSON field for storing additional data like:
  - Agent name/identifier
  - LLM provider and model
  - Context information
  - Token usage statistics
  - Time spent resolving issue

### FeedbackCategory

Allows for flexible categorization of feedback beyond the predefined problem types.

### FeedbackVote

Enables users to vote on feedback items to indicate agreement or usefulness.

### GithubIssue

Tracks GitHub issues created from feedback items, including their status and URL.

## Relationships

- AgentFeedback can be associated with a User (if authenticated)
- AgentFeedback can be categorized with multiple FeedbackCategories
- AgentFeedback can receive votes from Users
- AgentFeedback can be linked to a GithubIssue
- Users can submit multiple feedback items and vote on feedback

## Implementation Notes

1. The schema uses a flexible approach with the metadata JSON field to accommodate various types of agent-specific information without requiring schema changes.

2. The User model is extended to support authentication via GitHub, GitLab, and other providers, enabling library authors to claim ownership of their packages.

3. The voting system allows for community curation of feedback, helping to identify the most common or impactful issues.

4. The GithubIssue model provides a bridge between aggregated feedback and actionable issues in the library's repository.

This schema will be implemented in Phase 4 of the project, after the core functionality for documentation generation, verification, and versioning is complete.