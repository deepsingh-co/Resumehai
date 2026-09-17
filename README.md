# Resumehai

Resumehai is an AI-powered resume platform focused on creating professional, ATS-friendly, and job-specific resumes.

## Repository Structure

- `resume-builder/` — Full-stack MERN resume builder application
- `docs/` — Product, architecture, database, API, and user flow documentation

## Key Features

- AI-assisted resume content generation and optimization
- Resume editor with live preview
- Multiple resume templates
- ATS analysis and job description matching
- PDF export

## Getting Started

1. Go to the app directory:
   ```bash
   cd resume-builder
   ```
2. Install dependencies:
   ```bash
   npm run install:all
   ```
3. Configure environment:
   ```bash
   cp .env.example .env
   ```
4. Run the app:
   ```bash
   npm run dev
   ```

Frontend runs at `http://localhost:3000` and backend at `http://localhost:5000`.

## Additional Documentation

- [Application README](./resume-builder/README.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [API](./docs/API.md)
- [Database](./docs/DATABASE.md)
- [Product Requirements](./docs/PRD.md)
- [User Flow](./docs/USER_FLOW.md)