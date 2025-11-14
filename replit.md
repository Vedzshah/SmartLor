# LOR Generator

## Overview

The LOR Generator is an AI-powered web application that transforms student achievements and academic details into professional, authentic Letters of Recommendation. The system guides users through a multi-step wizard to collect student information, questionnaire responses, and resume data, then uses OpenAI's GPT API to generate personalized, professor-written recommendation letters.

The application is built as a full-stack TypeScript project with a React frontend and Express backend, designed to prioritize clarity, trust, and efficiency in generating academic documents.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- **React 18** with TypeScript for type-safe component development
- **Vite** as the build tool and development server, configured to serve from the `client` directory
- **Wouter** for lightweight client-side routing instead of React Router
- **TanStack Query v5** for server state management, caching, and API interactions

**UI Component System**
- **shadcn/ui** component library with Radix UI primitives for accessible, composable components
- **Tailwind CSS** for utility-first styling with custom design tokens
- **Design Philosophy**: Professional academic interface following Material Design principles, emphasizing trust, clarity, and document-centric workflows
- **Custom Theme**: Neutral base color palette with configurable light/dark modes via CSS custom properties

**Form Management**
- **React Hook Form** for performant form state management
- **Zod** for schema validation with `@hookform/resolvers` integration
- Multi-step wizard pattern with progress tracking for complex data collection

**Key Frontend Patterns**
- Component composition with shadcn/ui base components
- Custom hooks for mobile detection and toast notifications
- File upload handling with drag-and-drop support for resume documents (PDF, DOC, DOCX, TXT)
- Real-time preview generation with loading states

### Backend Architecture

**Server Framework**
- **Express.js** with TypeScript for RESTful API endpoints
- **ESM modules** throughout the codebase (type: "module" in package.json)
- Custom middleware for JSON parsing, request logging, and response timing

**API Structure**
- `/api/faculty` - Faculty profile management (GET all, GET by ID, POST create)
- `/api/generate-lor` - LOR generation endpoint with multipart form data support
- File upload middleware using **Multer** with memory storage and file type validation

**Development Setup**
- **tsx** for running TypeScript directly in development
- **esbuild** for production bundling with external package handling
- Vite middleware integration for HMR and development proxy

### Data Storage Solutions

**Current Implementation**
- **In-Memory Storage** (`MemStorage` class) with Map-based data structures
- Seeded sample faculty data for development and testing
- UUID generation for entity identifiers

**Drizzle ORM Configuration**
- Schema definition in `shared/schema.ts` using Drizzle ORM
- PostgreSQL dialect configured via `drizzle.config.ts`
- Tables defined: `faculty` (profile information) and implied schema for generated LORs
- **Note**: Database is configured but not actively connected; the application currently uses in-memory storage

**Schema Design**
- **Faculty**: ID, name, designation, department, email, courses taught (array), years of experience, profile image
- **Questionnaire Responses**: Relationship details, council participation, skills, challenges, achievements, working style, LOR purpose
- **Student Profile**: Name, email, major, university, GPA, target program
- **Resume Data**: Extracted text content from uploaded files

### Authentication and Authorization

No authentication system is currently implemented. The application is designed as a utility tool without user accounts or access control.

### External Service Integrations

**OpenAI API Integration**
- **Model**: GPT-5 (configured in `server/openai.ts`)
- **Purpose**: Generate personalized Letters of Recommendation from structured student data
- **Implementation**: Custom system prompt engineering to ensure authentic professor voice, appropriate academic tone, and comprehensive coverage of student achievements
- **Prompt Strategy**: 
  - Strict rules against copying input text verbatim
  - Narrative expansion from bullet points to rich paragraphs
  - 6-paragraph structure with specific focus areas
  - Inference of missing details while maintaining authenticity
  - Avoidance of AI-generation detection language

**File Processing**
- Multer middleware for handling resume uploads
- Support for PDF, DOC, DOCX, and TXT formats with 10MB file size limit
- In-memory buffer storage for uploaded files

**Environment Configuration**
- `OPENAI_API_KEY` required for LOR generation
- `DATABASE_URL` configured but not actively used (reserved for future PostgreSQL integration)

### Development Tools & Utilities

**Type Safety**
- Shared schema definitions in `shared/schema.ts` using Drizzle Zod for consistency between client and server
- Path aliases configured: `@/` for client source, `@shared/` for shared code, `@assets/` for attached files

**Code Quality**
- TypeScript strict mode enabled
- ESM module resolution with bundler strategy
- Incremental compilation for faster rebuilds

**Replit-Specific Integrations**
- Runtime error overlay plugin for development
- Cartographer and dev banner plugins in non-production Replit environments