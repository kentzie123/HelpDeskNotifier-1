# HelpDesk Management System

## Overview

This is a modern full-stack helpdesk/customer support management system built using Express.js backend with a React frontend. The application provides comprehensive ticket management, user administration, notifications, knowledge base, and reporting capabilities.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Build Tool**: Vite for development and build processes

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Runtime**: Node.js 20
- **API Style**: RESTful API endpoints
- **Error Handling**: Centralized error middleware
- **Development**: Hot reload with tsx for TypeScript execution

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM
- **Database Provider**: Neon Database (serverless PostgreSQL)
- **Schema Management**: Drizzle Kit for migrations and schema management
- **In-Memory Storage**: MemStorage class for development/testing (fallback implementation)

## Key Components

### Core Entities
1. **Users**: Admin, agent, and customer roles with authentication
2. **Tickets**: Support tickets with status tracking, priority levels, and assignment
3. **Notifications**: Real-time notification system for users
4. **Knowledge Articles**: Searchable knowledge base with categories and ratings

### Frontend Pages
- **Dashboard**: Overview with ticket statistics and recent activity
- **Tickets**: Full ticket management with search, filtering, and CRUD operations
- **Users**: User management and role administration
- **Notifications**: Notification center with read/unread status
- **Knowledge Base**: Article management with search and categorization
- **Reports**: Analytics and reporting with date range filtering
- **Settings**: User preferences and system configuration

### Backend API Endpoints
- `/api/user` - Current user information
- `/api/users` - User management endpoints
- `/api/tickets` - Ticket CRUD operations
- `/api/notifications` - Notification management
- `/api/knowledge-articles` - Knowledge base operations
- `/api/reports` - Analytics and reporting data

## Data Flow

1. **Client Requests**: React components use TanStack Query for API calls
2. **API Layer**: Express.js routes handle HTTP requests with validation
3. **Business Logic**: Storage interface abstracts data operations
4. **Data Persistence**: Drizzle ORM manages PostgreSQL interactions
5. **Response**: JSON responses with proper error handling and status codes

## External Dependencies

### Database
- **Neon Database**: Serverless PostgreSQL hosting
- **Drizzle ORM**: Type-safe database operations with schema migrations

### UI Components
- **Radix UI**: Accessible component primitives
- **Lucide Icons**: Icon library for consistent iconography
- **Tailwind CSS**: Utility-first CSS framework

### Development Tools
- **Vite**: Build tool with hot module replacement
- **TypeScript**: Type safety across frontend and backend
- **ESBuild**: Fast JavaScript bundler for production builds

## Deployment Strategy

### Production Build
- Frontend: Vite builds to `dist/public` directory
- Backend: ESBuild bundles server code to `dist/index.js`
- Static files: Served from the Express server in production

### Environment Configuration
- Development: `npm run dev` - concurrent frontend/backend development
- Production: `npm run build && npm run start` - optimized production build
- Database: Migrations managed via `npm run db:push`

### Hosting
- **Platform**: Replit with autoscale deployment
- **Port Configuration**: Port 5000 for development, port 80 for production
- **Static Assets**: Served via Express with Vite integration in development

## Recent Changes
- June 25, 2025: Added comprehensive ticket comment system with internal/external comments and delete functionality
- June 25, 2025: Implemented ticket rating system for resolved tickets with star ratings and feedback
- June 25, 2025: Created additional sample tickets including resolved ones with existing ratings and comments
- June 25, 2025: Enhanced ticket details page with full comment thread and rating display
- June 25, 2025: Enhanced Settings page with comprehensive profile management, password change, notifications, security, and preferences
- June 25, 2025: Added detailed user analytics and performance tracking to Reports section
- June 25, 2025: Implemented user performance rankings with comparative metrics and insights
- January 24, 2025: Added comprehensive delete confirmation modals across all delete operations
- January 24, 2025: Implemented star rating system for knowledge base articles with user tracking
- January 24, 2025: Enhanced security by preventing duplicate ratings and tracking user preferences
- January 24, 2025: Completed migration from Replit Agent to standard Replit environment

## Changelog
- June 24, 2025. Initial setup

## User Preferences

Preferred communication style: Simple, everyday language.