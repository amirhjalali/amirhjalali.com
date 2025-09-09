// Browser and device detection utilities
export const browserUtils = {
  // Get browser info
  getBrowser: (): { name: string; version: string } => {
    const ua = navigator.userAgent;
    let name = 'Unknown';
    let version = 'Unknown';
    
    if (ua.indexOf('Firefox') > -1) {
      name = 'Firefox';
      version = ua.match(/Firefox\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.indexOf('Chrome') > -1 && ua.indexOf('Edg') === -1) {
      name = 'Chrome';
      version = ua.match(/Chrome\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.indexOf('Safari') > -1 && ua.indexOf('Chrome') === -1) {
      name = 'Safari';
      version = ua.match(/Version\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.indexOf('Edg') > -1) {
      name = 'Edge';
      version = ua.match(/Edg\/(\d+\.?\d*)/)?.[1] || '';
    } else if (ua.indexOf('MSIE') > -1 || ua.indexOf('Trident') > -1) {
      name = 'Internet Explorer';
      version = ua.match(/(?:MSIE |rv:)(\d+\.?\d*)/)?.[1] || '';
    }
    
    return { name, version };
  },

  // Get operating system
  getOS: (): string => {
    const ua = navigator.userAgent;
    
    if (ua.indexOf('Win') > -1) return 'Windows';
    if (ua.indexOf('Mac') > -1) return 'macOS';
    if (ua.indexOf('Linux') > -1) return 'Linux';
    if (ua.indexOf('Android') > -1) return 'Android';
    if (ua.indexOf('iOS') > -1 || ua.indexOf('iPhone') > -1) return 'iOS';
    
    return 'Unknown';
  },

  // Check if mobile device
  isMobile: (): boolean => {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  },

  // Check if tablet
  isTablet: (): boolean => {
    return /(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(navigator.userAgent);
  },

  // Check if desktop
  isDesktop: (): boolean => {
    return !browserUtils.isMobile() && !browserUtils.isTablet();
  },

  // Check if touch device
  isTouchDevice: (): boolean => {
    return 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  },

  // Get screen info
  getScreenInfo: () => ({
    width: window.screen.width,
    height: window.screen.height,
    availWidth: window.screen.availWidth,
    availHeight: window.screen.availHeight,
    colorDepth: window.screen.colorDepth,
    pixelRatio: window.devicePixelRatio || 1,
  }),

  // Get viewport size
  getViewport: () => ({
    width: window.innerWidth || document.documentElement.clientWidth,
    height: window.innerHeight || document.documentElement.clientHeight,
  }),

  // Check if online
  isOnline: (): boolean => {
    return navigator.onLine;
  },

  // Get connection info
  getConnection: () => {
    const connection = (navigator as any).connection || 
                      (navigator as any).mozConnection || 
                      (navigator as any).webkitConnection;
    
    if (connection) {
      return {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
        saveData: connection.saveData,
      };
    }
    
    return null;
  },

  // Check feature support
  supports: {
    webGL: (): boolean => {
      try {
        const canvas = document.createElement('canvas');
        return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
      } catch {
        return false;
      }
    },
    
    webP: (): Promise<boolean> => {
      return new Promise(resolve => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
      });
    },
    
    localStorage: (): boolean => {
      try {
        localStorage.setItem('test', 'test');
        localStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    },
    
    sessionStorage: (): boolean => {
      try {
        sessionStorage.setItem('test', 'test');
        sessionStorage.removeItem('test');
        return true;
      } catch {
        return false;
      }
    },
    
    cookies: (): boolean => {
      return navigator.cookieEnabled;
    },
    
    serviceWorker: (): boolean => {
      return 'serviceWorker' in navigator;
    },
    
    pushNotifications: (): boolean => {
      return 'PushManager' in window;
    },
    
    webRTC: (): boolean => {
      return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
    },
  },

  // Copy to clipboard
  copyToClipboard: async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        return true;
      } else {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        return success;
      }
    } catch {
      return false;
    }
  },

  // Share API
  share: async (data: { title?: string; text?: string; url?: string }): Promise<boolean> => {
    if (navigator.share) {
      try {
        await navigator.share(data);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  },

  // Fullscreen API
  fullscreen: {
    enter: (element: HTMLElement = document.documentElement): Promise<void> => {
      if (element.requestFullscreen) {
        return element.requestFullscreen();
      } else if ((element as any).webkitRequestFullscreen) {
        return (element as any).webkitRequestFullscreen();
      } else if ((element as any).msRequestFullscreen) {
        return (element as any).msRequestFullscreen();
      }
      return Promise.reject(new Error('Fullscreen not supported'));
    },
    
    exit: (): Promise<void> => {
      if (document.exitFullscreen) {
        return document.exitFullscreen();
      } else if ((document as any).webkitExitFullscreen) {
        return (document as any).webkitExitFullscreen();
      } else if ((document as any).msExitFullscreen) {
        return (document as any).msExitFullscreen();
      }
      return Promise.reject(new Error('Exit fullscreen not supported'));
    },
    
    isFullscreen: (): boolean => {
      return !!(document.fullscreenElement || 
               (document as any).webkitFullscreenElement || 
               (document as any).msFullscreenElement);
    },
  },

  // Get battery status
  getBatteryStatus: async () => {
    if ('getBattery' in navigator) {
      const battery = await (navigator as any).getBattery();
      return {
        level: battery.level,
        charging: battery.charging,
        chargingTime: battery.chargingTime,
        dischargingTime: battery.dischargingTime,
      };
    }
    return null;
  },
};