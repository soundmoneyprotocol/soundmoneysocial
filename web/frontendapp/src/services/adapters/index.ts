/**
 * Platform Adapters for Web Environment
 * Unified interfaces for platform-specific features from React Native
 */

export { storageAdapter, default as StorageAdapter } from './storageAdapter';
export { alertAdapter, default as AlertAdapter } from './alertAdapter';
export { platformAdapter, default as PlatformAdapter } from './platformAdapter';
// Stripe adapter disabled - requires @stripe/stripe-js which is optional
// export { stripeAdapter, default as StripeAdapter } from './stripeAdapter';

// Re-export commonly used adapters as a combined object
export const adapters = {
  storage: require('./storageAdapter').storageAdapter,
  alert: require('./alertAdapter').alertAdapter,
  platform: require('./platformAdapter').platformAdapter,
  // stripe: require('./stripeAdapter').stripeAdapter,
};
