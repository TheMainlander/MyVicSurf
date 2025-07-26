import type { RequestHandler } from "express";
import { storage } from "../storage";

// Admin role hierarchy
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
} as const;

export type UserRole = typeof ROLES[keyof typeof ROLES];

// Check if user has admin access
export const requireAdmin: RequestHandler = async (req, res, next) => {
  try {
    // First check if user is authenticated
    if (!req.isAuthenticated() || !req.user) {
      return res.status(401).json({ 
        message: "Authentication required",
        error: "UNAUTHORIZED"
      });
    }

    const userId = (req.user as any).claims?.sub;
    if (!userId) {
      return res.status(401).json({ 
        message: "Invalid user session",
        error: "INVALID_SESSION"
      });
    }

    // Get user from database to check role
    const user = await storage.getUser(userId);
    if (!user) {
      return res.status(401).json({ 
        message: "User not found",
        error: "USER_NOT_FOUND"
      });
    }

    // Check if user has admin role
    if (user.role !== ROLES.ADMIN && user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ 
        message: "Admin access required",
        error: "INSUFFICIENT_PERMISSIONS",
        userRole: user.role
      });
    }

    // Check if user account is active
    if (!user.isActive) {
      return res.status(403).json({ 
        message: "Account is deactivated",
        error: "ACCOUNT_DEACTIVATED"
      });
    }

    // Update last login time
    await storage.updateUser(userId, { lastLoginAt: new Date() });

    // Attach user to request for downstream use
    req.adminUser = user;
    next();
  } catch (error) {
    console.error('Admin auth middleware error:', error);
    res.status(500).json({ 
      message: "Internal server error during authentication",
      error: "INTERNAL_ERROR"
    });
  }
};

// Check if user has super admin access
export const requireSuperAdmin: RequestHandler = async (req, res, next) => {
  try {
    // First run admin check
    await new Promise((resolve, reject) => {
      requireAdmin(req, res, (err) => {
        if (err) reject(err);
        else resolve(void 0);
      });
    });

    const user = req.adminUser;
    if (!user || user.role !== ROLES.SUPER_ADMIN) {
      return res.status(403).json({ 
        message: "Super admin access required",
        error: "INSUFFICIENT_PERMISSIONS",
        userRole: user?.role
      });
    }

    next();
  } catch (error) {
    console.error('Super admin auth middleware error:', error);
    res.status(500).json({ 
      message: "Internal server error during super admin authentication",
      error: "INTERNAL_ERROR"
    });
  }
};

// Utility function to check user role
export const hasRole = (user: any, role: UserRole): boolean => {
  if (!user?.role) return false;
  
  switch (role) {
    case ROLES.USER:
      return true; // All authenticated users have user access
    case ROLES.ADMIN:
      return user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN;
    case ROLES.SUPER_ADMIN:
      return user.role === ROLES.SUPER_ADMIN;
    default:
      return false;
  }
};

// Declare additional properties for Request object
declare global {
  namespace Express {
    interface Request {
      adminUser?: any;
    }
  }
}