import { storage } from "./storage";
import { readFileSync } from "fs";
import { join } from "path";

export async function seedSystemDocuments() {
  console.log("Seeding system admin documents...");
  
  try {
    // Check if system documents already exist
    const existingDocs = await storage.getDocumentsByCategory('system_admin');
    
    if (existingDocs.length > 0) {
      console.log("System admin documents already exist, skipping seed");
      return;
    }

    // Read existing project documents
    const solutionSpecContent = readFileSync(join(process.cwd(), 'VicSurf-Solution-Specifications.md'), 'utf-8');
    const marketResearchContent = readFileSync(join(process.cwd(), 'SURF_MARKET_RESEARCH.md'), 'utf-8');
    const adminGuideContent = readFileSync(join(process.cwd(), 'ADMIN_GUIDE.md'), 'utf-8');

    // Create system admin documents
    const systemDocuments = [
      {
        title: "VicSurf Complete Solution Specifications",
        description: "Comprehensive technical architecture and system design document for VicSurf platform",
        content: solutionSpecContent,
        category: "system_admin",
        type: "solution_design",
        format: "md",
        createdBy: "System"
      },
      {
        title: "VicSurf Market Research: Competing with Surfline & Magicseaweed",
        description: "Detailed market analysis and competitive strategy for VicSurf platform development",
        content: marketResearchContent,
        category: "system_admin",
        type: "prd",
        format: "md",
        createdBy: "System"
      },
      {
        title: "VicSurf Admin System Guide",
        description: "Complete administrative documentation for VicSurf platform management",
        content: adminGuideContent,
        category: "system_admin",
        type: "technical_spec",
        format: "md",
        createdBy: "System"
      },
      {
        title: "VicSurf Development Architecture PRD",
        description: "Product Requirements Document outlining the technical stack and implementation approach",
        content: `# VicSurf Development Architecture PRD

## Product Overview
VicSurf is a comprehensive surf intelligence platform for Victoria, Australia, designed to compete with Surfline and Magicseaweed by offering premium features at 60% lower cost.

## Core Requirements

### Functional Requirements
1. **Real-time Surf Conditions**
   - Wave height, direction, and period data
   - Wind speed and direction monitoring
   - Water and air temperature tracking
   - 5-star rating system for conditions

2. **Advanced Forecasting**
   - 7-day detailed forecasts
   - Professional surf metrics (Wave Rider/Surf Master tiers)
   - Tide information and charts
   - Optimal surfing time recommendations

3. **User Management**
   - User authentication and profiles
   - Favorites management
   - Session tracking and rating
   - Personalized notifications

4. **Premium Features**
   - Professional forecasting panel
   - Advanced surf metrics
   - Extended forecast data
   - Priority support

### Technical Requirements
1. **Frontend Architecture**
   - React 18 with TypeScript
   - Mobile-first responsive design
   - Progressive Web App capabilities
   - Real-time data updates

2. **Backend Architecture**
   - Node.js with Express
   - PostgreSQL database
   - RESTful API design
   - Microservice-ready architecture

3. **Data Sources**
   - Open-Meteo Marine API (free)
   - Bureau of Meteorology tide data
   - Authentic Victorian beach database
   - Real-time webcam integrations

### Performance Requirements
- Page load time: < 2 seconds
- API response time: < 500ms
- Mobile optimization: 95+ PageSpeed score
- Uptime: 99.9% availability

### Security Requirements
- HTTPS encryption
- User authentication
- Input validation and sanitization
- GDPR compliance for user data

## Success Metrics
- User retention: >80% monthly
- Premium conversion: >15%
- Forecast accuracy: >85%
- User satisfaction: 4.5+ stars

## Implementation Timeline
- Phase 1: Core MVP (Complete)
- Phase 2: Premium features (Complete)
- Phase 3: Advanced analytics (In Progress)
- Phase 4: Community features (Planned)

## Competitive Analysis
**Surfline Premium:** $99/year
**VicSurf Premium:** $39/year (60% cost savings)

**Key Differentiators:**
1. Local Victorian expertise
2. Cost-effective pricing
3. Modern technology stack
4. Community-driven features`,
        category: "system_admin",
        type: "prd",
        format: "md",
        createdBy: "System"
      },
      {
        title: "VicSurf Database Schema Documentation",
        description: "Complete database schema documentation including tables, relationships, and migration history",
        content: `# VicSurf Database Schema Documentation

## Overview
VicSurf uses PostgreSQL with Drizzle ORM for type-safe database operations. This document outlines the complete schema structure.

## Core Tables

### Surf Data Tables

#### surf_spots
Primary table for surf location data
\`\`\`sql
CREATE TABLE surf_spots (
  id SERIAL PRIMARY KEY,
  name VARCHAR NOT NULL,
  latitude DECIMAL NOT NULL,
  longitude DECIMAL NOT NULL,
  description TEXT,
  image_url TEXT,
  region VARCHAR DEFAULT 'Victoria',
  difficulty VARCHAR DEFAULT 'intermediate',
  beach_type VARCHAR DEFAULT 'surf',
  beach_category VARCHAR DEFAULT 'surf_beach',
  facilities TEXT[],
  access_info TEXT,
  best_conditions TEXT,
  hazards TEXT[],
  external_id VARCHAR,
  api_source VARCHAR DEFAULT 'open-meteo'
);
\`\`\`

#### surf_conditions
Real-time and historical surf condition data
\`\`\`sql
CREATE TABLE surf_conditions (
  id SERIAL PRIMARY KEY,
  spot_id INTEGER REFERENCES surf_spots(id),
  wave_height REAL,
  wave_direction INTEGER,
  wave_period REAL,
  wind_speed REAL,
  wind_direction INTEGER,
  air_temperature REAL,
  water_temperature REAL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  timestamp TIMESTAMP DEFAULT NOW()
);
\`\`\`

### User Management Tables

#### users
User account and profile information
\`\`\`sql
CREATE TABLE users (
  id VARCHAR PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  first_name VARCHAR,
  last_name VARCHAR,
  username VARCHAR UNIQUE,
  bio TEXT,
  experience_level VARCHAR DEFAULT 'intermediate',
  location VARCHAR,
  profile_image_url TEXT,
  phone_number VARCHAR,
  role VARCHAR DEFAULT 'user',
  stripe_customer_id VARCHAR,
  stripe_subscription_id VARCHAR,
  subscription_status VARCHAR DEFAULT 'free',
  subscription_plan VARCHAR DEFAULT 'free',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
\`\`\`

### Document Management

#### documents
Unified document storage for marketing and system admin docs
\`\`\`sql
CREATE TABLE documents (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT NOT NULL,
  category TEXT NOT NULL, -- 'marketing' or 'system_admin'
  type TEXT NOT NULL, -- strategy, campaign, prd, solution_design, etc.
  format TEXT DEFAULT 'md',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  created_by TEXT NOT NULL
);
\`\`\`

## Relationships

### User-Spot Relationships
- users -> user_favorites -> surf_spots
- users -> user_sessions -> surf_spots
- users -> user_preferences (1:1)

### Surf Data Relationships
- surf_spots -> surf_conditions (1:many)
- surf_spots -> forecasts (1:many)
- surf_spots -> tide_times (1:many)

### Admin System
- users (role-based access control)
- documents (content management)
- user_feedback (community management)

## Indexes
\`\`\`sql
-- Performance indexes
CREATE INDEX idx_surf_conditions_spot_timestamp ON surf_conditions(spot_id, timestamp DESC);
CREATE INDEX idx_forecasts_spot_date ON forecasts(spot_id, date);
CREATE INDEX idx_user_favorites_user ON user_favorites(user_id);
CREATE INDEX idx_documents_category ON documents(category, created_at DESC);
\`\`\`

## Migration Strategy
- Use Drizzle migrations for schema changes
- Always backup before major migrations
- Test migrations in staging environment
- Document all schema changes in this file

## Data Integrity
- Foreign key constraints ensure referential integrity
- Check constraints validate data ranges (e.g., ratings 1-5)
- NOT NULL constraints on critical fields
- Unique constraints prevent duplicate records`,
        category: "system_admin",
        type: "technical_spec",
        format: "md",
        createdBy: "System"
      }
    ];

    // Create each document
    for (const doc of systemDocuments) {
      await storage.createDocument(doc);
    }

    console.log(`Successfully seeded ${systemDocuments.length} system admin documents`);
  } catch (error) {
    console.error("Error seeding system admin documents:", error);
    throw error;
  }
}