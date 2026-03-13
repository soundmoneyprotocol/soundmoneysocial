import AsyncStorage from '@react-native-async-storage/async-storage';

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  TEAM = 'team'
}

export enum TeamRole {
  OWNER = 'owner',
  MANAGER = 'manager',
  ANALYST = 'analyst'
}

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  price: number;
  currency: string;
  bezyMultiplier: number;
  features: string[];
  highlights: string[];
  popular?: boolean;
  teamFeatures?: string[];
}

export interface TeamMember {
  id: string;
  email: string;
  role: TeamRole;
  permissions: string[];
  invitedAt: Date;
  acceptedAt?: Date;
  bezyRewardShare: number; // Percentage of team earnings
}

export interface ReferralCode {
  code: string;
  createdBy: string;
  uses: number;
  maxUses: number;
  rewardAmount: number; // BEZY rewards for both referrer and referee
  expiresAt: Date;
  isActive: boolean;
}

export interface SubscriptionMetrics {
  totalEarnings: number;
  monthlyRevenue: number;
  fanSubscriptions: number; // Fans paying for this artist
  communityPoolShare: number; // BEZY earned from community
  referralEarnings: number;
  teamEarnings: number;
  revenueBreakdown: {
    streams: number;
    subscriptions: number;
    social: number;
    referrals: number;
    community: number;
  };
}

export interface UserSubscription {
  tier: SubscriptionTier;
  startDate: Date;
  endDate?: Date;
  autoRenew: boolean;
  paymentMethod: 'stripe' | 'bezy';
  teamMembers: TeamMember[];
  referralCode?: string;
  metrics: SubscriptionMetrics;
  fanSubscribers: string[]; // User IDs of fans who subscribe to this artist
  communityRevenueShare: boolean; // Whether to share revenue with community
}

class SubscriptionService {
  private static instance: SubscriptionService;
  private currentSubscription: UserSubscription | null = null;

  static getInstance(): SubscriptionService {
    if (!SubscriptionService.instance) {
      SubscriptionService.instance = new SubscriptionService();
    }
    return SubscriptionService.instance;
  }

  // Subscription Plans
  getSubscriptionPlans(): SubscriptionPlan[] {
    return [
      {
        id: SubscriptionTier.FREE,
        name: 'Creator',
        price: 0,
        currency: 'USD',
        bezyMultiplier: 1.0,
        features: [
          'Full access to all basic features',
          'Standard BEZY earning rates',
          'Basic community features',
          'Standard analytics dashboard',
          'Social media sharing',
          'Basic music discovery'
        ],
        highlights: [
          'Perfect for getting started',
          'No monthly fees',
          'Full creative control'
        ]
      },
      {
        id: SubscriptionTier.PRO,
        name: 'Pro Artist',
        price: 9.99,
        currency: 'USD',
        bezyMultiplier: 2.0,
        popular: true,
        features: [
          '2x BEZY earning multiplier',
          'Advanced analytics & insights',
          'Priority discovery algorithm placement',
          'Enhanced monetization tools',
          'Community revenue sharing features',
          'Advanced social graph controls',
          'Premium fan engagement tools',
          'Custom referral codes',
          'Priority customer support',
          'Early access to new features'
        ],
        highlights: [
          'Double your BEZY earnings',
          'Priority in discovery',
          'Advanced analytics',
          'Revenue sharing with fans'
        ]
      },
      {
        id: SubscriptionTier.TEAM,
        name: 'Team/Label',
        price: 29.99,
        currency: 'USD',
        bezyMultiplier: 3.0,
        features: [
          '3x BEZY earning multiplier',
          'All Pro Artist features',
          'Team collaboration tools',
          'Role-based access controls',
          'Advanced revenue distribution',
          'White-label features',
          'Custom branding options',
          'Bulk referral code generation',
          'Team analytics dashboard',
          'Dedicated account manager'
        ],
        highlights: [
          'Triple BEZY earnings',
          'Team management',
          'Advanced revenue tools',
          'White-label features'
        ],
        teamFeatures: [
          'Add up to 10 team members',
          'Role-based permissions (Manager, Analyst)',
          'Team revenue sharing controls',
          'Collaborative content management',
          'Advanced team analytics',
          'Bulk operations'
        ]
      }
    ];
  }

  // Current Subscription Management
  async getCurrentSubscription(): Promise<UserSubscription | null> {
    if (this.currentSubscription) {
      return this.currentSubscription;
    }

    try {
      const stored = await AsyncStorage.getItem('user_subscription');
      if (stored) {
        this.currentSubscription = JSON.parse(stored);
        return this.currentSubscription;
      }
    } catch (error) {
      console.error('Error loading subscription:', error);
    }

    // Return default free tier
    return this.createDefaultSubscription();
  }

  private createDefaultSubscription(): UserSubscription {
    return {
      tier: SubscriptionTier.FREE,
      startDate: new Date(),
      autoRenew: false,
      paymentMethod: 'stripe',
      teamMembers: [],
      metrics: {
        totalEarnings: 0,
        monthlyRevenue: 0,
        fanSubscriptions: 0,
        communityPoolShare: 0,
        referralEarnings: 0,
        teamEarnings: 0,
        revenueBreakdown: {
          streams: 0,
          subscriptions: 0,
          social: 0,
          referrals: 0,
          community: 0
        }
      },
      fanSubscribers: [],
      communityRevenueShare: true
    };
  }

  async updateSubscription(subscription: UserSubscription): Promise<void> {
    try {
      this.currentSubscription = subscription;
      await AsyncStorage.setItem('user_subscription', JSON.stringify(subscription));
    } catch (error) {
      console.error('Error saving subscription:', error);
      throw error;
    }
  }

