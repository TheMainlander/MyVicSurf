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
✓ Improved wind and temperature alignment in forecast cards with vertical column layout
✓ Enhanced visual consistency across forecast timeline and full forecast page
✓ Added logout button to primary navigation header for authenticated users
✓ Implemented proper authentication state management with sign in/sign out controls
✓ Enhanced header styling to match bottom navigation design consistency
✓ Improved button styling with ocean-blue theme, shadows, and hover animations
✓ Updated header icons to use consistent Lucide React styling with stroke-2 width
✓ Aligned heart icon styling with favorites theme (red colors and hover effects)
✓ Updated Sign Out button to use grey colors matching bottom navigation consistency
✓ Simplified register button text from "Register Free with Replit" to just "Register"
✓ Added authentic Bells Beach background image to logged-out home screen using free Pixabay photo
✓ Implemented one-click beach camera screenshot save feature with download functionality
✓ Added "Save" button to camera interface with green styling and loading states
✓ Created backend API endpoint for camera screenshot capture and streaming
✓ Enhanced user feedback with toast notifications for successful saves and error handling
✓ Automatic filename generation with beach name, camera name, and date timestamp
✓ Removed "R" icon from register button, keeping clean text-only appearance
✓ Updated home page background to dynamic surf action image with surfer positioned on right
✓ Enhanced background positioning to showcase wave action while maintaining text readability
✓ Implemented comprehensive Role-Based Access Control (RBAC) system with three-tier hierarchy
✓ Added user roles (user, admin, super_admin) to database schema with proper authentication middleware
✓ Created admin authentication middleware with role verification and permission checking
✓ Added admin user management interface at /admin/users for managing user roles and permissions
✓ Implemented admin seeding system to establish initial super admin account
✓ Updated carousel image management routes to use admin authentication middleware
✓ Added admin user management API endpoints with proper authorization (super admin only for role changes)
✓ Created comprehensive admin dashboard with navigation to user management functionality
✓ Enhanced admin system with user statistics, role management, and account activation/deactivation
✓ Implemented proper error handling and security checks for all admin operations

## Current Status - Deployment Ready

✓ All LSP errors resolved, no TypeScript compilation issues
✓ Production build succeeds without warnings (535KB bundled)
✓ Health endpoint returning 200 status - all systems operational
✓ All existing features preserved: authentication, surf data, favorites, cameras, screenshots
✓ New surf action background properly positioned with assets pipeline
✓ Register button cleaned up with consistent styling
✓ Database connections and API integrations functioning properly
✓ Implemented comprehensive location sharing functionality with geolocation API
✓ Added location permission component with user-friendly prompts and error handling
✓ Created geolocation hook for managing location state and permissions
✓ Automatic nearest surf spot detection when location is shared
✓ Distance calculation using Haversine formula for accurate measurements
✓ Location utilities for distance formatting and permission management
✓ Improved favorite button UX by replacing confusing dual heart icons
✓ Changed header icon from heart to user profile icon for accessing saved beaches
✓ Repositioned main favorite button as compact icon next to spot name
✓ Enhanced visual hierarchy with spot name and favorite action in same row
✓ Comprehensive Stripe payment system integration with subscription management
✓ Three-tier subscription plans: Free Surfer, Wave Rider ($9.99), Surf Master ($19.99)
✓ Complete payment flow with pricing page, checkout, and success confirmation
✓ Database schema for payments, subscription plans, and user subscriptions
✓ Payment API endpoints for subscription management and Stripe integration
✓ Premium feature differentiation ready for user tier-based access control
✓ Integrated subscription selection into registration flow with modal interface
✓ Post-registration handler for seamless subscription completion after authentication
✓ Enhanced "Get Started" button opens subscription selection before auth redirect
✓ Subscription plan selection persisted through localStorage during registration
✓ Upgrade button added to header for authenticated users to access pricing
✓ Person icon in header now navigates to profile page for managing profile and favorites
✓ Removed favorites sidebar in favor of dedicated profile page favorites management
✓ Profile page enhanced with comprehensive favorites list and profile editing capabilities
✓ Complete RBAC system ready for production with authenticated admin access control
✓ Comprehensive admin documentation system with interactive help interface
✓ Admin guide accessible at /admin/help with tabbed sections and quick navigation
✓ Complete admin documentation (ADMIN_GUIDE.md) covering all system functions
✓ Help buttons integrated into all admin interfaces for easy access to documentation
✓ Updated text contrast across all admin interfaces for better readability with black text on white backgrounds
✓ Implemented centralized admin navigation system with automatic breadcrumbs and back button generation
✓ Created reusable navigation components for consistent admin interface experience
✓ Added AdminNavigationHeader, AdminBreadcrumbs, and AdminQuickNav components for scalable navigation
✓ Documented comprehensive navigation system guide for future admin page development

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