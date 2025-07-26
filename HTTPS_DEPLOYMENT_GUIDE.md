# HTTPS Deployment Guide for VicSurf

## Overview
This guide explains how to deploy VicSurf with HTTPS enabled using Replit's free HTTPS service.

## What's Already Configured

### Server Configuration
✅ **Trust Proxy**: Server configured to work behind Replit's HTTPS proxy
✅ **HTTPS Redirect**: Automatic HTTP to HTTPS redirects in production
✅ **Security Headers**: HSTS, X-Frame-Options, and other security headers enabled
✅ **Health Check**: `/api/health` endpoint shows HTTPS status

### Frontend Configuration
✅ **Content Security Policy**: Upgrade insecure requests to HTTPS
✅ **HSTS Headers**: Strict Transport Security enabled
✅ **Secure API Calls**: All API requests work with HTTPS

## Deployment Steps

### 1. Deploy Your Application
Click the **Deploy** button in your Replit project to create a deployment.

### 2. Access Your HTTPS URL
Once deployed, your app will be available at:
- **HTTPS URL**: `https://your-app-name.replit.app`
- **Custom Domain** (optional): Configure in deployment settings

### 3. Verify HTTPS is Working
Check the health endpoint to confirm HTTPS is enabled:
```bash
curl https://your-app-name.replit.app/api/health
```

You should see: `"https": "enabled"`

## Features Enabled with HTTPS

### Security Features
- 🔒 **Encrypted Communication**: All data transmission is encrypted
- 🛡️ **HSTS Headers**: Prevents downgrade attacks
- 🚫 **Mixed Content Protection**: Blocks insecure resources
- 🔐 **Secure Cookies**: Session cookies marked as secure

### Application Features
- ✅ **PWA Support**: Service workers require HTTPS
- ✅ **Geolocation**: Location services work properly
- ✅ **Camera Access**: Beach camera features enabled
- ✅ **Push Notifications**: Web push notifications functional

## Testing HTTPS Configuration

### 1. Check SSL Certificate
```bash
curl -I https://your-app-name.replit.app
```

### 2. Verify Security Headers
```bash
curl -I https://your-app-name.replit.app/api/health
```

Look for:
- `Strict-Transport-Security`
- `X-Content-Type-Options`
- `X-Frame-Options`

### 3. Test HTTP Redirect
```bash
curl -I http://your-app-name.replit.app
```

Should return `301` or `302` redirect to HTTPS.

## Environment Variables
No additional environment variables needed. The application automatically detects HTTPS in production.

## Troubleshooting

### Mixed Content Issues
If you see mixed content warnings:
1. Check all external resources use HTTPS URLs
2. Verify API calls use relative URLs or HTTPS

### Certificate Issues
Replit handles SSL certificates automatically. If issues persist:
1. Check deployment logs
2. Verify your domain configuration
3. Contact Replit support

## Custom Domain Setup (Optional)

1. Go to your deployment settings
2. Add your custom domain
3. Configure DNS records as instructed
4. SSL certificate will be automatically provisioned

## Monitoring HTTPS

The `/api/health` endpoint provides HTTPS status:
```json
{
  "status": "healthy",
  "https": "enabled",
  "protocol": "https"
}
```

## Next Steps

After deployment with HTTPS:
1. Update any external service configurations to use HTTPS URLs
2. Test all application features to ensure they work with HTTPS
3. Monitor security headers and SSL ratings
4. Consider adding Content Security Policy for enhanced security

Your VicSurf application is now ready for secure HTTPS deployment! 🚀