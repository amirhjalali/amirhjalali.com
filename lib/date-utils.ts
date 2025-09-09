// Date and time formatting utilities
export const dateUtils = {
  // Format date to various formats
  format: (date: Date | string, format: string = 'YYYY-MM-DD'): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    
    return format
      .replace('YYYY', String(year))
      .replace('YY', String(year).slice(-2))
      .replace('MM', month)
      .replace('DD', day)
      .replace('HH', hours)
      .replace('mm', minutes)
      .replace('ss', seconds);
  },

  // Get relative time (e.g., "2 hours ago", "in 3 days")
  getRelativeTime: (date: Date | string): string => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - d.getTime()) / 1000);
    
    if (diffInSeconds < 0) {
      const future = Math.abs(diffInSeconds);
      if (future < 60) return 'in a few seconds';
      if (future < 3600) return `in ${Math.floor(future / 60)} minutes`;
      if (future < 86400) return `in ${Math.floor(future / 3600)} hours`;
      if (future < 604800) return `in ${Math.floor(future / 86400)} days`;
      if (future < 2592000) return `in ${Math.floor(future / 604800)} weeks`;
      if (future < 31536000) return `in ${Math.floor(future / 2592000)} months`;
      return `in ${Math.floor(future / 31536000)} years`;
    }
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)} months ago`;
    return `${Math.floor(diffInSeconds / 31536000)} years ago`;
  },

  // Add time to date
  add: (date: Date | string, amount: number, unit: 'seconds' | 'minutes' | 'hours' | 'days' | 'weeks' | 'months' | 'years'): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    
    switch (unit) {
      case 'seconds':
        d.setSeconds(d.getSeconds() + amount);
        break;
      case 'minutes':
        d.setMinutes(d.getMinutes() + amount);
        break;
      case 'hours':
        d.setHours(d.getHours() + amount);
        break;
      case 'days':
        d.setDate(d.getDate() + amount);
        break;
      case 'weeks':
        d.setDate(d.getDate() + (amount * 7));
        break;
      case 'months':
        d.setMonth(d.getMonth() + amount);
        break;
      case 'years':
        d.setFullYear(d.getFullYear() + amount);
        break;
    }
    
    return d;
  },

  // Get date range
  getDateRange: (startDate: Date | string, endDate: Date | string): Date[] => {
    const start = typeof startDate === 'string' ? new Date(startDate) : new Date(startDate);
    const end = typeof endDate === 'string' ? new Date(endDate) : new Date(endDate);
    const dates: Date[] = [];
    
    const current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    
    return dates;
  },

  // Check if date is weekend
  isWeekend: (date: Date | string): boolean => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const day = d.getDay();
    return day === 0 || day === 6;
  },

  // Get start of period
  startOf: (date: Date | string, unit: 'day' | 'week' | 'month' | 'year'): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    
    switch (unit) {
      case 'day':
        d.setHours(0, 0, 0, 0);
        break;
      case 'week':
        const day = d.getDay();
        d.setDate(d.getDate() - day);
        d.setHours(0, 0, 0, 0);
        break;
      case 'month':
        d.setDate(1);
        d.setHours(0, 0, 0, 0);
        break;
      case 'year':
        d.setMonth(0, 1);
        d.setHours(0, 0, 0, 0);
        break;
    }
    
    return d;
  },

  // Get end of period
  endOf: (date: Date | string, unit: 'day' | 'week' | 'month' | 'year'): Date => {
    const d = typeof date === 'string' ? new Date(date) : new Date(date);
    
    switch (unit) {
      case 'day':
        d.setHours(23, 59, 59, 999);
        break;
      case 'week':
        const day = d.getDay();
        d.setDate(d.getDate() + (6 - day));
        d.setHours(23, 59, 59, 999);
        break;
      case 'month':
        d.setMonth(d.getMonth() + 1, 0);
        d.setHours(23, 59, 59, 999);
        break;
      case 'year':
        d.setMonth(11, 31);
        d.setHours(23, 59, 59, 999);
        break;
    }
    
    return d;
  },

  // Get days in month
  getDaysInMonth: (date: Date | string): number => {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  },

  // Parse duration string (e.g., "2h 30m" -> 9000000 ms)
  parseDuration: (duration: string): number => {
    const regex = /(\d+)\s*(s|sec|seconds?|m|min|minutes?|h|hr|hours?|d|days?|w|weeks?)/gi;
    let totalMs = 0;
    let match;
    
    while ((match = regex.exec(duration)) !== null) {
      const value = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit.startsWith('s')) totalMs += value * 1000;
      else if (unit.startsWith('m')) totalMs += value * 60 * 1000;
      else if (unit.startsWith('h')) totalMs += value * 60 * 60 * 1000;
      else if (unit.startsWith('d')) totalMs += value * 24 * 60 * 60 * 1000;
      else if (unit.startsWith('w')) totalMs += value * 7 * 24 * 60 * 60 * 1000;
    }
    
    return totalMs;
  },
};