  // Subscription Upgrade/Downgrade
  async upgradeSubscription(newTier: SubscriptionTier, paymentMethod: 'stripe' | 'bezy' = 'stripe'): Promise<void> {
    const current = await this.getCurrentSubscription();
    if (!current) return;

    const updatedSubscription: UserSubscription = {
      ...current,
      tier: newTier,
      startDate: new Date(),
      endDate: this.calculateEndDate(newTier),
      autoRenew: true,
      paymentMethod
    };

    await this.updateSubscription(updatedSubscription);

    // Trigger revenue sharing for new subscription
    if (newTier !== SubscriptionTier.FREE) {
      await this.distributeFanRevenue(newTier);
    }
  }

  private calculateEndDate(tier: SubscriptionTier): Date | undefined {
    if (tier === SubscriptionTier.FREE) return undefined;

    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    return endDate;
  }

  // Team Management
  async inviteTeamMember(email: string, role: TeamRole, bezyShare: number = 10): Promise<void> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription || subscription.tier !== SubscriptionTier.TEAM) {
      throw new Error('Team features require Team/Label subscription');
    }

    if (subscription.teamMembers.length >= 10) {
      throw new Error('Maximum 10 team members allowed');
    }

    const newMember: TeamMember = {
      id: Date.now().toString(),
      email,
      role,
      permissions: this.getRolePermissions(role),
      invitedAt: new Date(),
      bezyRewardShare: bezyShare
    };

    subscription.teamMembers.push(newMember);
    await this.updateSubscription(subscription);

    // Send invitation email (placeholder)
    console.log(`Invitation sent to ${email} with role ${role}`);
  }

  private getRolePermissions(role: TeamRole): string[] {
    switch (role) {
      case TeamRole.OWNER:
        return ['all'];
      case TeamRole.MANAGER:
        return ['content_upload', 'analytics_view', 'fan_engagement', 'revenue_view', 'team_manage'];
      case TeamRole.ANALYST:
        return ['analytics_view', 'revenue_view'];
      default:
        return [];
    }
  }

  // Referral System
  async generateReferralCode(): Promise<string> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription || subscription.tier === SubscriptionTier.FREE) {
      throw new Error('Referral codes require Pro or Team subscription');
    }

    const code = this.generateRandomCode();
    subscription.referralCode = code;
    await this.updateSubscription(subscription);

    return code;
  }

  private generateRandomCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  async useReferralCode(code: string, newUserId: string): Promise<void> {
    // Reward both referrer and referee
    const rewardAmount = 50; // 50 BEZY for both parties

    // This would integrate with BEZY token system
    console.log(`Referral reward: ${rewardAmount} BEZY for using code ${code}`);
  }

  // Revenue Sharing & Fan Subscriptions
  async subscribeFanToArtist(artistId: string, fanId: string): Promise<void> {
    // When a fan subscribes to an artist, 20% of their subscription fee
    // goes directly to the artist in BEZY tokens
    const subscriptionFee = 9.99; // Pro tier price
    const artistShare = subscriptionFee * 0.2; // 20% to artist

    console.log(`Fan subscription: $${artistShare} worth of BEZY to artist ${artistId}`);
  }

  private async distributeFanRevenue(tier: SubscriptionTier): Promise<void> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription) return;

    // Distribute 15% of subscription revenue to fan community
    const plans = this.getSubscriptionPlans();
    const plan = plans.find(p => p.id === tier);
    if (!plan || plan.price === 0) return;

    const communityShare = plan.price * 0.15;
    subscription.metrics.communityPoolShare += communityShare;

    await this.updateSubscription(subscription);
    console.log(`Community pool: $${communityShare} distributed to fan base`);
  }

  // Analytics and Metrics
  async updateEarnings(streamRevenue: number, socialRevenue: number = 0): Promise<void> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription) return;

    const plan = this.getSubscriptionPlans().find(p => p.id === subscription.tier);
    const multiplier = plan?.bezyMultiplier || 1.0;

    // Apply tier multiplier to earnings
    const boostedStreamRevenue = streamRevenue * multiplier;
    const boostedSocialRevenue = socialRevenue * multiplier;

    subscription.metrics.revenueBreakdown.streams += boostedStreamRevenue;
    subscription.metrics.revenueBreakdown.social += boostedSocialRevenue;
    subscription.metrics.totalEarnings += (boostedStreamRevenue + boostedSocialRevenue);

    await this.updateSubscription(subscription);
  }

  async getMonthlyMetrics(): Promise<SubscriptionMetrics> {
    const subscription = await this.getCurrentSubscription();
    return subscription?.metrics || this.createDefaultSubscription().metrics;
  }

  // Payment Integration
  async processSubscriptionPayment(tier: SubscriptionTier, paymentMethod: string): Promise<boolean> {
    // This would integrate with Stripe or BEZY payment processing
    const plans = this.getSubscriptionPlans();
    const plan = plans.find(p => p.id === tier);

    if (!plan) throw new Error('Invalid subscription plan');

    console.log(`Processing ${plan.name} subscription: $${plan.price}/month via ${paymentMethod}`);

    // Simulate payment processing
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 2000);
    });
  }

  // Community Features
  async enableCommunityRevenueSharing(enabled: boolean): Promise<void> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription) return;

    subscription.communityRevenueShare = enabled;
    await this.updateSubscription(subscription);
  }

  async getFanEngagementBonus(): Promise<number> {
    const subscription = await this.getCurrentSubscription();
    if (!subscription) return 0;

    // Higher tiers get engagement bonuses
    switch (subscription.tier) {
      case SubscriptionTier.PRO:
        return 1.5; // 50% engagement bonus
      case SubscriptionTier.TEAM:
        return 2.0; // 100% engagement bonus
      default:
        return 1.0; // No bonus for free tier
    }
  }
}

export default SubscriptionService.getInstance();