// Array and object manipulation utilities
export const arrayUtils = {
  // Chunk array into smaller arrays
  chunk: <T>(array: T[], size: number): T[][] => {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  },

  // Remove duplicates
  unique: <T>(array: T[]): T[] => {
    return Array.from(new Set(array));
  },

  // Deep unique for objects
  uniqueBy: <T>(array: T[], key: keyof T): T[] => {
    const seen = new Set();
    return array.filter(item => {
      const value = item[key];
      if (seen.has(value)) return false;
      seen.add(value);
      return true;
    });
  },

  // Shuffle array
  shuffle: <T>(array: T[]): T[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  },

  // Group by key
  groupBy: <T>(array: T[], key: keyof T | ((item: T) => string)): Record<string, T[]> => {
    return array.reduce((groups, item) => {
      const groupKey = typeof key === 'function' ? key(item) : String(item[key]);
      if (!groups[groupKey]) groups[groupKey] = [];
      groups[groupKey].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  },

  // Flatten nested arrays
  flatten: <T>(array: any[], depth: number = 1): T[] => {
    if (depth <= 0) return array;
    return array.reduce((flat, item) => 
      flat.concat(Array.isArray(item) ? arrayUtils.flatten(item, depth - 1) : item), []);
  },

  // Get difference between arrays
  difference: <T>(array1: T[], array2: T[]): T[] => {
    return array1.filter(item => !array2.includes(item));
  },

  // Get intersection of arrays
  intersection: <T>(array1: T[], array2: T[]): T[] => {
    return array1.filter(item => array2.includes(item));
  },

  // Get union of arrays
  union: <T>(...arrays: T[][]): T[] => {
    return arrayUtils.unique(arrays.flat());
  },

  // Sort by multiple fields
  sortBy: <T>(array: T[], ...keys: (keyof T | ((item: T) => any))[]): T[] => {
    return [...array].sort((a, b) => {
      for (const key of keys) {
        const aVal = typeof key === 'function' ? key(a) : a[key];
        const bVal = typeof key === 'function' ? key(b) : b[key];
        
        if (aVal < bVal) return -1;
        if (aVal > bVal) return 1;
      }
      return 0;
    });
  },

  // Partition array based on condition
  partition: <T>(array: T[], predicate: (item: T) => boolean): [T[], T[]] => {
    const pass: T[] = [];
    const fail: T[] = [];
    
    array.forEach(item => {
      (predicate(item) ? pass : fail).push(item);
    });
    
    return [pass, fail];
  },

  // Get random element
  sample: <T>(array: T[]): T | undefined => {
    return array[Math.floor(Math.random() * array.length)];
  },

  // Get multiple random elements
  sampleSize: <T>(array: T[], n: number): T[] => {
    const shuffled = arrayUtils.shuffle(array);
    return shuffled.slice(0, n);
  },

  // Move element in array
  move: <T>(array: T[], from: number, to: number): T[] => {
    const result = [...array];
    const [removed] = result.splice(from, 1);
    result.splice(to, 0, removed);
    return result;
  },
};

// Object utilities
export const objectUtils = {
  // Deep clone
  deepClone: <T>(obj: T): T => {
    if (obj === null || typeof obj !== 'object') return obj;
    if (obj instanceof Date) return new Date(obj.getTime()) as any;
    if (obj instanceof Array) return obj.map(item => objectUtils.deepClone(item)) as any;
    if (obj instanceof Object) {
      const clone: any = {};
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          clone[key] = objectUtils.deepClone(obj[key]);
        }
      }
      return clone;
    }
    return obj;
  },

  // Deep merge
  deepMerge: <T extends Record<string, any>>(...objects: Partial<T>[]): T => {
    const result: any = {};
    
    objects.forEach(obj => {
      Object.keys(obj).forEach(key => {
        const value = obj[key];
        
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          result[key] = objectUtils.deepMerge(result[key] || {}, value);
        } else {
          result[key] = value;
        }
      });
    });
    
    return result;
  },

  // Pick properties
  pick: <T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> => {
    const result: any = {};
    keys.forEach(key => {
      if (key in obj) result[key] = obj[key];
    });
    return result;
  },

  // Omit properties
  omit: <T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> => {
    const result: any = { ...obj };
    keys.forEach(key => delete result[key]);
    return result;
  },

  // Check if object is empty
  isEmpty: (obj: any): boolean => {
    if (!obj) return true;
    return Object.keys(obj).length === 0;
  },

  // Get nested property safely
  get: (obj: any, path: string, defaultValue?: any): any => {
    const keys = path.split('.');
    let result = obj;
    
    for (const key of keys) {
      result = result?.[key];
      if (result === undefined) return defaultValue;
    }
    
    return result;
  },

  // Set nested property
  set: (obj: any, path: string, value: any): void => {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let current = obj;
    
    for (const key of keys) {
      if (!current[key] || typeof current[key] !== 'object') {
        current[key] = {};
      }
      current = current[key];
    }
    
    current[lastKey] = value;
  },

  // Compare objects for equality
  isEqual: (obj1: any, obj2: any): boolean => {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    if (typeof obj1 !== typeof obj2) return false;
    
    if (typeof obj1 !== 'object') return obj1 === obj2;
    
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    
    if (keys1.length !== keys2.length) return false;
    
    return keys1.every(key => objectUtils.isEqual(obj1[key], obj2[key]));
  },

  // Map object values
  mapValues: <T, R>(obj: Record<string, T>, fn: (value: T, key: string) => R): Record<string, R> => {
    const result: Record<string, R> = {};
    Object.keys(obj).forEach(key => {
      result[key] = fn(obj[key], key);
    });
    return result;
  },

  // Filter object
  filter: <T>(obj: Record<string, T>, predicate: (value: T, key: string) => boolean): Record<string, T> => {
    const result: Record<string, T> = {};
    Object.keys(obj).forEach(key => {
      if (predicate(obj[key], key)) {
        result[key] = obj[key];
      }
    });
    return result;
  },
};