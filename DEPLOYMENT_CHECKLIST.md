# Deployment Checklist for amirhjalali.com

## ✅ Pre-Deployment Verification

### Code Quality
- [x] Build passes without errors (`npm run build`)
- [x] No TypeScript errors
- [x] All dependencies installed correctly
- [x] Console.log statements removed for production
- [x] No TODO/FIXME comments in code

### Assets & Performance
- [x] All images optimized (reduced 3.9MB image to 154KB)
- [x] All images use local files (no external URLs)
- [x] Bundle size optimized (99.7 kB First Load JS)
- [x] Next.js 15 with Turbopack configured

### Security
- [x] API keys only used server-side
- [x] No exposed secrets in client code
- [x] Environment variables properly configured
- [x] Safe HTML rendering (sanitized content)

### SEO & Metadata
- [x] robots.txt configured
- [x] sitemap.xml generated
- [x] manifest.json for PWA
- [x] Open Graph metadata set
- [x] Favicon and icons present

## 🚀 Deployment Steps

### 1. Environment Setup
```bash
# Copy and configure environment variables
cp .env.example .env.local

# Required variables:
OPENAI_API_KEY=your_key_here

# Optional:
NEXT_PUBLIC_GA_MEASUREMENT_ID=your_ga_id
```

### 2. Vercel Deployment (Recommended)

1. **Connect Repository**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Deploy
   vercel
   ```

2. **Set Environment Variables in Vercel Dashboard**
   - Go to Project Settings > Environment Variables
   - Add `OPENAI_API_KEY`
   - Add `NEXT_PUBLIC_GA_MEASUREMENT_ID` (optional)

3. **Configure Domain**
   - Add custom domain: amirhjalali.com
   - Update DNS records:
     - A Record: 76.76.21.21
     - CNAME: cname.vercel-dns.com

### 3. Alternative Deployment Options

#### Netlify
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

#### Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# Deploy
railway up
```

#### Self-Hosted (VPS/Docker)
```bash
# Build production
npm run build

# Start production server
npm run start

# Or use PM2
pm2 start npm --name "portfolio" -- start
```

## 📋 Post-Deployment Checklist

### Verification
- [ ] Site loads at production URL
- [ ] All pages accessible
- [ ] Images load correctly
- [ ] Contact form works
- [ ] AI generation features work (if API key set)
- [ ] Mobile responsive design works
- [ ] Navigation works properly

### Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Test page load speed
- [ ] Verify caching headers

### Monitoring
- [ ] Google Analytics connected (if configured)
- [ ] Set up uptime monitoring (UptimeRobot, Pingdom)
- [ ] Configure error tracking (Sentry - optional)
- [ ] Set up performance monitoring

### DNS & SSL
- [ ] SSL certificate active
- [ ] Force HTTPS redirect
- [ ] www to non-www redirect (or vice versa)
- [ ] DNS propagation complete

## 🔧 Maintenance

### Regular Updates
```bash
# Update dependencies monthly
npm update
npm audit fix

# Check for major updates
npm outdated
```

### Backup Strategy
- GitHub repository serves as code backup
- Consider database backups if storing articles
- Export analytics data periodically

### Content Updates
- Articles stored in localStorage (client-side)
- Update project images in `/public/images/projects/`
- Modify content directly in page components

## 📱 API Limits & Costs

### OpenAI API Usage
- GPT-4: ~$0.03 per 1K tokens
- DALL-E 3: ~$0.04 per image
- Whisper: ~$0.006 per minute
- Set usage limits in OpenAI dashboard

### Vercel Free Tier Limits
- 100GB bandwidth/month
- Serverless function execution: 100GB-hours
- Build minutes: 6,000/month

## 🎉 Launch Checklist

- [ ] Announce on LinkedIn
- [ ] Share with network
- [ ] Submit to search consoles
- [ ] Test all features one final time
- [ ] Celebrate! 🚀

---

**Status: READY FOR DEPLOYMENT** ✅

All systems checked and optimized. The site is production-ready!

Last Updated: September 2, 2025