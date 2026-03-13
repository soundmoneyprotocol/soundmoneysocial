/**
 * Workbox Configuration for PWA Service Worker
 * Generates optimized caching strategies
 */

module.exports = {
  globDirectory: 'build/',
  globPatterns: [
    '**/*.{html,css,js,json,svg,png,jpg,jpeg,gif,woff,woff2,ttf,eot,otf}',
  ],
  globIgnores: [
    '../config.js',
    'manifest.json',
    'index.html',
  ],
  maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
  navigateFallback: '/index.html',
  skipWaiting: true,
  clientsClaim: true,
  cleanupOutdatedCaches: true,
  runtimeCaching: [
    {
      urlPattern: ({ url }) =>
        url.pathname.startsWith('/api/') ||
        url.origin.includes('api.soundmoneyprotocol.xyz'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'soundmoney-api-cache',
        networkTimeoutSeconds: 5,
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 24 * 60 * 60, // 24 hours
        },
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.match(/\.(png|jpg|jpeg|svg|gif)$/),
      handler: 'CacheFirst',
      options: {
        cacheName: 'soundmoney-images-cache',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
        },
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.match(/\.(woff|woff2|ttf|eot|otf)$/),
      handler: 'CacheFirst',
      options: {
        cacheName: 'soundmoney-fonts-cache',
        expiration: {
          maxEntries: 30,
          maxAgeSeconds: 365 * 24 * 60 * 60, // 1 year
        },
      },
    },
    {
      urlPattern: ({ url }) => url.pathname.includes('supabase'),
      handler: 'NetworkFirst',
      options: {
        cacheName: 'soundmoney-supabase-cache',
        networkTimeoutSeconds: 3,
      },
    },
  ],
};
