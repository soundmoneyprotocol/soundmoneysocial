/**
 * Platform Adapter
 * Provides platform detection and utilities for web and React Native
 * Useful for platform-specific code and feature detection
 */

type PlatformOS = 'web' | 'ios' | 'android' | 'native';

interface PlatformInfo {
  OS: PlatformOS;
  isWeb: boolean;
  isNative: boolean;
  isIOS: boolean;
  isAndroid: boolean;
  isMobile: boolean;
  isDesktop: boolean;
}

/**
 * Detect if the browser is mobile or desktop
 */
const detectIsMobile = (): boolean => {
  const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

  // Check for common mobile user agent patterns
  const mobileRegex =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|mobi|tablet|windows phone|ipad pro/i;

  return mobileRegex.test(userAgent.toLowerCase());
};

/**
 * Detect browser viewport size to determine if desktop
 */
const detectIsDesktop = (): boolean => {
  return window.innerWidth >= 1024;
};

/**
 * Get detailed platform information
 */
const getPlatformInfo = (): PlatformInfo => {
  const isMobile = detectIsMobile();
  const isDesktop = detectIsDesktop();

  return {
    OS: 'web',
    isWeb: true,
    isNative: false,
    isIOS: false,
    isAndroid: false,
    isMobile: isMobile,
    isDesktop: isDesktop,
  };
};

/**
 * Platform adapter for web environment
 */
export const platformAdapter = {
  /**
   * Current platform OS
   */
  OS: 'web' as PlatformOS,

  /**
   * Check if running on web
   */
  isWeb: true,

  /**
   * Check if running on native (React Native)
   */
  isNative: false,

  /**
   * Check if running on iOS
   */
  isIOS: false,

  /**
   * Check if running on Android
   */
  isAndroid: false,

  /**
   * Check if running on mobile device
   */
  get isMobile(): boolean {
    return detectIsMobile();
  },

  /**
   * Check if running on desktop
   */
  get isDesktop(): boolean {
    return detectIsDesktop();
  },

  /**
   * Get full platform information
   */
  getPlatformInfo(): PlatformInfo {
    return getPlatformInfo();
  },

  /**
   * Get user agent string
   */
  getUserAgent(): string {
    return navigator.userAgent;
  },

  /**
   * Get browser name
   */
  getBrowserName(): string {
    const userAgent = navigator.userAgent;

    if (userAgent.includes('Chrome')) return 'Chrome';
    if (userAgent.includes('Safari')) return 'Safari';
    if (userAgent.includes('Firefox')) return 'Firefox';
    if (userAgent.includes('Edge')) return 'Edge';
    if (userAgent.includes('Opera')) return 'Opera';

    return 'Unknown';
  },

  /**
   * Get screen dimensions
   */
  getScreenDimensions(): { width: number; height: number } {
    return {
      width: window.innerWidth,
      height: window.innerHeight,
    };
  },

  /**
   * Get screen scale/DPI ratio
   */
  getScreenScale(): number {
    return window.devicePixelRatio || 1;
  },

  /**
   * Check if the device supports touch
   */
  isTouchDevice(): boolean {
    return (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      (navigator as any).msMaxTouchPoints > 0
    );
  },

  /**
   * Get network connection type
   */
  getNetworkType(): string {
    const connection = (navigator as any).connection;

    if (!connection) return 'unknown';

    return connection.effectiveType || 'unknown';
  },

  /**
   * Check if online
   */
  isOnline(): boolean {
    return navigator.onLine;
  },

  /**
   * Listen for online/offline events
   */
  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  },
};

export default platformAdapter;
