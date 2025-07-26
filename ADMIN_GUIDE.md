# VicSurf Admin Guide

## Overview

VicSurf uses a comprehensive Role-Based Access Control (RBAC) system to manage administrative functions. This guide covers everything you need to know about managing users, content, and system administration.

## Table of Contents

- [Getting Started](#getting-started)
- [User Roles & Permissions](#user-roles--permissions)
- [Admin Authentication](#admin-authentication)
- [Carousel Management](#carousel-management)
- [User Management](#user-management)
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

*This guide is maintained as part of the VicSurf platform documentation. Last updated: January 2025*