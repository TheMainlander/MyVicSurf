# VicSurf - Complete Solution Specifications

## Project Overview

VicSurf is a production-ready surf condition tracking application for Victoria, Australia, built with modern web technologies and optimized for mobile-first usage. The app provides real-time surf conditions, forecasts, and personalized user experiences for Australian surfers.

## Technical Architecture

### **Frontend Stack**
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite with Hot Module Replacement
- **UI Library**: Radix UI primitives + shadcn/ui components
- **Styling**: Tailwind CSS with ocean-themed design variables
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) v5 for server state
- **Mobile Optimization**: Mobile-first responsive design

### **Backend Stack**
- **Runtime**: Node.js 20 with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Neon Database provider
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Authentication**: Replit Auth with OpenID Connect
- **Session Management**: PostgreSQL session store
- **API Integration**: Open-Meteo Marine + Weather APIs

### **Database Schema**

#### Core Surf Data
```typescript
// Surf Spots - Beach/Location information
surfSpots: {
  id, name, latitude, longitude, description, imageUrl,
  region, difficulty, beachType, beachCategory,
  facilities[], accessInfo, bestConditions, hazards[],
  externalId, apiSource
}

// Real-time Conditions
surfConditions: {
  id, spotId, waveHeight, waveDirection, wavePeriod,
  windSpeed, windDirection, airTemperature, waterTemperature,
  rating, timestamp
}

// Forecast Data (7-day)
forecasts: {
  id, spotId, date, waveHeight, waveDirection,
  windSpeed, windDirection, rating,
  airTemperature, waterTemperature
}

// Tide Information
tideTimes: {
  id, spotId, date, time, height, type
}
```

#### User Management
```typescript
// User Accounts
users: {
  id, email, firstName, lastName, profileImageUrl,
  createdAt, updatedAt
}

// User Favorites
userFavorites: {
  id, userId, spotId, addedAt
}

// Surf Sessions
userSessions: {
  id, userId, spotId, sessionDate, waveHeight,
  rating, notes, duration, createdAt
}

// User Preferences
userPreferences: {
  id, userId, preferredUnits, emailNotifications,
  pushNotifications, optimalConditionAlerts,
  waveHeightMin, waveHeightMax, windSpeedMax,
  favoriteRegions[], skillLevel, createdAt, updatedAt
}
```

#### Push Notifications
```typescript
// Push Subscriptions
pushSubscriptions: {
  id, userId, endpoint, p256dhKey, authKey,
  userAgent, isActive, createdAt
}

// Notification Log
notificationLog: {
  id, userId, spotId, notificationType,
  title, message, sent, sentAt, createdAt
}
```

## **API Architecture**

### Authentication Endpoints
```
GET  /api/login          - Initiate Replit Auth
GET  /api/callback       - Auth callback handler
GET  /api/logout         - User logout
GET  /api/auth/user      - Get current user
```

### Surf Data Endpoints
```
GET  /api/surf-spots              - List all surf spots
GET  /api/surf-spots/:id          - Get specific spot details
GET  /api/surf-spots/:id/conditions - Current conditions
GET  /api/surf-spots/:id/forecast   - 7-day forecast
GET  /api/surf-spots/:id/tides      - Tide times
GET  /api/surf-spots/:id/nearby     - Nearby spots
```

### User Features
```
GET  /api/users/:id/favorites          - User's favorite spots
POST /api/users/:id/favorites          - Add favorite
DEL  /api/users/:id/favorites/:spotId  - Remove favorite
GET  /api/users/:id/favorites/:spotId/check - Check if favorited

GET  /api/users/:id/sessions           - User surf sessions
POST /api/users/:id/sessions           - Log surf session

GET  /api/users/:id/preferences        - User preferences
PUT  /api/users/:id/preferences        - Update preferences
```

### Push Notifications
```
POST /api/push/subscribe    - Subscribe to push notifications
POST /api/push/unsubscribe  - Unsubscribe from notifications
GET  /api/push/status       - Check subscription status
```

### System
```
GET  /api/health           - Health check with status
```

## **Frontend Pages & Components**

### Core Pages
1. **Landing Page** (`/`) - Authentication and app introduction
2. **Home** (`/home`) - Current conditions dashboard
3. **Spots** (`/spots`) - All surf spots with search/filter
4. **Forecast** (`/forecast`) - 7-day forecast timeline
5. **Favorites** (`/favorites`) - User's saved spots
6. **Profile** (`/profile`) - User settings and preferences

### Component Architecture
```
components/
├── layout/
│   ├── header.tsx           - App header with navigation
│   ├── bottom-navigation.tsx - Mobile navigation
│   └── mobile-layout.tsx    - Responsive container
├── surf/
│   ├── conditions-card.tsx  - Current conditions display
│   ├── forecast-timeline.tsx - 7-day forecast
│   ├── spot-card.tsx       - Surf spot information
│   ├── tide-chart.tsx      - Tide visualization
│   └── rating-badge.tsx    - Condition rating display
├── favorites/
│   ├── favorites-list.tsx  - User favorites display
│   └── favorite-button.tsx - Add/remove favorite
├── common/
│   ├── loading-overlay.tsx - Loading states
│   ├── location-selector.tsx - Spot selection
│   └── error-boundary.tsx  - Error handling
└── ui/ (shadcn/ui components)
    ├── button.tsx, card.tsx, badge.tsx
    ├── toast.tsx, dialog.tsx, tabs.tsx
    └── form.tsx, input.tsx, select.tsx
```

