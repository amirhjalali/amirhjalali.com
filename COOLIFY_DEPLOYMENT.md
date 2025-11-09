# Coolify Deployment Guide

## Overview
This Next.js application is deployed on a Hostinger VPS using Coolify at **gaboojabrothers.cloud**.

## Prerequisites
- Coolify installed and running on VPS
- Domain `gaboojabrothers.cloud` pointed to VPS
- GitHub repository access

## Deployment Configuration

### 1. Create New Project in Coolify

1. Open Coolify dashboard
2. Click "New Project" or "New Application"
3. Select "Git Repository" as source
4. Connect your GitHub account if not already connected

### 2. Repository Settings

- **Repository URL**: `https://github.com/amirhjalali/amirhjalali.com`
- **Branch**: `main`
- **Build Pack**: Node.js / Next.js (auto-detected)

### 3. Build Settings

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm run start
```

**Port:**
```
3000
```

### 4. Environment Variables

Add these environment variables in Coolify:

```bash
# Node Environment
NODE_ENV=production

# Admin Authentication
NEXT_PUBLIC_ADMIN_USERNAME=admin
NEXT_PUBLIC_ADMIN_PASSWORD_HASH=057ba03d6c44104863dc7361fe4578965d1887360f90a0895882e58a6248fc86
NEXT_PUBLIC_ADMIN_PASSWORD=changeme

# OpenAI API Key (for article generation)
OPENAI_API_KEY=your_openai_api_key_here

# Optional: Anthropic API Key (alternative for article generation)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
```

### 5. Domain Configuration

**Primary Domain:**
- `gaboojabrothers.cloud`

**SSL:**
- Enable automatic SSL with Let's Encrypt
- Coolify handles this automatically

### 6. Health Check

**Health Check URL:**
```
/
```

**Expected Status Code:**
```
200
```

### 7. Auto-Deploy

Enable "Auto Deploy" to automatically deploy on git push to main branch.

## Deployment Process

### Initial Deployment

1. Configure all settings in Coolify
2. Add environment variables
3. Click "Deploy" button
4. Wait 2-3 minutes for build to complete
5. Access site at `https://gaboojabrothers.cloud`

### Subsequent Deployments

Simply push to main branch:
```bash
git add .
git commit -m "Your commit message"
git push origin main
```

Coolify will automatically:
1. Detect the push
2. Pull latest code
3. Build the application
4. Deploy with zero downtime
5. Update SSL if needed

## Verification

After deployment, verify:

1. **Homepage**: `https://gaboojabrothers.cloud`
2. **Thoughts Page**: `https://gaboojabrothers.cloud/thoughts`
3. **Admin Panel**: `https://gaboojabrothers.cloud/admin`
4. **API Route**: `https://gaboojabrothers.cloud/api/generate-article`

## Features Enabled

With VPS deployment, these features now work:

✅ **Full Next.js App** - No more static export limitations
✅ **API Routes** - Server-side article generation endpoint
✅ **Clean URLs** - No `/amirhjalali.com` basePath
✅ **Server-Side Rendering** - Better SEO and performance
✅ **Environment Variables** - Secure API key storage
✅ **Zero-Downtime Deploys** - Coolify handles this automatically

## Monitoring

Coolify provides:
- Real-time logs
- Resource usage (CPU, memory)
- Deployment history
- Automatic restarts on failure

## Rollback

If something goes wrong:
1. Go to Coolify dashboard
2. Navigate to application
3. Click "Deployments" tab
4. Select previous successful deployment
5. Click "Redeploy"

## Performance Optimization

Consider these optimizations:

1. **Image Optimization**: Next.js automatically optimizes images
2. **Caching**: Configure nginx caching in Coolify
3. **CDN**: Add Cloudflare in front of gaboojabrothers.cloud
4. **Database**: If needed, add PostgreSQL/MySQL service in Coolify

## Troubleshooting

### Build Fails
- Check logs in Coolify dashboard
- Verify Node.js version (should be 18+)
- Ensure all dependencies in package.json

### App Won't Start
- Check environment variables are set
- Verify port 3000 is correct
- Check application logs

### SSL Issues
- Wait 2-3 minutes for Let's Encrypt certificate
- Verify DNS propagation
- Check Coolify proxy settings

## Backup Strategy

1. **Code**: Already backed up in GitHub
2. **Database**: Not applicable (using JSON files)
3. **Images**: Stored in `public/images/thoughts/` (in git)
4. **Data Files**: `public/data/*.json` (in git)

## Costs

Hostinger VPS pricing typically:
- Basic VPS: ~$4-8/month
- Coolify: Free and open-source
- Domain: ~$10-15/year
- SSL: Free (Let's Encrypt)

## Next Steps

1. Set up monitoring alerts
2. Configure backups
3. Add Cloudflare for CDN (optional)
4. Set up staging environment (optional)
5. Configure CI/CD for automated tests (optional)

## Support

- **Coolify Docs**: https://coolify.io/docs
- **Hostinger Support**: https://www.hostinger.com/contact
- **Next.js Docs**: https://nextjs.org/docs

---

**Status**: Ready for deployment ✅
**Domain**: gaboojabrothers.cloud
**Platform**: Coolify on Hostinger VPS
**Last Updated**: 2025-11-09
