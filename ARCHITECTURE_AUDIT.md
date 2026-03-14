# SoundMoney Architecture Audit
**Date**: 2026-03-13
**Status**: Complete Analysis
**Scope**: soundmoneymusic-main ↔ soundmoneysocial Integration

---

## Executive Summary

Both applications can benefit significantly from shared infrastructure and reusable components. The primary opportunity is consolidating backend authentication, database, and payment infrastructure under a unified Supabase + Stripe setup, while selectively sharing UI components.

**Architecture**:
- **soundmoneymusic-main**: Next.js 14 (SSR/Server Actions)
- **soundmoneysocial**: React 18 (Client-side, React Router)

---

## 1. SHARED COMPONENTS AUDIT

### 1.1 UI Component Library (Reusable Across Apps)

#### ✅ HIGH PRIORITY - Immediately Shareable
These components have no framework-specific features and can be easily copied/shared:

```
soundmoneymusic-main/src/components/ui/
├── button.tsx              ← Enhanced with hover/glow effects (SHARE)
├── card.tsx                ← Basic card styling (SHARE)
├── input.tsx               ← Form input styling (SHARE)
├── label.tsx               ← Form labels (SHARE)
├── badge.tsx               ← Badge styling (SHARE)
├── accordion.tsx           ← Accordion component (SHARE)
├── tabs.tsx                ← Tab navigation (SHARE)
├── dropdown-menu.tsx       ← Menu dropdown (SHARE)
├── dialog.tsx              ← Modal dialog (SHARE)
├── progress.tsx            ← Progress bars (SHARE)
├── checkbox.tsx            ← Checkboxes (SHARE)
├── separator.tsx           ← Dividers (SHARE)
└── select.tsx              ← Select dropdowns (SHARE)
```

**Current Status**: soundmoneysocial uses inline component styling; these should be extracted to a shared UI library.

**Action**: Copy `src/components/ui/` folder to shared location or npm package.

---

#### ⚠️ MEDIUM PRIORITY - Framework-Agnostic with Adaptation
These components need minor modifications for React Router:

```
soundmoneymusic-main/src/components/
├── DarkModeToggle.tsx      ← Framework-agnostic (SHARE with minor tweaks)
├── AudioPlayer.tsx         ← Shareable audio component (SHARE)
├── Charts.tsx              ← Using Recharts (can share logic)
├── ProfileImage.tsx        ← Needs next/image → img conversion (ADAPT)
├── ProfileBanner.tsx       ← Needs next/image → img conversion (ADAPT)
└── Navbar.tsx              ← Next.js Link → React Router Link (ADAPT)
```

**Conversion Needed**:
- `next/link` → `react-router-dom` Link
- `next/image` → standard `<img>` tags with CSS
- `next/font` → CSS fonts (already done in global.css)

---

### 1.2 Form/Modal Components (Needs Refactoring)

#### Currently NOT Shareable (Framework-Specific)
```
soundmoneysocial/src/components/
├── MonetizationModal.tsx   ← Custom React component
├── SubscriptionModal.tsx   ← Custom React component
├── ChatModal.tsx           ← Custom React component
└── CommunityManagerModal.tsx ← Custom React component

soundmoneymusic-main/src/components/surfaces/modal/
├── LoginModal.tsx          ← Next.js specific
├── Modal.tsx               ← Base modal component (SHAREABLE)
```

**Recommendation**: Extract generic modal logic to shared `BaseModal.tsx` that both apps can use.

---

### 1.3 Page Layout Components (Framework-Specific)

```
NOT SHAREABLE - Different routing architecture:
- soundmoneymusic-main uses Next.js App Router (/src/app/)
- soundmoneysocial uses React Router (/src/pages/)
```

These require completely different implementations:
- Next.js: Layout components, Server Components, Middleware
- React: Context-based routing, client-side navigation

---

## 2. SHARED SERVICES AUDIT

### 2.1 Authentication Service

#### Current State:
**soundmoneymusic-main**:
- Server-side Supabase Auth (via Server Actions)
- `src/lib/actions/signup.ts` - Server action
- `src/lib/actions/login.ts` - Server action
- Referral system integrated
- Email confirmation required

**soundmoneysocial**:
- Client-side Supabase Auth (Context API)
- `src/contexts/AuthContext.tsx` - Custom auth context
- localStorage fallback for offline mode
- No referral system
- Uses Privy-io for additional auth (not integrated with Supabase)

