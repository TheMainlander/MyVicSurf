# Post-Deployment Verification Guide

## After Deploying VicSurf

Once you've clicked the Deploy button and your app is live, follow these steps to verify everything is working correctly.

### Step 1: Get Your Production URL

Your deployed app will be available at:
```
https://your-project-name.replit.app
```

Or your custom domain if configured.

### Step 2: Run the Production Debug Script

In your Replit Shell, run the debug script:

```bash
node production-debug.js
```

Or use the npm script:
```bash
npm run debug:prod
```

### Step 3: Interpret the Results

The debug script will check:

#### ✅ **Healthy Deployment**
```
🚀 VicSurf Production Debug Tool
================================

1. Checking Health Endpoint...
   GET https://your-app.replit.app/api/health
   Status: 200
   ✅ Health Check Passed
   📊 Database: connected
   🔒 HTTPS: enabled
   🌍 Environment: production
   📍 Surf Spots: 4

2. Checking Frontend...
   Status: 200
   ✅ Frontend Loading
   ✅ VicSurf App Detected

3. Checking API Endpoints...
   Testing /api/surf-spots...
   ✅ /api/surf-spots (200)
   Testing /api/carousel-images...
   ✅ /api/carousel-images (200)
   Testing /api/auth/user...
   ✅ /api/auth/user (401)

4. Checking SSL Certificate...
   ✅ SSL Certificate Valid
   ✅ HTTP to HTTPS Redirect Working

📋 Summary:
===========
✅ Production deployment appears healthy
🎉 VicSurf is ready for users!
```

#### ❌ **Deployment Issues**

If you see errors, the script will provide specific troubleshooting guidance:

**Internal Server Error (500)**
```
1. Checking Health Endpoint...
   ❌ Health Check Failed
   Response: Internal Server Error
```

**Solutions:**
- Check Replit deployment logs
- Verify environment variables are set
- Ensure database is connected
- Try redeploying

**Frontend Issues**
```
2. Checking Frontend...
   ❌ Frontend Failed
   Response: Cannot GET /
```

**Solutions:**
- Check if build completed successfully
- Verify static files are being served
- Check for build errors in logs

### Step 4: Manual Verification

If the debug script shows all green, manually test these features:

1. **Visit your production URL** - Should load the VicSurf homepage
2. **Check location features** - Test the location persistence duration selection
3. **Browse surf spots** - Verify data loads correctly
4. **Test HTTPS** - All resources should load securely

### Step 5: Monitor and Maintain

#### Health Monitoring
Bookmark your health endpoint:
```
https://your-app.replit.app/api/health
```

#### Production Logs
Monitor your deployment logs in Replit for any errors or issues.

#### Location Feature Testing
Test the new location persistence feature:
1. Visit your app
2. Click to share location
3. Verify the duration selection dialog appears
4. Test different duration options
5. Check location settings in profile page

## Troubleshooting Common Issues

### Database Connection Failed
```bash
# Check database status
curl https://your-app.replit.app/api/health
```

If database shows as disconnected:
- Verify DATABASE_URL environment variable
- Check PostgreSQL service status
- Try restarting the deployment

### HTTPS Issues
```bash
# Test HTTPS redirect
curl -I http://your-app.replit.app
# Should return 301/302 redirect
```

### API Endpoints Not Working
```bash
# Test specific endpoints
curl https://your-app.replit.app/api/surf-spots
curl https://your-app.replit.app/api/carousel-images
```

## Success Checklist

- [ ] Debug script shows all green checkmarks
- [ ] Frontend loads and displays VicSurf branding
- [ ] Health endpoint returns 200 with database connected
- [ ] HTTPS is enabled and working
- [ ] Location permission dialog works with duration selection
- [ ] Surf spots and data load correctly
- [ ] API endpoints respond appropriately

## Need Help?

If you encounter issues:

1. **Run the debug script first**: `node production-debug.js`
2. **Check deployment logs** in Replit console
3. **Verify environment variables** are properly set
4. **Try redeploying** if issues persist

Your VicSurf application is now live and ready for users to enjoy Victoria's surf conditions with privacy-controlled location features!