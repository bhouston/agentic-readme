# @agentic-readme/analyzer

Package analyzer job for the Agentic README Service. This package runs as a Google Cloud Run Job to analyze npm packages and generate README files.

## Features

- Fetches package data from npmjs.com
- Analyzes source code to extract key information
- Stores analysis results in the database
- Runs as a standalone job in Google Cloud Run Jobs

## Development

```bash
# Install dependencies
pnpm install

# Build the package
pnpm build

# Run locally
pnpm start
```

## Environment Variables

- `PACKAGE_NAME` - Name of the package to analyze
- `PACKAGE_VERSION` - (Optional) Version of the package to analyze
- `JOB_ID` - (Optional) ID of the job
- `DATABASE_URL` - PostgreSQL connection string
- `GOOGLE_CLOUD_PROJECT` - Google Cloud project ID
- `GOOGLE_APPLICATION_CREDENTIALS` - Path to Google Cloud credentials file