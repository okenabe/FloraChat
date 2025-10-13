# Garden Catalog - AI Plant Assistant

## Overview

An intelligent conversational chatbot application that helps users catalog plants in their garden beds. The system identifies plants from photos, understands natural language descriptions, and extracts structured data from casual conversation to maintain a comprehensive garden database.

**Core Functionality:**
- AI-powered plant identification from photos
- Natural language conversation interface for plant cataloging
- Garden bed and plant management
- Persistent conversation history
- Responsive design with mobile-first approach

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System:**
- React 18 with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for lightweight client-side routing
- TanStack Query (React Query) for server state management and caching

**UI Component System:**
- Radix UI primitives for accessible, unstyled components
- shadcn/ui component library (New York style variant)
- Tailwind CSS for utility-first styling with custom design tokens
- Class Variance Authority (CVA) for component variant management

**Design System:**
- Nature-inspired color palette with garden green primary colors
- Custom CSS variables for light/dark theme support
- Typography: Inter (primary), Raleway (display), JetBrains Mono (monospace)
- Mobile-first responsive design with bottom navigation for small screens

**State Management:**
- React Context for user authentication/session state
- TanStack Query for server state, caching, and data fetching
- Local component state with React hooks
- localStorage for user persistence

### Backend Architecture

**Server Framework:**
- Express.js with TypeScript for type-safe API development
- Node.js runtime environment
- Custom middleware for request logging and error handling

**API Structure:**
- RESTful endpoints organized by resource:
  - `/api/users` - User management
  - `/api/beds` - Garden bed CRUD operations
  - `/api/plants` - Plant cataloging and retrieval
  - `/api/conversations` - Chat history persistence
  - `/api/identify` - Plant identification from photos

**File Upload:**
- Multer middleware for handling multipart/form-data
- Local file storage in `uploads/` directory
- Image processing for plant identification API integration

### Database Architecture

**ORM & Schema:**
- Drizzle ORM for type-safe database operations
- PostgreSQL as the primary database (Neon serverless)
- Schema-first approach with Zod validation
- Database connection pooling with @neondatabase/serverless

**Data Models:**
1. **Users Table** - User profiles with location and experience level
2. **Garden Beds Table** - Bed metadata including sun exposure, soil type, and moisture
3. **Plants Table** - Detailed plant records with identification confidence scores
4. **Conversations Table** - Chat message history and context preservation

**Database Migrations:**
- Drizzle Kit for schema migrations
- Migration files stored in `/migrations` directory
- Push-based deployment with `db:push` command

### External Dependencies

**Third-Party Services:**
- Plant Identification API (to be integrated) - For photo-based plant recognition
- Neon Database - Serverless PostgreSQL hosting
- WebSocket support via `ws` package for real-time features

**Development Tools:**
- Replit-specific plugins for development experience:
  - Runtime error overlay
  - Cartographer (dev mode only)
  - Dev banner (dev mode only)

**Authentication & Session:**
- Session management with connect-pg-simple
- User creation and persistence via localStorage
- Auto-generated demo users for MVP

**API Integration Points:**
- Plant identification endpoint (`/api/identify`) expects integration with external plant ID service
- Image upload flow: Client → Multer → Plant ID API → Database
- Response includes confidence scores and alternative plant suggestions

**Key Architectural Decisions:**

1. **Monorepo Structure**: Single repository with shared types between client and server via `@shared` path alias for type safety across the stack

2. **Type Safety**: End-to-end TypeScript with Drizzle-Zod for runtime validation matching database schema

3. **Real-time Communication**: WebSocket infrastructure prepared for future live updates and collaborative features

4. **Mobile-First UI**: Bottom navigation pattern for mobile with adaptive desktop layout using responsive breakpoints

5. **Conversation Persistence**: Chat history stored in database with JSON message format for flexible message structure

6. **Progressive Enhancement**: Core functionality works without JavaScript, enhanced with React for interactivity