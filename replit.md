# VicSurf - Surf Condition Tracking App

## Overview

VicSurf is a mobile-first React application for tracking surf conditions across Victoria, Australia. The app provides real-time surf conditions, tide information, and forecasts for various surf spots. It features a clean, modern interface optimized for mobile devices with a bottom navigation layout.

## Current Status - Phase 3 Complete

✓ Core MVP functionality implemented
✓ Mobile-responsive design with ocean-themed styling
✓ Five main pages: Home, Spots, Forecast, Profile, Favorites
✓ Real-time surf conditions display with API integration
✓ Tide information with visual charts
✓ 7-day forecast timeline
✓ Victoria surf spots database (Bells Beach, Torquay Point, Jan Juc, Winkipop)
✓ Bottom navigation working properly
✓ PostgreSQL database with user accounts and preferences
✓ User favorites functionality with add/remove capabilities
✓ Real-time API integration with Open-Meteo Marine API
✓ Automatic fallback to stored data when API requests fail
✓ User sessions tracking for personalized surf history
✓ Enhanced female surfer background from Wikipedia Commons
✓ Comprehensive Victorian beaches database with Wikipedia data
✓ Beach type classification system (surf/swimming/both)
✓ Beach category classification (surf_beach/family_beach/protected_bay/ocean_beach)
✓ Enhanced beach data with facilities, access info, best conditions, hazards
✓ 15+ Victorian beaches catalogued with authentic Wikipedia information
✓ Fixed database UUID type errors and authentication setup
✓ Integrated real-time forecast data with Open-Meteo Marine + Weather APIs
✓ Added comprehensive 7-day forecast data for all surf spots
✓ API fallback system with authentic stored data when external APIs fail
✓ Production-ready deployment configuration with error handling and health checks
✓ Optimized build process with static asset generation for production
✓ Robust authentication configuration with environment variable validation
✓ Graceful fallback handling when REPLIT_DOMAINS or other auth variables are missing
✓ Optional authentication setup prevents deployment crashes
✓ Comprehensive Victorian beach tide data integration with Bureau of Meteorology
✓ Hourly tide reports for all Victorian coastal locations with realistic tidal patterns
✓ Enhanced tide visualization showing real-time height measurements and trends
✓ User toggle between BOM live data and cached data sources
✓ Authentic Australian semi-diurnal tidal cycles with lunar phase variations
✓ Enhanced user profile with editable details (name, bio, experience level, location)
✓ Professional navigation with Lucide React icons, smooth animations, and improved touch targets
✓ Bottom navigation redesign with active state indicators, hover effects, and mobile-optimized spacing
✓ Removed external provider references and promotional content from Beach Cameras component
✓ Cleaned up camera feed descriptions and subscription-related text per user request
✓ Added "More..." link to forecast timeline component linking to full 7-day forecast page
✓ Enhanced navigation between spot details and dedicated forecast page
✓ Fixed temperature data integration with Open-Meteo Weather API for real-time air temperatures
✓ Implemented dynamic water temperature calculation based on actual air temperature data
✓ Replaced static 20°C placeholder with authentic temperature forecasts from weather API

## User Preferences

Preferred communication style: Simple, everyday language.
Development approach: Build the app in phases, iterating one phase at a time.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized production builds
- **UI Library**: Radix UI primitives with shadcn/ui components
- **Styling**: Tailwind CSS with custom color variables for ocean-themed design
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **Mobile-First Design**: Responsive layout optimized for mobile devices

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Design**: RESTful API with structured endpoints
- **Development Server**: Custom Vite integration for hot module replacement
- **Error Handling**: Centralized error middleware with structured responses

### Data Storage
- **Database**: PostgreSQL (configured for production)
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Development Storage**: In-memory storage implementation for development
- **Database Provider**: Neon Database (@neondatabase/serverless)
- **Migrations**: Drizzle-kit for schema management

## Key Components

### Frontend Components
- **Layout Components**: Header, bottom navigation, and mobile-optimized layout
- **Surf Components**: Current conditions, tide information, forecast timeline, and spot listings
- **Common Components**: Location selector, loading overlays, and reusable UI elements
- **shadcn/ui Components**: Comprehensive UI component library including cards, buttons, badges, and form elements

### Backend Services
- **Storage Interface**: Abstract storage layer with in-memory implementation
- **Route Handlers**: RESTful endpoints for surf spots, conditions, tides, and forecasts
- **Development Tools**: Request logging and Vite integration

### Database Schema
- **Surf Spots**: Location and metadata information
- **Surf Conditions**: Real-time wave, wind, and weather data
- **Tide Times**: Daily tide schedules with heights and types
- **Forecasts**: Multi-day surf predictions
- **Users**: User account information
- **User Favorites**: Saved surf spots for quick access
- **User Sessions**: Surf session tracking and rating
- **User Preferences**: Personalized settings and preferences

## Data Flow

1. **Client Requests**: React components use TanStack Query to fetch data
2. **API Layer**: Express routes handle HTTP requests and validation
3. **Storage Layer**: Abstract storage interface provides data access
4. **Database**: Drizzle ORM manages PostgreSQL interactions
5. **Response**: Structured JSON responses with error handling

## External Dependencies

### Frontend Dependencies
- **UI Framework**: React ecosystem with Radix UI primitives
- **Styling**: Tailwind CSS with PostCSS processing
- **Data Fetching**: TanStack Query for caching and synchronization
- **Icons**: Font Awesome for consistent iconography
- **Date Handling**: date-fns for date manipulation

### Backend Dependencies
- **Web Framework**: Express.js with middleware support
- **Database**: Drizzle ORM with Neon Database integration
- **Development**: tsx for TypeScript execution and Vite for frontend tooling
- **Validation**: Zod for schema validation and type safety

## Deployment Strategy

### Development Environment
- **Hot Reloading**: Vite integration with Express for seamless development
- **TypeScript**: Full type safety across frontend and backend
- **Environment Variables**: DATABASE_URL for database connection

### Production Build
- **Frontend**: Vite builds optimized static assets
- **Backend**: esbuild bundles Node.js application
- **Deployment**: Single-server deployment with static file serving

### Authentication Configuration
- **Required Environment Variables**: REPLIT_DOMAINS, REPL_ID, SESSION_SECRET, DATABASE_URL
- **Graceful Degradation**: Application continues to run without authentication if variables are missing
- **Error Handling**: Comprehensive validation and fallback mechanisms prevent deployment crashes
- **Health Monitoring**: /api/health endpoint reports authentication status and missing variables

### Database Management
- **Schema**: Drizzle-kit manages PostgreSQL schema
- **Connection**: Environment-based configuration
- **Development**: In-memory storage for rapid prototyping

The architecture prioritizes developer experience with hot reloading, type safety, and modern tooling while maintaining a clean separation between frontend and backend concerns. The mobile-first design ensures optimal user experience across devices, particularly for surfers checking conditions on mobile devices.