#### Analysis:
**PARTIAL SHAREABLE** - Needs unification:
- Both use Supabase but different implementations
- soundmoneysocial should migrate to Server Actions (better security)
- Consolidate referral logic
- Remove Privy-io if not needed

#### Recommendation:
Create unified `AuthService`:
```typescript
// shared/services/authService.ts
export const authService = {
  signUp: (email, password, referralCode?) => Promise
  login: (email, password) => Promise
  logout: () => Promise
  resetPassword: (email) => Promise
  verifyEmail: (token) => Promise
}
```

---

### 2.2 Payment Service (Stripe)

#### Current State:
**soundmoneymusic-main**:
- Stripe webhook handler: `src/app/api/stripe/webhook/route.ts`
- Invoice payment tracking
- Subscription management
- Stripe secret key integration
- Custom payment logic in webhook

**soundmoneysocial**:
- No Stripe integration yet
- Need to add subscription/payment features

#### Analysis:
**NOT YET SHAREABLE** - Only soundmoneymusic-main has it

#### Recommendation:
Extract Stripe webhook logic to shared service:
```typescript
// shared/services/stripeService.ts
export const stripeService = {
  handlePaymentSuccess: (event) => Promise
  handleSubscriptionUpdate: (event) => Promise
  createCheckoutSession: (userId, priceId) => Promise
  getCustomerPaymentMethods: (customerId) => Promise
}
```

---

### 2.3 File Upload Service

#### Current State:
**soundmoneymusic-main**:
- `src/app/api/upload-music/route.ts` - Music file upload
- `src/app/api/upload-profile-image/route.ts` - Profile image upload
- `src/app/api/upload-banner-image/route.ts` - Banner image upload

**soundmoneysocial**:
- `src/services/fileStorageService.ts` - LocalStorage-based file storage
- `src/services/youtubeMusic.ts` - File handling for tracks

#### Analysis:
**PARTIALLY SHAREABLE** - Different backends

soundmoneysocial is using LocalStorage (development mode), but should use server endpoints like soundmoneymusic-main.

#### Recommendation:
Create unified upload service that calls shared endpoints:
```typescript
// shared/services/uploadService.ts
export const uploadService = {
  uploadProfileImage: (file) => Promise
  uploadBannerImage: (file) => Promise
  uploadMusicFile: (file, metadata) => Promise
}
```

---

### 2.4 Database/Content Services

#### Current State:
**soundmoneymusic-main**:
- Supabase queries in Server Actions
- Direct database access via `supabaseAdmin`
- Metadata management in Supabase
- User profile data in Supabase

**soundmoneysocial**:
- LocalStorage for track management
- In-memory data for streaming history
- No server-side persistence
- Mock data for users

#### Analysis:
**NOT SHAREABLE YET** - soundmoneysocial needs to connect to real database

