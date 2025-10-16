# Admin Panel Setup for GitHub Pages

## Required Setup Steps

### 1. Add GitHub Secrets

You need to add the admin credentials as GitHub repository secrets:

1. Go to your repository on GitHub: `https://github.com/amirhjalali/amirhjalali.com`
2. Click on **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Add these two secrets:

   **Secret 1:**
   - Name: `ADMIN_USERNAME`
   - Value: Your desired admin username (e.g., `admin`)

   **Secret 2:**
   - Name: `ADMIN_PASSWORD`
   - Value: Your desired admin password (e.g., `changeme123` or something more secure)

### 2. Access URLs

Once deployed, your admin panel will be available at:

- **Login Page**: `https://amirhjalali.github.io/amirhjalali.com/admin/login`
- **Dashboard**: `https://amirhjalali.github.io/amirhjalali.com/admin`

### 3. How It Works

#### Client-Side Authentication
- The admin credentials are baked into the static build at build time
- Sessions are stored in browser localStorage
- Sessions expire after 24 hours

#### Draft Management
- Draft articles are stored in browser localStorage
- Drafts created on your local machine won't appear on GitHub Pages (and vice versa)
- This is intentional - you can review/publish locally or on the deployed site

#### Security Notes

⚠️ **Important Security Considerations:**

1. **Client-Side Auth**: This is client-side authentication, which means:
   - Anyone with developer tools can potentially find the credentials in the built JavaScript
   - This is suitable for low-security scenarios (reviewing AI-generated drafts)
   - NOT suitable for highly sensitive operations

2. **Best Practices**:
   - Use a unique password (don't reuse passwords from other accounts)
   - Don't use this for critical security requirements
   - Consider this as "security through obscurity" - good enough for draft review
   - Change passwords periodically if needed

3. **Alternative for Better Security**:
   - For production use with high security needs, consider:
     - Moving to a framework with server-side rendering (Vercel, Netlify)
     - Using a proper backend with server-side authentication
     - Using a CMS with built-in authentication (Sanity, Contentful)

## Testing

### Local Testing
```bash
npm run dev
```
Visit: `http://localhost:3000/admin/login`

### After Deployment
1. Push changes to GitHub
2. Wait for GitHub Actions to build and deploy (2-3 minutes)
3. Visit: `https://amirhjalali.github.io/amirhjalali.com/admin/login`
4. Login with your credentials

## Workflow

### Creating and Publishing Articles

1. **Generate Draft** (future feature):
   - Run AI generation script locally or via GitHub Actions
   - Script saves article as draft in localStorage

2. **Review Draft**:
   - Login to admin panel
   - View all pending drafts
   - Click on a draft to preview

3. **Publish or Delete**:
   - Click "Publish Article" to make it live
   - Click "Delete Draft" to remove it
   - Published articles appear on `/thoughts` page immediately

## Current Limitations

1. **localStorage Separation**: Drafts on local dev are separate from deployed site
2. **No Backend**: Everything is client-side, stored in browser
3. **No Multi-Device Sync**: Each browser/device has its own localStorage
4. **Client-Side Credentials**: Credentials are in the build (see security notes above)

## Future Enhancements

Possible improvements:
- Add backend service for draft storage (Firebase, Supabase)
- Implement proper server-side authentication
- Add draft editing capabilities
- Add AI generation UI in admin panel
- Add image upload functionality

## Troubleshooting

### Login doesn't work on deployed site
- Check that GitHub Secrets are set correctly
- Verify the build completed successfully in GitHub Actions
- Clear browser cache and try again

### Drafts not appearing
- Remember: localStorage is browser-specific
- Drafts created locally won't appear on deployed site
- Check browser console for errors

### Can't access admin pages
- Verify you're using the correct URL with `/amirhjalali.com` prefix
- Check that the build succeeded in GitHub Actions
- Try clearing cookies and localStorage
