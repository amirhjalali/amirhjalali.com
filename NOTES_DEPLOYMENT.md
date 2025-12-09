# Notes Feature - Deployment Guide

## Coolify Subdomain Configuration

### Prerequisites
- Existing Coolify deployment at `gaboojabrothers.cloud`
- DNS access to add subdomain
- SSL auto-generation enabled (Let's Encrypt)

### Steps to Configure `notes.amirhjalali.com`

#### 1. Add Subdomain in Coolify Dashboard

1. Log into Coolify dashboard
2. Navigate to your application: `amirhjalali.com`
3. Go to **Application → Domains** section
4. Click **"Add Domain"**
5. Enter: `notes.amirhjalali.com`
6. Save the configuration

Coolify will:
- Point the subdomain to the same Next.js application
- Auto-generate SSL certificate via Let's Encrypt
- Handle HTTPS redirection

#### 2. DNS Configuration (if needed)

If DNS is not automatically configured, add:

**For Cloudflare/DNS Provider:**
- Type: `A` or `CNAME`
- Name: `notes`
- Target: Same IP/domain as main site
- Proxy: Enabled (if using Cloudflare)

**For Hostinger:**
- Type: `A Record`
- Host: `notes`
- Points to: Same IP as `gaboojabrothers.cloud`
- TTL: 14400 (or default)

#### 3. Middleware Routing

The middleware is already configured in `/middleware.ts`:
- Detects `notes.*` subdomain
- Rewrites to `/notes/*` path internally
- Shares `admin_session` cookie for authentication
- Redirects to `/notes/login` if unauthenticated

#### 4. Verification Checklist

After deployment, verify:

- [ ] `https://notes.amirhjalali.com` loads correctly
- [ ] SSL certificate is valid (green padlock)
- [ ] Login page appears at `notes.amirhjalali.com`
- [ ] Authentication works (same session as admin)
- [ ] Can create notes
- [ ] Notes list displays correctly
- [ ] Individual note view works
- [ ] Subdomain routing preserves query params

#### 5. Local Testing

For local development with subdomain:

1. Add to `/etc/hosts`:
   ```
   127.0.0.1 notes.localhost
   ```

2. Access the app at:
   ```
   http://notes.localhost:3000
   ```

3. Test authentication and routing locally

### Production URLs

- Main site: `https://gaboojabrothers.cloud`
- Notes app: `https://notes.amirhjalali.com`
- Admin panel: `https://gaboojabrothers.cloud/admin`

### Troubleshooting

**Issue: Subdomain not resolving**
- Check DNS propagation (can take up to 48 hours)
- Use `dig notes.amirhjalali.com` to verify DNS
- Check Coolify domain configuration

**Issue: SSL certificate error**
- Wait for Let's Encrypt auto-generation (can take 1-5 minutes)
- Check Coolify SSL settings
- Ensure domain is properly pointed to server

**Issue: 404 on notes routes**
- Verify middleware is deployed
- Check Next.js build completed successfully
- Review Coolify deployment logs

**Issue: Authentication not working across subdomains**
- Ensure cookie domain is set correctly in auth actions
- Verify middleware is running on both domains
- Check browser console for cookie issues

### Environment Variables

No additional environment variables needed for subdomain routing. The existing configuration includes:

```bash
DATABASE_URL=postgresql://...
OPENAI_API_KEY=your_key  # For Phase 2 (AI processing)
```

### Phase 1 Complete ✅

The Notes feature is now fully functional for Phase 1:
- Database schema ✅
- API routes ✅
- API client ✅
- Subdomain routing ✅
- Notes pages ✅
- QuickAdd component ✅
- Notes list with filtering ✅
- Individual note view ✅
- Deployment ready ✅

### Next Steps (Phase 2)

Phase 2 will add AI processing capabilities:
- Redis queue setup
- Background worker for processing
- URL metadata extraction
- AI summarization (GPT-4o-mini)
- Topic extraction
- Processing status tracking

See Linear issues AMI-14 through AMI-24 for Phase 2 tasks.
