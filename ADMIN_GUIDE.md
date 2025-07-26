# VicSurf Admin Guide

## Overview

VicSurf uses a comprehensive Role-Based Access Control (RBAC) system to manage administrative functions. This guide covers everything you need to know about managing users, content, and system administration.

## Table of Contents

- [Getting Started](#getting-started)
- [User Roles & Permissions](#user-roles--permissions)
- [Admin Authentication](#admin-authentication)
- [Navigation System](#navigation-system)
- [Carousel Management](#carousel-management)
- [Beach Management](#beach-management)
- [User Management](#user-management)
- [Adding New Admin Pages](#adding-new-admin-pages)
- [Security Best Practices](#security-best-practices)
- [Troubleshooting](#troubleshooting)

## Getting Started

### Accessing Admin Functions

1. **Sign In**: Use Replit Auth to authenticate (click "Sign In" button)
2. **Admin Panel**: Navigate to `/admin` for carousel management
3. **User Management**: Navigate to `/admin/users` for user administration
4. **Help**: Navigate to `/admin/help` for this guide

### First-Time Setup

- The system automatically creates admin accounts through database seeding
- Your account must have `admin` or `super_admin` role to access admin functions
- Contact a super admin to upgrade your account if needed

## User Roles & Permissions

### Role Hierarchy

```
Super Admin > Admin > User
```

### User (Default Role)
- Access to all standard VicSurf features
- Can view surf conditions, forecasts, and save favorites
- Cannot access administrative functions

### Admin
- **Carousel Management**: Add, edit, delete landing page images
- **Beach Management**: Edit beach information, images, facilities, and descriptions
- **User Viewing**: View all user accounts and statistics
- **Account Management**: Activate/deactivate user accounts
- **Cannot**: Change user roles (super admin only)

### Super Admin
- **All Admin Permissions** PLUS:
- **Role Management**: Promote users to admin or super admin
- **Full User Control**: Complete user account management
- **System Administration**: Highest level of access

## Admin Authentication

### How It Works
- **No Passwords**: VicSurf uses Replit OAuth authentication
- **Role-Based Access**: Permissions determined by database role
- **Session Management**: Automatic login tracking and security

### Authentication Flow
1. User clicks "Sign In" → Redirected to Replit Auth
2. Replit validates identity → Returns to VicSurf
3. System checks user role in database
4. Grants appropriate admin access based on role

### Security Features
- **Middleware Protection**: All admin routes protected by authentication
- **Role Verification**: Real-time permission checking
- **Session Tracking**: Login times and activity monitoring
- **Account Status**: Active/inactive account controls

## Navigation System

### Centralized Navigation Architecture

VicSurf uses a centralized navigation system that automatically maintains consistent navigation, breadcrumbs, and site mapping across all admin screens. This ensures that new admin pages automatically integrate with the existing navigation structure.

### Navigation Components

#### AdminNavigationHeader
- **Automatic Back Buttons**: Generated based on route hierarchy
- **Breadcrumb Navigation**: Shows full path from main app to current page
- **Page Titles**: Consistent formatting with descriptions
- **Action Buttons**: Space for page-specific actions

#### AdminBreadcrumbs
- **Hierarchical Path**: Shows route relationships
- **Clickable Links**: Quick navigation to parent pages
- **Current Page Highlight**: Clear indication of current location

#### AdminQuickNav
- **Related Pages**: Shows sibling and child routes
- **Role-Based**: Only displays pages user has access to
- **Responsive Layout**: Adapts to different screen sizes

### Navigation Features

#### Automatic Back Button Generation
- Child pages automatically get "Back to Parent Page" buttons
- Root admin pages get "Back to App" button
- No manual coding required for navigation

#### Smart Breadcrumbs
- Automatically built from route hierarchy
- Shows complete navigation path
- Updates automatically when route structure changes

#### Role-Based Navigation
- Navigation respects user permissions
- Unauthorized routes are automatically hidden
- Supports admin role hierarchy (super_admin > admin)

### Route Configuration

All admin routes are defined in `/client/src/config/admin-navigation.ts`:

```typescript
{
  id: 'admin-users',
  path: '/admin/users',
  title: 'User Management',
  description: 'Manage user accounts and roles',
  icon: Users,
  parentId: 'admin-root',
  requiresRole: 'admin',
  showInNavigation: true
}
```

#### Route Properties
- **id**: Unique identifier for the route
- **path**: URL path for the page
- **title**: Display name in navigation
- **description**: Brief description of page function
- **icon**: Lucide React icon for visual identification
- **parentId**: Links to parent route for hierarchy
- **requiresRole**: Minimum role required to access
- **showInNavigation**: Whether to show in navigation menus

## Adding New Admin Pages

### Step-by-Step Process

#### 1. Define the Route
Add your new route to the `ADMIN_ROUTES` array in `/client/src/config/admin-navigation.ts`:

```typescript
{
  id: 'admin-settings',
  path: '/admin/settings',
  title: 'System Settings',
  description: 'Configure system preferences',
  icon: Settings,
  parentId: 'admin-root',
  requiresRole: 'super_admin',
  showInNavigation: true
}
```

#### 2. Create the Page Component
Use the standard admin page structure:

```typescript
import AdminNavigationHeader from "@/components/admin/admin-navigation-header";
import AdminQuickNav from "@/components/admin/admin-quick-nav";

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-deep-blue via-ocean-blue to-teal-dark">
      <Header />
      
      <main className="max-w-6xl mx-auto px-4 pb-20 pt-6">
        <AdminNavigationHeader
          currentPath="/admin/settings"
          title="System Settings"
          description="Configure system preferences"
          additionalActions={<CustomButton />}
        />
        
        <AdminQuickNav currentPath="/admin/settings" userRole={userRole} />
        
        {/* Your page content here */}
      </main>
      
      <BottomNavigation />
    </div>
  );
}
```

#### 3. Register the Route
Add the route to your router in `App.tsx`:

```typescript
<Route path="/admin/settings" component={AdminSettingsPage} />
```

#### 4. Update Documentation
- Add page description to this admin guide
- Update any relevant help documentation
- Test navigation flow with different user roles

### Best Practices for New Pages

#### Navigation Consistency
- Always use `AdminNavigationHeader` component
- Include `AdminQuickNav` for related page access
- Follow the established route naming convention

#### Permission Design
- Use minimum required permissions
- Consider user experience when restricting access
- Test with different user roles

#### Icon Selection
- Choose clear, recognizable Lucide React icons
- Maintain visual consistency with existing pages
- Consider icon meaning and user recognition

### Maintenance Requirements

#### When Adding New Pages
1. **Update Route Configuration**: Add to admin-navigation.ts
2. **Use Standard Components**: AdminNavigationHeader and AdminQuickNav
3. **Register Route**: Add to App.tsx router
4. **Update Documentation**: Add to admin guide
5. **Test Navigation**: Verify all navigation flows work

#### Documentation Updates
- Update this admin guide with new page descriptions
- Modify replit.md to reflect architectural changes
- Update navigation guide if adding new navigation patterns

## Carousel Management

### Overview
Manage the featured surf spots displayed on the landing page carousel.

### Accessing Carousel Management
- Navigate to `/admin` while signed in as admin or super admin
- Click "Add New Image" to create entries
- Use edit/delete buttons on existing images

### Adding New Images
1. **Name**: Beach or surf spot name (e.g., "Bells Beach")
2. **Description**: Brief description of the location
3. **Image URL**: Direct link to high-quality image
4. **Location**: Geographic location (e.g., "Torquay, Victoria")
5. **Sort Order**: Numeric value for display order (lower = first)

### Image Requirements
- **Format**: JPG, PNG, or WebP recommended
- **Resolution**: Minimum 1200x600px for best quality
- **Aspect Ratio**: 2:1 (landscape) works best
- **Size**: Keep under 2MB for fast loading
- **Content**: High-quality surf/beach photography

### Best Practices
- Use authentic photos of Victorian surf locations
- Maintain consistent image quality across carousel
- Update seasonally to keep content fresh
- Test images on mobile devices for responsiveness

## Beach Management

### Overview
Manage the Victoria Beaches & Surf Spots content including beach information, images, facilities, and descriptions displayed throughout the VicSurf application.

### Accessing Beach Management
- Navigate to `/admin/beaches` while signed in as admin or super admin
- Click "Add New Beach" to create new surf spots
- Use edit buttons on existing beaches to modify content
- Use delete buttons to remove beaches (with confirmation)

### Adding New Beaches
1. **Basic Information**:
   - **Beach Name**: Official name (e.g., "Bells Beach")
   - **Region**: Geographic area (e.g., "Torquay")
   - **Latitude/Longitude**: GPS coordinates for accurate location
   - **Difficulty Level**: beginner, intermediate, advanced, expert
   - **Beach Type**: surf, swimming, both
   - **Beach Category**: surf_beach, family_beach, protected_bay, ocean_beach

2. **Content & Media**:
   - **Hero Image URL**: High-quality beach photo for spot cards and detail pages
   - **Description**: Comprehensive beach description highlighting unique features
   - **Facilities**: Comma-separated list (Parking, Toilets, Showers, Café, Surf Shop)
   - **Access Information**: Detailed directions and parking instructions
   - **Best Conditions**: Optimal wind, swell, and tide conditions for surfing
   - **Hazards**: Safety warnings (Rocks, Strong currents, Sharks, Rips)

### Editing Existing Beaches
1. **Click Edit Button**: Opens inline editing form for the selected beach
2. **Modify Content**: Update any field including images, text, facilities, or safety information
3. **Save Changes**: Automatically updates all beach references throughout the app
4. **Cancel**: Discard changes and return to view mode

### Image Requirements for Beaches
- **Format**: JPG, PNG, or WebP recommended
- **Resolution**: Minimum 800x400px for spot cards, 1200x600px for detail pages
- **Aspect Ratio**: 2:1 (landscape) optimal for consistent display
- **Content**: Authentic photos of Victorian beaches and surf breaks
- **Quality**: High-resolution images showcasing beach character and conditions

### Beach Content Guidelines
- **Descriptions**: Write informative, engaging content highlighting what makes each beach unique
- **Facilities**: List all available amenities accurately for visitor planning
- **Access Info**: Provide clear, detailed directions and parking information
- **Best Conditions**: Include specific wind direction, swell size, and tide preferences
- **Hazards**: Always include relevant safety warnings for user protection

### Data Management Best Practices
- **Verify Information**: Ensure all beach details are accurate and up-to-date
- **Consistent Format**: Use standardized formatting for facilities and hazards lists
- **Regular Updates**: Review and update beach information seasonally
- **Image Quality**: Maintain high standards for visual content across all beaches
- **Safety First**: Always include comprehensive hazard information for user safety

## User Management

### Accessing User Management
- Navigate to `/admin/users` while signed in as admin or super admin
- View comprehensive user list with roles and statistics

### User Information Displayed
- **Basic Info**: Name, email, display name
- **Account Status**: Active/inactive, creation date, last login
- **Role**: Current permission level
- **Subscription**: Plan status and details

### User Account Actions

#### For Admins
- **View Users**: Access to all user account information
- **Activate/Deactivate**: Enable or disable user accounts
- **Monitor Activity**: View login patterns and usage

#### For Super Admins (Additional)
- **Change Roles**: Promote users to admin or super admin
- **Full Management**: Complete control over user accounts

### Creating New Admins

#### Method 1: Admin Panel (Super Admin Only)
1. Go to `/admin/users`
2. Find the user you want to promote
3. Change their role from dropdown menu
4. User immediately gains admin access

#### Method 2: Direct Database (Technical)
```sql
-- Make user an admin
UPDATE users SET role = 'admin' WHERE id = 'USER_ID';

-- Make user a super admin
UPDATE users SET role = 'super_admin' WHERE id = 'USER_ID';
```

### User Statistics Dashboard
- **Total Users**: Complete user count
- **Active Users**: Currently active accounts
- **Admin Count**: Number of admin accounts
- **Super Admin Count**: Number of super admin accounts

## Security Best Practices

### Admin Account Security
- **Limit Super Admins**: Keep minimal number of super admin accounts
- **Regular Audits**: Review admin access regularly
- **Activity Monitoring**: Track admin actions and login patterns
- **Account Status**: Deactivate unused admin accounts

### Role Assignment Guidelines
- **Principle of Least Privilege**: Grant minimum necessary permissions
- **Business Justification**: Require reason for admin promotion  
- **Temporary Access**: Use time-limited admin roles when possible
- **Documentation**: Keep record of role changes and reasons

### System Monitoring
- **Login Tracking**: Monitor admin authentication attempts
- **Action Logging**: Track admin operations and changes
- **Error Monitoring**: Watch for authentication failures
- **Regular Reviews**: Periodic security audits

## Troubleshooting

### Common Issues

#### "Authentication Required" Error
- **Cause**: Not signed in or session expired
- **Solution**: Click "Sign In" and authenticate with Replit

#### "Admin Access Required" Error  
- **Cause**: User account lacks admin role
- **Solution**: Contact super admin to upgrade account role

#### "Insufficient Permissions" Error
- **Cause**: Action requires higher permission level
- **Solution**: Super admin access needed for role changes

#### Admin Routes Not Accessible
- **Cause**: Routing or authentication configuration issue
- **Solution**: Check that user is authenticated and has proper role

### Getting Help

#### For Users
- Contact system administrators for account issues
- Use the support channels established by your organization

#### For Admins
- Refer to this guide for standard procedures
- Contact super admins for role management needs
- Check server logs for technical issues

#### For Super Admins
- Monitor system health through admin dashboard
- Review user access patterns regularly
- Maintain backup admin accounts

### Database Queries for Troubleshooting

```sql
-- Check current user roles
SELECT id, email, display_name, role, is_active 
FROM users 
ORDER BY created_at DESC;

-- Find all admins
SELECT id, email, display_name, role 
FROM users 
WHERE role IN ('admin', 'super_admin');

-- Check user activity
SELECT id, email, last_login_at, created_at
FROM users 
WHERE is_active = true
ORDER BY last_login_at DESC;
```

## API Endpoints Reference

### Admin Routes
- `GET /api/admin/info` - Admin dashboard information
- `GET /api/admin/users` - List all users (admin required)
- `PUT /api/admin/users/:id/role` - Change user role (super admin only)
- `PUT /api/admin/users/:id/activate` - Activate user account
- `PUT /api/admin/users/:id/deactivate` - Deactivate user account

### Carousel Routes
- `GET /api/admin/carousel-images` - List carousel images
- `POST /api/admin/carousel-images` - Create new image
- `PUT /api/admin/carousel-images/:id` - Update image
- `DELETE /api/admin/carousel-images/:id` - Delete image

## Support & Contact

For technical support or questions about this admin system:

1. **System Issues**: Check application logs and error messages
2. **Access Problems**: Verify authentication and role assignments  
3. **Feature Requests**: Document requirements and submit to development team
4. **Security Concerns**: Report immediately to system administrators

---

## Version History

### January 2025 - Navigation System Update
- Added centralized navigation system with automatic breadcrumbs
- Implemented AdminNavigationHeader, AdminBreadcrumbs, and AdminQuickNav components  
- Created comprehensive documentation for adding new admin pages
- Updated all existing admin pages to use new navigation system
- Added detailed route configuration guide

### December 2024 - RBAC Implementation
- Implemented Role-Based Access Control system
- Added admin and super_admin roles with proper permissions
- Created user management interface with role assignment
- Added authentication middleware and security controls

### Initial Release
- Basic admin functionality for carousel management
- Replit Auth integration for authentication
- PostgreSQL database with user accounts

---

*This guide is maintained as part of the VicSurf platform documentation. Last updated: January 2025*