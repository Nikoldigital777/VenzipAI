# replit.md

## Overview

Venzip is an AI-powered compliance and cybersecurity platform designed to simplify regulatory requirements for small to mid-sized businesses. The MVP demonstrates core functionality for automated compliance workflows across ISO 27001, SOC 2, GDPR, and HIPAA frameworks. The platform features real-time compliance dashboards with visual risk mapping, AI-driven document analysis using Claude, and an intuitive user experience for non-technical compliance teams.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **React with TypeScript**: Modern component-based UI using functional components and hooks
- **Vite**: Fast build tool and development server for optimal development experience
- **Wouter**: Lightweight client-side routing solution
- **TanStack Query**: Server state management for data fetching, caching, and synchronization
- **Tailwind CSS + shadcn/ui**: Utility-first CSS framework with pre-built component library
- **Design System**: Custom Venzip brand colors with glassmorphism effects and modern visual styling

### Backend Architecture
- **Express.js**: Node.js web framework handling API routes and middleware
- **TypeScript**: Type-safe server-side development
- **Drizzle ORM**: Type-safe database operations with PostgreSQL
- **RESTful API**: Standard HTTP methods for CRUD operations on compliance resources
- **Modular Route Structure**: Organized API endpoints for auth, companies, tasks, documents, risks, and chat

### Authentication System
- **Replit Authentication**: OAuth-based authentication integrated with Replit's identity provider
- **Session Management**: PostgreSQL-backed session storage with express-session
- **Passport.js**: Authentication middleware with OpenID Connect strategy
- **Cookie-based Sessions**: Secure HTTP-only cookies with 7-day TTL

### Data Storage
- **PostgreSQL**: Primary database using Neon serverless PostgreSQL
- **Drizzle Schema**: Type-safe database schema with tables for users, companies, frameworks, tasks, documents, risks, and chat messages
- **Connection Pooling**: Neon serverless connection pooling for optimal database performance
- **Migration System**: Drizzle-kit for database schema migrations

### AI Integration
- **Anthropic Claude**: Latest Claude Sonnet 4 model for compliance analysis and chat functionality
- **Enhanced Document Analysis**: AI-powered analysis with advanced gap detection, document classification, and completeness scoring
- **Intelligent Risk Assessment**: Comprehensive risk evaluation including regulatory implications, cost estimates, and remediation timelines
- **Smart Task Prioritization**: AI-driven task prioritization considering dependencies, effort estimates, and urgency levels
- **Compliance Gap Detection**: Framework-specific gap analysis with severity assessment and remediation roadmaps
- **Advanced Recommendations**: Strategic compliance recommendations with timeline planning and success metrics
- **Context-Aware Chat**: Enhanced AI assistance with user profile awareness and personalized guidance

### File Management
- **Multer**: Multipart form data handling for document uploads
- **File Type Validation**: Support for PDF, DOC, DOCX, XLS, XLSX, and image formats
- **Size Limits**: 50MB maximum file size for uploaded documents
- **Local Storage**: Files stored in uploads directory with metadata in database

## External Dependencies

### Third-Party Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Anthropic API**: Claude AI model access for document analysis and chat features
- **Replit Authentication**: OAuth identity provider for user authentication
- **Google Cloud Storage**: File storage service (configured but not actively used in current implementation)

### Frontend Libraries
- **Radix UI**: Unstyled, accessible UI primitives for building the design system
- **React Hook Form**: Form state management with validation
- **Lucide React**: Icon library for consistent iconography
- **Class Variance Authority**: Utility for creating variant-based component APIs

### Backend Libraries
- **Express Session**: Session management middleware
- **Connect PG Simple**: PostgreSQL session store
- **Passport**: Authentication middleware
- **OpenID Client**: OAuth/OpenID Connect client implementation
- **Multer**: File upload handling
- **WebSocket (ws)**: WebSocket implementation for Neon database connections

### Development Tools
- **ESBuild**: Fast JavaScript bundler for production builds
- **PostCSS**: CSS post-processor for Tailwind CSS
- **TypeScript**: Static type checking for both frontend and backend
- **Drizzle Kit**: Database schema management and migrations