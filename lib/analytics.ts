// Analytics and user engagement tracking utilities
export interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
}

// Track custom events
export const trackEvent = (event: AnalyticsEvent) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event.action, {
      event_category: event.category,
      event_label: event.label,
      value: event.value,
    });
  }
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('config', process.env.NEXT_PUBLIC_GA_ID, {
      page_path: url,
    });
  }
};

// Track user engagement metrics
export const trackEngagement = () => {
  let scrollDepth = 0;
  let timeOnPage = 0;
  let engagementTimer: NodeJS.Timeout;

  // Track scroll depth
  const trackScrollDepth = () => {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollPercentage = Math.round((scrollTop + windowHeight) / documentHeight * 100);
    
    if (scrollPercentage > scrollDepth) {
      scrollDepth = scrollPercentage;
      
      if (scrollDepth === 25 || scrollDepth === 50 || scrollDepth === 75 || scrollDepth === 100) {
        trackEvent({
          category: 'Engagement',
          action: 'Scroll Depth',
          label: `${scrollDepth}%`,
          value: scrollDepth,
        });
      }
    }
  };

  // Track time on page
  const startEngagementTimer = () => {
    engagementTimer = setInterval(() => {
      timeOnPage += 1;
      
      // Track at 30s, 1min, 2min, 5min intervals
      if (timeOnPage === 30 || timeOnPage === 60 || timeOnPage === 120 || timeOnPage === 300) {
        trackEvent({
          category: 'Engagement',
          action: 'Time on Page',
          label: `${timeOnPage} seconds`,
          value: timeOnPage,
        });
      }
    }, 1000);
  };

  // Initialize tracking
  if (typeof window !== 'undefined') {
    window.addEventListener('scroll', trackScrollDepth);
    startEngagementTimer();
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => {
      clearInterval(engagementTimer);
      trackEvent({
        category: 'Engagement',
        action: 'Session Duration',
        label: `${timeOnPage} seconds`,
        value: timeOnPage,
      });
    });
  }
};

// Track outbound links
export const trackOutboundLink = (url: string) => {
  trackEvent({
    category: 'Outbound',
    action: 'Click',
    label: url,
  });
};

// Track file downloads
export const trackDownload = (fileName: string) => {
  trackEvent({
    category: 'Download',
    action: 'Click',
    label: fileName,
  });
};

// Track form submissions
export const trackFormSubmit = (formName: string) => {
  trackEvent({
    category: 'Form',
    action: 'Submit',
    label: formName,
  });
};

// Track errors
export const trackError = (error: Error, fatal: boolean = false) => {
  trackEvent({
    category: 'Error',
    action: fatal ? 'Fatal Error' : 'Error',
    label: error.message,
  });
};

// Track Calendly booking events
export const trackCalendlyBooking = (eventType: string = 'scheduled') => {
  trackEvent({
    category: 'Calendly',
    action: 'Booking',
    label: eventType,
  });
};

// Track contact form submissions
export const trackContactFormSubmit = (formData?: { name?: string; email?: string; subject?: string }) => {
  trackEvent({
    category: 'Contact',
    action: 'Form Submit',
    label: formData?.subject || 'Contact Form',
  });
};

// Track AI tools interactions
export const trackAIToolsInteraction = (toolName: string, action: string = 'interact') => {
  trackEvent({
    category: 'AI Tools',
    action: action,
    label: toolName,
  });
};

// Track email newsletter subscriptions
export const trackEmailSubscription = (email?: string, status: string = 'subscribed') => {
  trackEvent({
    category: 'Newsletter',
    action: 'Subscription',
    label: status,
  });
};