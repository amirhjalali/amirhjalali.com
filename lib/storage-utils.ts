// Local storage and session storage utilities with type safety
export const storageUtils = {
  // Set item with optional expiry
  set: <T>(key: string, value: T, expiryMs?: number): boolean => {
    try {
      const item = {
        value,
        expiry: expiryMs ? Date.now() + expiryMs : null,
      };
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error('Error saving to localStorage:', error);
      return false;
    }
  },

  // Get item with expiry check
  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      const itemStr = localStorage.getItem(key);
      if (!itemStr) return defaultValue;
      
      const item = JSON.parse(itemStr);
      
      // Check if item has expired
      if (item.expiry && Date.now() > item.expiry) {
        localStorage.removeItem(key);
        return defaultValue;
      }
      
      return item.value;
    } catch (error) {
      console.error('Error reading from localStorage:', error);
      return defaultValue;
    }
  },

  // Remove item
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from localStorage:', error);
      return false;
    }
  },

  // Clear all items
  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  },

  // Check if key exists
  has: (key: string): boolean => {
    return localStorage.getItem(key) !== null;
  },

  // Get all keys
  keys: (): string[] => {
    return Object.keys(localStorage);
  },

  // Get storage size
  getSize: (): number => {
    let size = 0;
    for (const key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        size += localStorage[key].length + key.length;
      }
    }
    return size;
  },

  // Check if storage is available
  isAvailable: (): boolean => {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },
};

// Session storage utilities
export const sessionUtils = {
  set: <T>(key: string, value: T): boolean => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error('Error saving to sessionStorage:', error);
      return false;
    }
  },

  get: <T>(key: string, defaultValue?: T): T | undefined => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('Error reading from sessionStorage:', error);
      return defaultValue;
    }
  },

  remove: (key: string): boolean => {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error removing from sessionStorage:', error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      sessionStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing sessionStorage:', error);
      return false;
    }
  },
};

// Cookie utilities
export const cookieUtils = {
  set: (name: string, value: string, days?: number, path: string = '/'): void => {
    let expires = '';
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
      expires = `; expires=${date.toUTCString()}`;
    }
    document.cookie = `${name}=${value || ''}${expires}; path=${path}`;
  },

  get: (name: string): string | null => {
    const nameEQ = `${name}=`;
    const cookies = document.cookie.split(';');
    
    for (let cookie of cookies) {
      cookie = cookie.trim();
      if (cookie.indexOf(nameEQ) === 0) {
        return cookie.substring(nameEQ.length);
      }
    }
    return null;
  },

  remove: (name: string, path: string = '/'): void => {
    document.cookie = `${name}=; Max-Age=-99999999; path=${path}`;
  },

  getAll: (): Record<string, string> => {
    const cookies: Record<string, string> = {};
    document.cookie.split(';').forEach(cookie => {
      const [name, value] = cookie.trim().split('=');
      if (name) cookies[name] = value || '';
    });
    return cookies;
  },
};

// IndexedDB utilities
export const indexedDBUtils = {
  open: (dbName: string, version: number = 1): Promise<IDBDatabase> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(dbName, version);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  save: async (dbName: string, storeName: string, data: any): Promise<void> => {
    const db = await indexedDBUtils.open(dbName);
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    store.add(data);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },

  load: async (dbName: string, storeName: string, key: any): Promise<any> => {
    const db = await indexedDBUtils.open(dbName);
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.get(key);
    
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  },

  delete: async (dbName: string, storeName: string, key: any): Promise<void> => {
    const db = await indexedDBUtils.open(dbName);
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    store.delete(key);
    
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  },
};