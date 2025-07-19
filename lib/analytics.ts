// Google Analytics utilities for event tracking and conversions

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

// Track page views
export const trackPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID, {
      page_title: title || document.title,
      page_location: url,
    })
  }
}

// Track custom events
export const trackEvent = (eventName: string, parameters?: Record<string, any>) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, {
      ...parameters,
      timestamp: new Date().toISOString(),
    })
  }
}

// Track conversions
export const trackConversion = (action: string, value?: number, currency = 'USD') => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
      value: value,
      currency: currency,
      action: action,
      timestamp: new Date().toISOString(),
    })
  }
}

// Track specific business events
export const trackContactFormSubmit = () => {
  trackEvent('contact_form_submit', {
    event_category: 'engagement',
    event_label: 'contact_form',
  })
  trackConversion('contact_form_submit')
}

export const trackProjectView = (projectName: string) => {
  trackEvent('project_view', {
    event_category: 'engagement',
    event_label: 'project',
    project_name: projectName,
  })
}

export const trackThoughtView = (thoughtTitle: string) => {
  trackEvent('thought_view', {
    event_category: 'engagement',
    event_label: 'thought',
    thought_title: thoughtTitle,
  })
}

export const trackResumeDownload = () => {
  trackEvent('resume_download', {
    event_category: 'engagement',
    event_label: 'resume',
  })
  trackConversion('resume_download')
}

export const trackAIToolsInteraction = (toolName: string) => {
  trackEvent('ai_tools_interaction', {
    event_category: 'engagement',
    event_label: 'ai_tools',
    tool_name: toolName,
  })
}

export const trackArticleGeneration = () => {
  trackEvent('article_generation', {
    event_category: 'ai_usage',
    event_label: 'generate',
  })
  trackConversion('article_generation')
}

export const trackEmailSubscription = () => {
  trackEvent('email_subscription', {
    event_category: 'conversion',
    event_label: 'newsletter',
  })
  trackConversion('email_subscription')
}

export const trackCalendlyBooking = () => {
  trackEvent('calendly_booking', {
    event_category: 'conversion',
    event_label: 'consultation',
  })
  trackConversion('calendly_booking', 100) // Assign value to consultation booking
}

export const trackExternalLinkClick = (url: string, linkName: string) => {
  trackEvent('external_link_click', {
    event_category: 'engagement',
    event_label: 'external_link',
    link_url: url,
    link_name: linkName,
  })
}