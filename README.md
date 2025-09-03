# MR AI Portfolio

A modern, AI-powered portfolio website built with Next.js, featuring voice-to-article generation, interactive resume timeline, and AI tools showcase.

## ✨ Features

- **🎨 Modern Design**: Beautiful dark theme with glassmorphism effects and smooth animations
- **🎤 Voice-to-Article**: Transform voice recordings into polished articles using AI
- **📝 AI Content Generation**: Generate articles from text prompts with automated image creation
- **💼 Interactive Resume**: Timeline-based resume with filtering and animations
- **🔧 AI Tools Showcase**: Display of AI projects with detailed modals
- **📱 Responsive Design**: Optimized for all devices with mobile-first approach
- **⚡ Performance**: Built with Next.js 15 and optimized for Core Web Vitals
- **♿ Accessibility**: WCAG 2.1 compliant with keyboard navigation support
- **🔍 SEO Optimized**: Server-side rendering with meta tags and structured data
- **📊 Analytics Ready**: Google Analytics 4 integration support

## 🚀 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **AI Integration**: OpenAI API (GPT-4, Whisper, DALL-E)
- **Deployment**: Vercel

## 🛠️ Setup Instructions

### Prerequisites

- Node.js 18+ 
- npm or yarn
- OpenAI API key

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/amirhjalali/amirhjalali.com.git
   cd amirhjalali.com/mrai-portfolio
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your OpenAI API key:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   Visit [http://localhost:3000](http://localhost:3000)

## 🎯 Key Features Explained

### Voice-to-Article Generation

1. **Record Audio**: Use the built-in voice recorder to capture your thoughts
2. **AI Transcription**: Whisper API converts speech to text
3. **Content Generation**: GPT-4 transforms transcription into structured articles
4. **Image Generation**: DALL-E creates relevant images for the article
5. **Export**: Copy generated content or use in your blog

### Interactive Resume

- Timeline-based layout with work/education filtering
- Animated progress indicators
- Skills categorization
- PDF download functionality (placeholder)

### AI Tools Showcase

- Filterable tool gallery
- Detailed modal views
- Status indicators (Live, Beta, Development)
- Technology stack displays

## 📁 Project Structure

```
mrai-portfolio/
├── app/
│   ├── api/generate/         # AI content generation API
│   ├── articles/             # Blog/articles pages
│   ├── ai-tools/             # AI tools showcase
│   ├── generate/             # Voice-to-article interface
│   ├── projects/             # Projects showcase
│   ├── resume/               # Interactive resume
│   └── contact/              # Contact page
├── components/
│   ├── VoiceRecorder.tsx     # Voice recording component
│   ├── Navigation.tsx        # Main navigation
│   └── AnimatedLogo.tsx      # Logo animation
└── public/                   # Static assets
```

## 🔧 Configuration

### OpenAI API Setup

1. Get your API key from [OpenAI Platform](https://platform.openai.com/)
2. Add it to your `.env.local` file
3. Ensure you have credits for:
   - GPT-4 (content generation)
   - Whisper (voice transcription)
   - DALL-E 3 (image generation)

### Customization

- **Colors**: Edit `tailwind.config.js` for color scheme
- **Content**: Update article data in `app/articles/page.tsx`
- **Resume**: Modify experience data in `app/resume/page.tsx`
- **Tools**: Update tools data in `app/ai-tools/page.tsx`

## 📝 Content Management

### Adding Articles

Currently, articles are stored in the component files. For production use, consider:

- Adding a headless CMS (Contentful, Strapi)
- Using a database (PostgreSQL, MongoDB)
- Implementing a markdown-based system

### Generated Content

AI-generated articles include:
- Structured content with headings
- SEO-optimized formatting
- Relevant tags and metadata
- Reading time estimates
- Word counts

## 🚀 Deployment

### Vercel (Recommended)

1. **Connect Repository**
   - Import project in Vercel dashboard
   - Set root directory to `mrai-portfolio`

2. **Environment Variables**
   - Add `OPENAI_API_KEY` in project settings
   - Deploy

3. **Custom Domain**
   - Add your domain in project settings
   - Update DNS records

### Other Platforms

The project can be deployed on any platform supporting Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🔐 Security Considerations

- API keys are server-side only
- File upload validation for voice recordings
- Rate limiting on API routes (recommended)
- Content moderation for generated articles

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙋‍♂️ Support

For questions or issues:
- Open an issue on GitHub
- Contact: hello@amirhjalali.com
- LinkedIn: [amirhjalali](https://linkedin.com/in/amirhjalali)

---

Built with ❤️ using AI and modern web technologies.

---

*Last updated: September 2025*