## **Data Sources & Integration**

### External APIs
- **Open-Meteo Marine API**: Wave height, period, direction
- **Open-Meteo Weather API**: Wind, temperature, conditions
- **Automatic Fallback**: Stored data when APIs unavailable

### Victorian Surf Spots Database
- **15+ Authenticated Locations**: Wikipedia-sourced data
- **Comprehensive Details**: Facilities, access, hazards, best conditions
- **Classification System**: Beach types and categories
- **Real-time Updates**: API integration with fallback data

## **Authentication & Security**

### Replit Auth Integration
```typescript
// Environment Variables Required
REPLIT_DOMAINS=your-domain.replit.app
REPL_ID=your-repl-id
SESSION_SECRET=secure-session-secret
DATABASE_URL=postgresql://connection-string

// Graceful Degradation
- App continues without auth if variables missing
- Clear error messages and health monitoring
- Optional authentication prevents deployment crashes
```

### Session Management
- PostgreSQL session storage
- 7-day session TTL
- Secure HTTP-only cookies
- CSRF protection enabled

## **Build & Deployment**

### Development
```bash
npm run dev      # Start development server with HMR
npm run check    # TypeScript type checking
npm run db:push  # Database schema migration
```

### Production Build
```bash
npm run build    # Vite + esbuild bundle
npm run start    # Production server
```

### Deployment Configuration
```yaml
# .replit configuration
[deployment]
deploymentTarget = "autoscale"
build = ["npm", "run", "build"]
run = ["npm", "run", "start"]

# Health monitoring
/api/health endpoint provides:
- Database connection status
- Authentication configuration status
- Missing environment variables
- Application health metrics
```

## **Key Features Implemented**

### ✅ Core Functionality
- Real-time surf conditions with 5-tier rating system
- 7-day detailed forecasts
- Tide information and charts
- User authentication with Replit Auth
- Favorites management
- Mobile-optimized responsive design

### ✅ Advanced Features
- Push notifications for optimal conditions
- User surf session logging
- Personalized preferences (units, alerts, skill level)
- Nearby spots discovery
- Comprehensive Victorian beaches database
- API fallback system for reliability

### ✅ Production Ready
- Robust error handling and logging
- Health monitoring endpoints
- Optional authentication for deployment
- Optimized build process
- PostgreSQL production database
- Type-safe development with TypeScript

## **Performance & Optimization**

- **Frontend**: Vite HMR, code splitting, lazy loading
- **Backend**: Memoized API calls, database indexing
- **Database**: Optimized queries with Drizzle ORM
- **Caching**: TanStack Query for client-side state
- **Mobile**: Touch-optimized UI, fast loading times

## **Dependencies & Packages**

### Core Frontend Dependencies
- React 18 + TypeScript
- Vite build system
- TanStack Query for state management
- Wouter for routing
- Tailwind CSS + shadcn/ui components
- Radix UI primitives
- Framer Motion for animations

### Core Backend Dependencies
- Node.js 20 + Express.js
- Drizzle ORM + PostgreSQL
- Neon Database serverless
- Passport.js + OpenID Connect
- Web Push notifications
- Zod for validation

### Development Tools
- TypeScript compiler
- ESBuild for production bundling
- Drizzle Kit for migrations
- tsx for development execution

## **Environment Configuration**

### Required Environment Variables
```bash
# Database
DATABASE_URL=postgresql://username:password@host:port/database

# Authentication (Optional - graceful degradation)
REPLIT_DOMAINS=your-domain.replit.app
REPL_ID=your-repl-id
SESSION_SECRET=secure-random-string

# Environment
NODE_ENV=production|development
PORT=5000
```

### Optional Configuration
```bash
# External APIs
ISSUER_URL=https://replit.com/oidc

# Push Notifications
VAPID_PUBLIC_KEY=your-vapid-public-key
VAPID_PRIVATE_KEY=your-vapid-private-key
```

## **File Structure**

```
vicsurf/
├── client/src/
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utility functions
│   └── main.tsx          # App entry point
├── server/
│   ├── routes.ts         # API route handlers
│   ├── storage.ts        # Database interface
│   ├── replitAuth.ts     # Authentication setup
│   ├── api-integrations.ts # External API calls
│   └── index.ts          # Server entry point
├── shared/
│   └── schema.ts         # Database schema definitions
├── package.json          # Dependencies and scripts
├── vite.config.ts        # Frontend build configuration
├── drizzle.config.ts     # Database configuration
├── tailwind.config.ts    # Styling configuration
└── replit.md             # Project documentation
```

---

**Generated**: July 24, 2025  
**Version**: Production-ready v1.0  
**Author**: VicSurf Development Team  
**Platform**: Replit + Neon Database