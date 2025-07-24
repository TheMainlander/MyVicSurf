import * as client from "openid-client";
import { Strategy, type VerifyFunction } from "openid-client/passport";

import passport from "passport";
import session from "express-session";
import type { Express, RequestHandler } from "express";
import memoize from "memoizee";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

// Check for required environment variables
const requiredEnvVars = ['REPLIT_DOMAINS', 'REPL_ID', 'SESSION_SECRET'];
const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0) {
  console.warn(`Missing required environment variables for authentication: ${missingEnvVars.join(', ')}`);
  console.warn('Authentication will be disabled until these variables are provided');
}

const getOidcConfig = memoize(
  async () => {
    if (!process.env.REPL_ID) {
      throw new Error('REPL_ID environment variable is required for authentication');
    }
    return await client.discovery(
      new URL(process.env.ISSUER_URL ?? "https://replit.com/oidc"),
      process.env.REPL_ID
    );
  },
  { maxAge: 3600 * 1000 }
);

export function getSession() {
  if (!process.env.SESSION_SECRET) {
    throw new Error('SESSION_SECRET environment variable is required for session management');
  }
  
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is required for session storage');
  }

  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  return session({
    secret: process.env.SESSION_SECRET,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
    },
  });
}

function updateUserSession(
  user: any,
  tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuth(app: Express) {
  // Validate all required environment variables
  if (!process.env.REPLIT_DOMAINS) {
    throw new Error('REPLIT_DOMAINS environment variable is required for authentication setup');
  }
  
  if (!process.env.REPL_ID) {
    throw new Error('REPL_ID environment variable is required for authentication setup');
  }

  app.set("trust proxy", 1);
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  const config = await getOidcConfig();

  const verify: VerifyFunction = async (
    tokens: client.TokenEndpointResponse & client.TokenEndpointResponseHelpers,
    verified: passport.AuthenticateCallback
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  const domains = process.env.REPLIT_DOMAINS.split(",").filter(domain => domain.trim());
  
  // Add localhost for development only
  if (process.env.NODE_ENV === "development") {
    domains.push("localhost");
  }
  
  if (domains.length === 0) {
    throw new Error('No valid domains found in REPLIT_DOMAINS environment variable');
  }
  
  for (const domain of domains) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: domain === "localhost" 
          ? `http://localhost:5000/api/callback`
          : `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    try {
      passport.authenticate(`replitauth:${req.hostname}`, {
        prompt: "login consent",
        scope: ["openid", "email", "profile", "offline_access"],
      })(req, res, next);
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Authentication not configured properly' });
    }
  });

  app.get("/api/callback", (req, res, next) => {
    try {
      passport.authenticate(`replitauth:${req.hostname}`, {
        successReturnToOrRedirect: "/",
        failureRedirect: "/api/login",
      })(req, res, next);
    } catch (error) {
      console.error('Callback error:', error);
      res.status(500).json({ error: 'Authentication callback failed' });
    }
  });

  app.get("/api/logout", (req, res) => {
    try {
      req.logout(() => {
        if (!process.env.REPL_ID) {
          return res.redirect('/');
        }
        res.redirect(
          client.buildEndSessionUrl(config, {
            client_id: process.env.REPL_ID,
            post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
          }).href
        );
      });
    } catch (error) {
      console.error('Logout error:', error);
      res.redirect('/');
    }
  });
}

// Create a function to check if auth is configured
export function isAuthConfigured(): boolean {
  return !!(process.env.REPLIT_DOMAINS && process.env.REPL_ID && process.env.SESSION_SECRET);
}

export const isAuthenticated: RequestHandler = async (req, res, next) => {
  // Skip authentication if not configured
  if (!isAuthConfigured()) {
    console.warn('Authentication middleware bypassed - authentication not configured');
    return next();
  }

  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};