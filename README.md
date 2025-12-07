# Amir H. Jalali - Personal Portfolio Website

A modern, responsive portfolio website showcasing AI consulting expertise, data engineering experience, and thought leadership in artificial intelligence.

## 🌟 Overview

This is the personal portfolio website for Amir H. Jalali, an AI Consultant and Data Engineering Expert with 14+ years of experience. The site features a dynamic, animated interface with a focus on AI and technology content.

**Live Site**: [amirhjalali.com](https://amirhjalali.com)

## ✨ Key Features

### 🎯 Core Pages

- **Home**: Dynamic hero section with animated name morphing, interactive 3D effects, and quick navigation
- **Projects**: Showcase of professional projects including Argumend, Plaiced AI, and data engineering work
- **Thoughts**: Blog-style articles on AI, machine learning, and technology trends (database-backed)
- **Contact**: Professional resume/CV with experience timeline and skills

### 🎨 Design Features

- **Dark Theme**: Modern dark interface with glassmorphism effects
- **Animated Elements**: Framer Motion animations throughout
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Interactive Components**: Magnetic buttons, ripple effects, and smooth transitions
- **Typography**: Custom fonts (Space Grotesk, Lato) for enhanced readability

### 🚀 Technical Features

- **Performance Optimized**: Built with Next.js 15 and Turbopack
- **Database Backend**: PostgreSQL with Prisma ORM for articles and drafts
- **Admin Dashboard**: Full CMS for article management with AI generation
- **AI Integration**: OpenAI and Google Gemini for content generation
- **SEO Ready**: Server-side rendering, meta tags, and structured data

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router, Standalone Output)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **UI Components**: Radix UI (shadcn/ui)
- **AI**: OpenAI API, Google Gemini
- **Deployment**: Coolify on VPS

## 📁 Project Structure

```
amirhjalali.com/
├── app/                    # Next.js app directory
│   ├── admin/             # Admin dashboard
│   ├── api/               # API routes
│   ├── projects/          # Projects showcase page
│   ├── thoughts/          # Blog/articles pages
│   │   └── [id]/         # Individual article pages
│   ├── contact/           # Contact/Resume page
│   └── page.tsx          # Homepage
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   ├── Spotlight.tsx     # Homepage spotlight effect
│   ├── PortraitReveal.tsx # Interactive portrait
│   └── DraftEditor.tsx   # Article editor
├── lib/                   # Utility functions
│   ├── api-client.ts     # API client
│   ├── ai-service.ts     # AI generation
│   ├── gemini-service.ts # Gemini integration
│   └── data.ts           # Database queries
├── prisma/               # Database schema and migrations
│   ├── schema.prisma     # Prisma schema
│   └── seed.ts           # Database seeding
└── public/               # Static assets
    └── images/          # Image assets
```

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- PostgreSQL database

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
   cp .env.example .env
   ```

   Edit `.env` and add required variables:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database
   OPENAI_API_KEY=your_openai_api_key
   GOOGLE_GENERATIVE_AI_API_KEY=your_gemini_api_key
   ```

4. **Set up the database**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Coolify (Current)

This site is deployed on a VPS using Coolify with standalone output mode.

#### Build Configuration

- **Build Command**: `npm run build`
- **Start Command**: `npm run start`
- **Output Mode**: `standalone`

#### Environment Variables (Coolify)

Set these in your Coolify project settings:
- `DATABASE_URL`
- `OPENAI_API_KEY`
- `GOOGLE_GENERATIVE_AI_API_KEY`

## 📊 Admin Dashboard

Access the admin dashboard at `/admin` to:
- Generate AI-powered articles
- Manage drafts and published content
- Edit article content with live preview
- Schedule article publishing

## 🤝 Contributing

While this is a personal portfolio, suggestions and bug reports are welcome:

1. Open an issue for bugs or suggestions
2. Fork for major changes
3. Submit pull requests with clear descriptions

## 📄 License

Copyright © 2024-2025 Amir H. Jalali. All rights reserved.

## 📧 Contact

- **Email**: amirhjalali@gmail.com
- **LinkedIn**: [amirhjalali](https://linkedin.com/in/amirhjalali)
- **GitHub**: [amirhjalali](https://github.com/amirhjalali)

---

**Current Version**: 4.0.0
**Last Updated**: December 2025
**Built with**: Next.js 15, TypeScript, Prisma, PostgreSQL
**Deployment**: Coolify on VPS