# Amir H. Jalali - Personal Portfolio Website

A modern, responsive portfolio website showcasing AI consulting expertise, data engineering experience, and thought leadership in artificial intelligence.

## 🌟 Overview

This is the personal portfolio website for Amir H. Jalali, an AI Consultant and Data Engineering Expert with 14+ years of experience. The site features a dynamic, animated interface with a focus on AI and technology content.

**Live Site**: [amirhjalali.com](https://amirhjalali.com)

## ✨ Key Features

### 🎯 Core Pages

- **Home**: Dynamic hero section with animated name morphing (AMIR ↔ MR AI), interactive 3D effects, and quick navigation
- **Projects**: Showcase of professional projects including Argumend, Plaiced AI, and data engineering work
- **Thoughts**: Blog-style articles on AI, machine learning, and technology trends
- **Resume**: Interactive timeline-based resume with skills visualization and experience details
- **Contact**: Professional contact form with social media links

### 🎨 Design Features

- **Dark Theme**: Modern dark interface with glassmorphism effects
- **Animated Elements**: Framer Motion animations throughout
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Interactive Components**: Magnetic buttons, ripple effects, and smooth transitions
- **Typography**: Custom fonts (Space Grotesk, Lato) for enhanced readability

### 🚀 Technical Features

- **Performance Optimized**: Built with Next.js 15 and Turbopack
- **SEO Ready**: Server-side rendering, meta tags, and structured data
- **Accessibility**: WCAG 2.1 compliant with keyboard navigation
- **Analytics**: Google Analytics 4 integration
- **PWA Ready**: Manifest file for progressive web app functionality

## 🛠️ Tech Stack

- **Framework**: Next.js 15.4.1 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI (shadcn/ui)
- **Icons**: Lucide React
- **Deployment**: GitHub Pages (Static Export)

## 📁 Project Structure

```
amirhjalali.com/
├── app/                    # Next.js app directory
│   ├── projects/          # Projects showcase page
│   ├── thoughts/          # Blog/articles pages
│   │   └── [id]/         # Individual article pages (static export)
│   ├── resume/           # Interactive resume page
│   ├── contact/          # Contact page
│   └── page.tsx          # Homepage
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── HeroEnhanced.tsx  # Homepage hero section
│   ├── NavigationEnhanced.tsx  # Main navigation
│   └── ProjectShowcase.tsx     # Projects display
├── lib/                   # Utility functions
│   ├── articles.ts       # Article data and management
│   ├── analytics.ts     # Analytics tracking
│   └── utils/            # Helper functions
└── public/               # Static assets
    └── images/          # Image assets
        ├── projects/    # Project images
        └── thoughts/    # Article images
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amirhjalali/amirhjalali.com.git
   cd amirhjalali.com
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```

   Edit `.env.local` and add required variables:
   ```env
   NEXT_PUBLIC_GA_ID=your_google_analytics_id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 📝 Content Management

### Articles/Thoughts

Articles are managed through the `lib/articles.ts` file with the following structure:
- Title, excerpt, and full content
- Tags and categories
- Publication dates
- Reading time estimates
- Featured images

### Projects

Projects are showcased with:
- Detailed descriptions
- Technology stacks
- Live/demo links
- Visual previews
- Key features and achievements

## 🎨 Customization

### Colors
The site uses a custom color scheme defined in `tailwind.config.js`:
- Primary: AI Green (`#00FF88`)
- Secondary: AI Blue (`#00D9FF`)
- Background: Dark theme with gradient effects

### Typography
- Headers: Space Grotesk
- Body: Lato
- Code: JetBrains Mono

## 📊 Performance

- **Lighthouse Score**: 95+ Performance
- **Core Web Vitals**: Optimized for LCP, FID, and CLS
- **Bundle Size**: Code-split and lazy-loaded components
- **Image Optimization**: Next.js Image component with responsive sizing

## 🔐 Security

- Server-side form validation
- Rate limiting on API endpoints
- Secure headers configuration
- Environment variable protection

## 🚀 Deployment

### GitHub Pages (Current)

This site is deployed as a static site on GitHub Pages using Next.js static export.

#### Automatic Deployment

The site automatically deploys on push to the `main` branch via GitHub Actions.

#### Manual Deployment

1. **Build Static Site**
   ```bash
   npm run build
   ```
   This creates static files in the `out/` directory.

2. **GitHub Actions Workflow**
   The workflow file (`.github/workflows/deploy.yml`) handles:
   - Building the static site
   - Uploading to GitHub Pages
   - Deploying to production

3. **Configure GitHub Pages**
   - Go to repository Settings → Pages
   - Set source to "GitHub Actions"
   - Custom domain: `amirhjalali.com` (configured via `public/CNAME`)

4. **DNS Configuration**
   Point your domain to GitHub Pages:
   - A records: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Or CNAME: `<username>.github.io`

#### Important Notes
- Contact form uses `mailto:` links (no server-side processing)
- All pages are pre-rendered at build time
- Images are served unoptimized (no Next.js image optimization)

## 📈 Analytics & Monitoring

- **Google Analytics 4**: Page views, events, and user behavior
- **Web Vitals**: Performance monitoring
- **Error Tracking**: Console error logging

## 🤝 Contributing

While this is a personal portfolio, suggestions and bug reports are welcome:

1. Open an issue for bugs or suggestions
2. Fork for major changes
3. Submit pull requests with clear descriptions

## 📄 License

Copyright © 2024 Amir H. Jalali. All rights reserved.

## 📧 Contact

- **Email**: hello@amirhjalali.com
- **LinkedIn**: [amirhjalali](https://linkedin.com/in/amirhjalali)
- **GitHub**: [amirhjalali](https://github.com/amirhjalali)

---

**Current Version**: 3.0.0
**Last Updated**: October 2024
**Built with**: Next.js 15 (Static Export), TypeScript, and modern web technologies
**Deployment**: GitHub Pages with GitHub Actions automation