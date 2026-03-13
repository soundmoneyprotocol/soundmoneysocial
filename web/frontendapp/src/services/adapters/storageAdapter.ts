/**
 * Storage Adapter
 * Provides a unified interface for storage across web (localStorage) and React Native (AsyncStorage)
 * This adapter wraps localStorage for web compatibility
 */

interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
  clear(): Promise<void>;
  getAllKeys(): Promise<string[]>;
}

/**
 * Web storage implementation using localStorage
 * Returns promises to match AsyncStorage API
 */
const WebStorage: StorageAdapter = {
  async getItem(key: string): Promise<string | null> {
    try {
      const value = localStorage.getItem(key);
      return value;
    } catch (error) {
      console.error(`Storage.getItem error for key "${key}":`, error);
      return null;
    }
  },

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error(`Storage.setItem error for key "${key}":`, error);
      throw new Error(`Failed to store item: ${error}`);
    }
  },

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Storage.removeItem error for key "${key}":`, error);
      throw new Error(`Failed to remove item: ${error}`);
    }
  },

  async clear(): Promise<void> {
    try {
      localStorage.clear();
    } catch (error) {
      console.error('Storage.clear error:', error);
      throw new Error(`Failed to clear storage: ${error}`);
    }
  },

  async getAllKeys(): Promise<string[]> {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      return keys;
    } catch (error) {
      console.error('Storage.getAllKeys error:', error);
      return [];
    }
  },
};

/**
 * Enhanced storage with JSON support
 * Handles automatic JSON serialization/deserialization
 */
export const storageAdapter = {
  /**
   * Get a value from storage
   * @param key Storage key
   * @returns Stored value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    return WebStorage.getItem(key);
  },

  /**
   * Store a value in storage
   * @param key Storage key
   * @param value Value to store
   */
  async setItem(key: string, value: string): Promise<void> {
    return WebStorage.setItem(key, value);
  },

  /**
   * Store a JSON object in storage
   * @param key Storage key
   * @param value Object to store
   */
  async setJSONItem<T>(key: string, value: T): Promise<void> {
    try {
      const jsonString = JSON.stringify(value);
      return WebStorage.setItem(key, jsonString);
    } catch (error) {
      console.error(`Storage.setJSONItem error for key "${key}":`, error);
      throw new Error(`Failed to store JSON item: ${error}`);
    }
  },

  /**
   * Get a JSON object from storage
   * @param key Storage key
   * @returns Parsed object or null if not found
   */
  async getJSONItem<T>(key: string): Promise<T | null> {
    try {
      const value = await WebStorage.getItem(key);
      if (!value) return null;
      return JSON.parse(value) as T;
    } catch (error) {
      console.error(`Storage.getJSONItem error for key "${key}":`, error);
      return null;
    }
  },

  /**
   * Remove a value from storage
   * @param key Storage key
   */
  async removeItem(key: string): Promise<void> {
    return WebStorage.removeItem(key);
  },

  /**
   * Clear all storage
   */
  async clear(): Promise<void> {
    return WebStorage.clear();
  },

  /**
   * Get all storage keys
   * @returns Array of all storage keys
   */
  async getAllKeys(): Promise<string[]> {
    return WebStorage.getAllKeys();
  },

  /**
   * Check if a key exists in storage
   * @param key Storage key
   * @returns True if key exists
   */
  async exists(key: string): Promise<boolean> {
    const value = await WebStorage.getItem(key);
    return value !== null;
  },

  /**
   * Get the size of stored data (approximate)
   * @returns Approximate size in bytes
   */
  async getSize(): Promise<number> {
    let size = 0;
    try {
      const keys = await WebStorage.getAllKeys();
      for (const key of keys) {
        const value = await WebStorage.getItem(key);
        if (value) {
          size += key.length + value.length;
        }
      }
      return size;
    } catch (error) {
      console.error('Storage.getSize error:', error);
      return 0;
    }
  },
};

export default storageAdapter;
