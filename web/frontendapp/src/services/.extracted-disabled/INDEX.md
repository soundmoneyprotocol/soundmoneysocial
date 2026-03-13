# Extracted Services from soundmoneyapp

## Core Services (31 files)

### Authentication & User Management
- `authService.ts` - User authentication
- `supabaseService.ts` - Supabase backend integration
- `profileService.ts` - User profiles
- `sessionManagementService.ts` - Session management
- `privacySecurityService.ts` - Privacy & security

### Spotify Integration
- `spotifyService.ts` - Spotify API
- `spotifyStreamConversionService.ts` - Stream to BEZY conversion
- `spotifyImportService.ts` - Import Spotify tracks

### Blockchain & Solana
- `solanaService.ts` - Solana blockchain operations
- `solanaTokenService.ts` - Solana token operations
- `walletManagementService.ts` - Wallet management
- `phantomWalletService.ts` - Phantom wallet integration
- `multiChainService.ts` - Multi-chain support

### BEZY & Tokenomics
- `bzyStakingService.ts` - BEZY staking
- `artistCoinsService.ts` - Artist coin management
- `bondingCurveService.ts` - Bonding curve mechanics
- `creatorTokenService.ts` - Creator token utilities
- `tokenCuratedPlaylistService.ts` - Token-curated playlists

### Creator Features
- `creatorFundingService.ts` - Creator funding
- `earningsEnrollmentService.ts` - Earnings tracking
- `referralRewardService.ts` - Referral rewards
- `featuredArtistsService.ts` - Featured artists

### Community & Social
- `communityService.ts` - Community features
- `feedDiscoveryService.ts` - Feed discovery algorithm

### Governance
- `realmsGovernanceService.ts` - Realms DAO governance

### Payments & Subscriptions
- `stripeService.ts` - Stripe payments
- `subscriptionService.ts` - Subscription management
- `intercomService.ts` - Customer support integration

### Trading
- `coinTradingService.ts` - Trading operations
- `priceConversionService.ts` - Price conversions

### Analytics
- `activityTrackingService.ts` - Activity tracking
- `apiService.ts` - API utilities

## Extracted Hooks (10 files)
- `useApi.ts` - API data fetching
- `useAuth.ts` - Authentication hook
- `useSpotifyImport.ts` - Spotify import hook
- `useSolana.ts` - Solana operations
- `useSolanaBalance.ts` - Solana balance
- `useBezy.ts` - BEZY utilities
- `useBlockchain.ts` - Blockchain operations
- `useMultiChain.ts` - Multi-chain
- `useArtistCoins.ts` - Artist coins
- `useRealmsGovernance.ts` - Governance

## Notes
- These services are extracted as-is from soundmoneyapp
- Some services may have React Native dependencies - review before use
- Adapt as needed for web-specific requirements
- Consider creating wrapper/adapter services for web-specific behavior

## Next Steps
1. Review services for React Native dependencies
2. Create adapter layer if needed
3. Test each service with web app
4. Update imports throughout the app