#### Recommendation:
Migrate soundmoneysocial to use Supabase for:
- User profiles
- Track metadata (ISRC, publishing member #, etc.)
- Streaming history
- Chat/messaging data

---

### 2.5 Media/Streaming Services

#### Current State:
**soundmoneymusic-main**:
- `AudioPlayer.tsx` - React component for audio playback
- Livepeer integration for video streaming
- YouTube Music integration (implied)

**soundmoneysocial**:
- `AudioPlayer.tsx` - Similar component
- `youtubeMusicService.ts` - YouTube Music catalog management
- `streamingHistoryService.ts` - Streaming tracking

#### Analysis:
**SHAREABLE** - Similar functionality, can consolidate

#### Recommendation:
Create unified media service:
```typescript
// shared/services/mediaService.ts
export const mediaService = {
  getAudioStream: (trackId) => Promise
  getVideoStream: (videoId) => Promise
  trackStreamSession: (trackId, userId, duration) => Promise
  getCatalog: (userId?) => Promise
}
```

---

## 3. SHARED UTILITIES AUDIT

### 3.1 Utility Functions

#### Shareable Utilities:

| Utility | Location | Status | Action |
|---------|----------|--------|--------|
| `formatBZY()` | soundmoneysocial | SHARE | Move to shared/utils |
| `siteUrl()` | soundmoneymusic-main/utils | SHARE | Move to shared/utils |
| `useStore()` | soundmoneymusic-main/lib/hooks | SHARE | Move to shared/hooks |
| `use-mobile()` | soundmoneymusic-main/hooks | SHARE | Move to shared/hooks |

#### Framework-Specific (NOT Shareable):
- Next.js middleware utilities
- Server-side only functions
- React Router hooks

---

### 3.2 Type Definitions

#### Shared Types Needed:

```typescript
// shared/types/index.ts
export interface User {
  id: string
  email: string
  username: string
  avatar?: string
  role: 'artist' | 'listener' | 'admin'
  profile: UserProfile
}

export interface UserProfile {
  bio?: string
  imageUrl?: string
  bannerUrl?: string
  socialLinks?: Record<string, string>
}

export interface Track {
  id: string
  title: string
  artist: string
  genre: string
  duration: number
  metadata: TrackMetadata
  spotifyUrl?: string
  youtubeUrl?: string
  bandcampUrl?: string
  tiktokUrl?: string
  instagramReelUrl?: string
  imageUrl?: string
}

export interface TrackMetadata {
  description?: string
  releaseDate?: string
  version?: string
  remixInfo?: string
  producer?: string
  songwriter?: string
  credits?: string
  tags?: string[]
  isrcCode?: string
  publishingMemberId?: string
}

export interface StreamSession {
  id: string
  trackId: string
  userId: string
  duration: number // seconds
  timestamp: string
  bzyEarned: number
}
```

---

## 4. BACKEND INFRASTRUCTURE AUDIT

### 4.1 Authentication Infrastructure

#### Current Setup:

**soundmoneymusic-main**:
```
Supabase Project (URL + Anon Key)
├── Auth: Email/Password + Email confirmation
├── Session: Cookie-based (via @supabase/ssr)
├── Referral System: Custom referrals table
└── Admin Access: Service role key for sensitive operations
```

**soundmoneysocial**:
```
Supabase Project (SAME URL + Anon Key)
├── Auth: Email/Password + localStorage fallback
├── Session: Client-side (supabase.auth.getSession())
├── No Referral System
└── Privy-io (separate auth provider - NOT RECOMMENDED)
```

#### Analysis:
**Status**: ⚠️ Partial - Same Supabase instance but different implementations

#### Issues:
1. soundmoneysocial's localStorage fallback bypasses auth (security risk)
2. Privy-io adds unnecessary complexity
3. Different auth patterns between apps
4. No unified user session management

#### Recommendation:
**CREATE UNIFIED AUTH ARCHITECTURE**:

```
Unified Supabase Setup:
├── URL: https://sbylptcrxtowismxrkyj.supabase.co
├── Anon Key: (already shared)
├── Service Role Key: (for Admin operations)
├── Tables:
│   ├── users (profiles)
│   ├── referrals (shared across apps)
│   ├── subscriptions (Stripe integration)
│   ├── profiles (extended user data)
│   └── auth_logs (audit trail)
└── Auth:
    ├── Email/Password only (remove Privy-io)
    ├── Server-side session validation (soundmoneymusic-main)
    ├── Client-side session with secure refresh (soundmoneysocial)
    └── Unified logout across apps
```

**Implementation**:
- Remove Privy-io from soundmoneysocial
- Migrate to unified auth service (Server Actions for soundmoneymusic-main, fetch API for soundmoneysocial)
- Implement secure JWT refresh tokens
- Add CSRF protection for both apps

---

### 4.2 Stripe Payment Infrastructure

#### Current Setup:

**soundmoneymusic-main**:
```
Stripe Account
├── Webhook: /api/stripe/webhook
├── Secret Key: NEXT_PUBLIC_STRIPE_SECRET_KEY (⚠️ Should be private!)
├── Webhook Secret: STRIPE_WEBHOOK_SIGNING_SECRET
├── Products: Subscriptions (monthly/yearly)
└── Events: invoice.payment_succeeded
```

**soundmoneysocial**:
```
No Stripe integration yet
```

#### Analysis:
**Status**: ⚠️ Partially implemented - soundmoneymusic-main has it, soundmoneysocial doesn't

#### Issues:
1. Stripe secret key exposed as NEXT_PUBLIC_ (SECURITY RISK!)
2. Webhook only in soundmoneymusic-main
3. No payment features in soundmoneysocial yet
4. No shared payment service

#### Recommendation:
**CREATE UNIFIED PAYMENT INFRASTRUCTURE**:

```
Shared Stripe Setup:
├── Account: Single Stripe account for both apps
├── Environment Variables:
│   ├── STRIPE_SECRET_KEY (private, server-side only)
│   ├── STRIPE_PUBLISHABLE_KEY (public)
│   ├── STRIPE_WEBHOOK_SECRET (server-side only)
│   └── STRIPE_PRICE_ID_MONTHLY (for subscriptions)
├── Webhook Endpoints:
│   ├── /api/stripe/webhook (soundmoneymusic-main)
│   └── /soundmoneysocial/api/stripe/webhook (new for soundmoneysocial)
├── Products:
│   ├── Pro Subscription ($9.99/month)
│   ├── Premium Subscription ($19.99/month)
│   └── Artist Plus ($4.99/month for artists)
└── Database Integration:
    ├── stripe_customers table
    ├── stripe_subscriptions table
    └── stripe_payment_events table (audit log)
```

**Implementation Steps**:
1. Move Stripe secret to private environment variable (not NEXT_PUBLIC_)
2. Create shared Stripe webhook handler
3. Add Stripe integration endpoints to soundmoneysocial
4. Implement unified billing service
5. Add subscription UI to soundmoneysocial

---

### 4.3 Supabase Database Infrastructure

#### Current Tables:

**soundmoneymusic-main**:
- `users` (auth.users)
- `profiles` (user extended data)
- `referrals` (referral codes)
- `used_referrals` (referral tracking)
- `subscriptions` (Stripe subscriptions)
- `tracks` (inferred from metadata endpoints)

**soundmoneysocial**:
- Relies on localStorage (NOT recommended for production)
- Supabase instance available but not fully utilized

#### Recommendation:
**CREATE UNIFIED DATABASE SCHEMA**:

```sql
-- Shared Tables (both apps access)

-- Extended User Profiles
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  bio TEXT,
  avatar_url TEXT,
  banner_url TEXT,
  social_links JSONB, -- {twitter, instagram, youtube, spotify, bandcamp}
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Artist Metadata
CREATE TABLE artist_metadata (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  isrc_code TEXT,
  publishing_member_id TEXT, -- BMI/ASCAP
  producer_credits TEXT,
  songwriter_credits TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tracks/Music Catalog
CREATE TABLE tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  genre TEXT,
  description TEXT,
  duration_seconds INT,
  metadata JSONB, -- {version, remixInfo, producer, songwriter, credits, tags, isrcCode, publishingMemberId}
  audio_url TEXT,
  cover_url TEXT,
  spotify_url TEXT,
  youtube_url TEXT,
  bandcamp_url TEXT,
  tiktok_url TEXT,
  instagram_url TEXT,
  enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Streaming History
CREATE TABLE streaming_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID REFERENCES tracks(id) NOT NULL,
  user_id UUID REFERENCES auth.users(id),
  duration_seconds INT NOT NULL,
  timestamp TIMESTAMPTZ DEFAULT NOW(),
  bzy_earned NUMERIC(10, 6),
  platform TEXT, -- 'soundmoneymusic' | 'soundmoneysocial'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Referrals (Shared)
CREATE TABLE referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_user_id UUID REFERENCES auth.users(id) NOT NULL,
  referral_code TEXT UNIQUE NOT NULL,
  used_count INT DEFAULT 0,
  max_uses INT DEFAULT 3,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Stripe Subscriptions (Unified)
CREATE TABLE stripe_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT NOT NULL,
  product_id TEXT,
  price_id TEXT,
  status TEXT, -- active, past_due, unpaid, canceled, etc.
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unified Auth/Session Logs
CREATE TABLE auth_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  action TEXT, -- login, logout, signup, password_reset
  app TEXT, -- soundmoneymusic, soundmoneysocial
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. API ROUTES CONSOLIDATION

### 5.1 Shared API Routes Needed

#### Currently in soundmoneymusic-main:

| Route | Purpose | Needed in soundmoneysocial | Share? |
|-------|---------|----------------------------|--------|
| `/api/upload-music` | Upload track files | ✅ Yes | Shared endpoint |
| `/api/upload-profile-image` | Upload profile pic | ✅ Yes | Shared endpoint |
| `/api/upload-banner-image` | Upload banner | ✅ Yes | Shared endpoint |
| `/api/stripe/webhook` | Stripe webhook | ✅ Yes | Share handler |
| `/api/artists/[handle]/stats` | Artist stats | ✅ Yes | Already built |

#### New Routes Needed:

```
/api/auth/
├── /refresh - Refresh JWT token
├── /verify-email - Verify email token
└── /logout - Server-side logout

/api/tracks/
├── POST /create - Create new track
├── GET /[id] - Get track details
├── PUT /[id] - Update track metadata (ISRC, publishing #)
├── DELETE /[id] - Delete track
├── GET /search - Search tracks by title/artist
└── GET /stats - Get track streaming stats

/api/users/
├── GET /[id]/profile - Get user profile
├── PUT /[id]/profile - Update profile
├── GET /[id]/stats - Get user stats
├── GET /[id]/referrals - Get referral data
└── GET /[id]/subscriptions - Get subscription status

/api/payments/
├── POST /create-checkout-session - Create Stripe session
├── GET /subscription - Get current subscription
└── POST /cancel-subscription - Cancel subscription

/api/streaming/
├── POST /track-session - Log streaming session
├── GET /history - Get user streaming history
└── GET /stats - Aggregate streaming stats
```

---

## 6. ENVIRONMENT VARIABLES UNIFICATION

### Current State:

**soundmoneymusic-main** (.env.local):
```
NEXT_PUBLIC_SUPABASE_URL=https://sbylptcrxtowismxrkyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_STRIPE_SECRET_KEY=sk_... (⚠️ SECURITY RISK!)
STRIPE_WEBHOOK_SIGNING_SECRET=whsec_...
```

**soundmoneysocial** (.env.local):
```
REACT_APP_SUPABASE_URL=https://sbylptcrxtowismxrkyj.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJ...
```

### Recommendation:

**Unified .env.local (shared across both apps)**:
```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://sbylptcrxtowismxrkyj.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ... (server-side only)

# Stripe (⚠️ PRIVATE - never expose NEXT_PUBLIC_)
STRIPE_PUBLISHABLE_KEY=pk_...
STRIPE_SECRET_KEY=sk_... (private server-side only!)
STRIPE_WEBHOOK_SECRET=whsec_...

# App URLs
NEXT_PUBLIC_SOUNDMONEYMUSIC_URL=http://localhost:3000
NEXT_PUBLIC_SOUNDMONEYSOCIAL_URL=http://localhost:3001
```

---

## 7. RECOMMENDED SHARED ARCHITECTURE

```
monorepo/
├── packages/
│   ├── shared-ui/                    ← Shared UI components
│   │   ├── components/
│   │   │   ├── ui/                   ← From soundmoneymusic-main
│   │   │   ├── forms/
│   │   │   ├── modals/
│   │   │   └── layouts/
│   │   └── package.json
│   │
│   ├── shared-services/              ← Shared business logic
│   │   ├── auth/
│   │   ├── payments/
│   │   ├── uploads/
│   │   ├── media/
│   │   └── package.json
│   │
│   ├── shared-types/                 ← Shared TypeScript types
│   │   ├── user.ts
│   │   ├── track.ts
│   │   ├── streaming.ts
│   │   └── payment.ts
│   │
│   └── shared-utils/                 ← Utility functions
│       ├── format.ts
│       ├── validation.ts
│       └── helpers.ts
│
├── apps/
│   ├── soundmoneymusic-main/         ← Next.js SSR app
│   │   ├── src/
│   │   ├── .env.local
│   │   └── package.json
│   │
│   └── soundmoneysocial/             ← React SPA app
│       ├── src/
│       ├── .env.local
│       └── package.json
│
└── services/
    ├── shared-api/                   ← Shared API endpoints
    │   ├── auth/
    │   ├── tracks/
    │   ├── users/
    │   ├── payments/
    │   └── streaming/
    └── infrastructure/               ← Supabase + Stripe config
        ├── database/
        ├── migrations/
        └── webhooks/
```

---

## 8. IMPLEMENTATION ROADMAP

### Phase 1: Foundation (Week 1-2)
- [ ] Unify environment variables
- [ ] Fix Stripe security issue (move secret key to private)
- [ ] Create shared types package
- [ ] Extract UI components to shared-ui package
- [ ] Remove Privy-io from soundmoneysocial

### Phase 2: Authentication (Week 2-3)
- [ ] Create unified auth service
- [ ] Implement server-side session management
- [ ] Migrate soundmoneysocial to server-side auth
- [ ] Add secure token refresh mechanism
- [ ] Implement CSRF protection

### Phase 3: Database Migration (Week 3-4)
- [ ] Create unified database schema
- [ ] Migrate soundmoneysocial data from localStorage to Supabase
- [ ] Implement referral system in soundmoneysocial
- [ ] Add streaming history tracking to both apps

### Phase 4: Payment Integration (Week 4-5)
- [ ] Create unified Stripe service
- [ ] Add payment endpoints to soundmoneysocial
- [ ] Implement subscription UI in soundmoneysocial
- [ ] Create billing dashboard
- [ ] Test webhook handling

### Phase 5: API Consolidation (Week 5-6)
- [ ] Create shared API routes
- [ ] Migrate upload handlers to shared endpoints
- [ ] Implement artist stats API
- [ ] Add streaming session tracking
- [ ] Create user stats endpoints

### Phase 6: Testing & Documentation (Week 6-7)
- [ ] Integration testing
- [ ] End-to-end testing
- [ ] Documentation
- [ ] Security audit
- [ ] Performance testing

---

## 9. SECURITY CONSIDERATIONS

### Current Issues:

1. ⚠️ **CRITICAL**: Stripe secret key exposed as `NEXT_PUBLIC_STRIPE_SECRET_KEY`
   - **Fix**: Move to `STRIPE_SECRET_KEY` (private server-side only)
   - **Severity**: High - exposes payment processing

2. ⚠️ **HIGH**: soundmoneysocial localStorage auth bypass
   - **Fix**: Remove fallback, require proper session
   - **Severity**: High - bypasses authentication

3. ⚠️ **MEDIUM**: No CSRF protection between apps
   - **Fix**: Implement CSRF tokens for state-changing operations
   - **Severity**: Medium

4. ⚠️ **MEDIUM**: Privy-io adds unnecessary attack surface
   - **Fix**: Remove if not essential
   - **Severity**: Medium

### Recommendations:

1. **HTTPS Only**: All inter-app communication should use HTTPS
2. **CORS**: Properly configure CORS between localhost:3000 and localhost:3001
3. **Headers**: Add security headers (CSP, X-Frame-Options, etc.)
4. **Rate Limiting**: Implement on API endpoints
5. **Audit Logging**: Log all auth and payment events
6. **Secrets Management**: Use environment variable vaults (not .env files in git)

---

## 10. PERFORMANCE OPTIMIZATION

### Opportunities:

1. **Shared Component Caching**
   - Cache compiled UI components
   - Implement tree-shaking to reduce bundle size

2. **API Response Caching**
   - Cache user profiles and track data
   - Implement stale-while-revalidate strategy

3. **Database Optimization**
   - Add indexes on frequently queried columns (user_id, track_id, timestamp)
   - Implement pagination for large result sets

4. **Image Optimization**
   - Use next/image for soundmoneymusic-main
   - Implement lazy loading for soundmoneysocial
   - Use WebP format with fallbacks

5. **Code Splitting**
   - Extract shared code to separate chunks
   - Use dynamic imports for optional features

---

## 11. SUMMARY TABLE

| Item | Current | Shared? | Priority | Effort |
|------|---------|---------|----------|--------|
| UI Components | soundmoneymusic-main | ✅ Yes | HIGH | 2 days |
| Type Definitions | Duplicated | ✅ Yes | HIGH | 1 day |
| Auth Service | Divergent | 🔄 Partial | HIGH | 5 days |
| Stripe Setup | soundmoneymusic-main only | 🔄 Partial | HIGH | 3 days |
| Database | Inconsistent | 🔄 Partial | HIGH | 4 days |
| Utilities | Duplicated | ✅ Yes | MEDIUM | 1 day |
| API Routes | Inconsistent | 🔄 Partial | MEDIUM | 4 days |
| Environment Vars | Inconsistent | 🔄 Partial | HIGH | 0.5 days |

---

## 12. NEXT STEPS

1. **Immediate** (This week):
   - Fix Stripe security issue
   - Create shared-types package
   - Extract UI components
   - Remove Privy-io

2. **Short-term** (Weeks 2-3):
   - Implement unified auth
   - Migrate soundmoneysocial to Supabase
   - Add referral system

3. **Medium-term** (Weeks 4-6):
   - Payment integration
   - API consolidation
   - Comprehensive testing

4. **Long-term** (After MVP):
   - Monorepo setup with Turborepo
   - Shared NPM package (if public)
   - Mobile app with shared code
   - Advanced features (analytics, recommendations, etc.)

---

**Report Generated**: 2026-03-13
**Auditor**: Claude Code
**Status**: Ready for Implementation
