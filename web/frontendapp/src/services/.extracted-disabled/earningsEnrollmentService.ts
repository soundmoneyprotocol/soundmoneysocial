import AsyncStorage from '@react-native-async-storage/async-storage';

export enum SocialPlatform {
  INSTAGRAM = 'instagram',
  TIKTOK = 'tiktok',
  YOUTUBE = 'youtube',
  TWITTER = 'twitter',
  SPOTIFY = 'spotify',
  SOUNDCLOUD = 'soundcloud'
}

export enum StableCoin {
  USDC = 'usdc',
  USDT = 'usdt',
  PYUSD = 'pyusd',
  BZUSD = 'bzusd'
}

export enum PrivacyShareLevel {
  FANS_ONLY = 'fans_only',
  ARTISTS_ONLY = 'artists_only',
  BOTH = 'both',
  NONE = 'none'
}

export enum EnrollmentStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  ACTIVE = 'active',
  SUSPENDED = 'suspended'
}

export interface SocialMediaConnection {
  platform: SocialPlatform;
  username: string;
  verified: boolean;
  follower_count?: number;
  profile_url: string;
}

export interface PrivacyConsent {
  location_services: boolean;
  data_sharing: boolean;
  marketing_communications: boolean;
  analytics_tracking: boolean;
  share_level: PrivacyShareLevel;
  consented_at: string;
}

export interface BankAccountInfo {
  bank_name: string;
  account_type: 'checking' | 'savings';
  account_holder_name: string;
  routing_number: string;
  account_number_last_four: string;
  verified: boolean;
  connected_at: string;
}

export interface WalletConnection {
  wallet_type: 'magic_link' | 'metamask' | 'coinbase';
  wallet_address: string;
  preferred_stablecoin: StableCoin;
  connected_at: string;
  verified: boolean;
}

export interface EarningsSettings {
  auto_conversion_enabled: boolean;
  conversion_threshold: number;
  preferred_payout_method: 'bank' | 'crypto';
  payout_frequency: 'daily' | 'weekly' | 'monthly';
}

export interface EnrollmentApplication {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  phone?: string;
  social_connections: SocialMediaConnection[];
  privacy_consent: PrivacyConsent;
  bank_account?: BankAccountInfo;
  wallet_connection?: WalletConnection;
  earnings_settings: EarningsSettings;
  status: EnrollmentStatus;
  earnings_to_date: number;
  pending_balance: number;
  last_payout_date?: string;
  created_at: string;
  updated_at: string;
  verified_at?: string;
}

export interface BezyEarningsProgram {
  program_name: string;
  description: string;
  earning_methods: {
    method: string;
    description: string;
    rate: string;
    icon: string;
  }[];
  minimum_payout: number;
  supported_stablecoins: StableCoin[];
  verification_requirements: string[];
  terms_url: string;
  privacy_policy_url: string;
}

class EarningsEnrollmentService {
  private static instance: EarningsEnrollmentService;
  private enrollments: EnrollmentApplication[] = [];
  private programInfo: BezyEarningsProgram;

  constructor() {
    this.programInfo = {
      program_name: 'BEZY Creator Earnings',
      description: 'Earn BEZY tokens for creating content, sharing music, and building your fanbase. Convert to USD or hold as crypto.',
      earning_methods: [
        {
          method: 'Content Creation',
          description: 'Earn BEZY for posts, tracks, and community engagement',
          rate: '1-50 BEZY per post',
          icon: '🎵'
        },
        {
          method: 'Fan Engagement',
          description: 'Earn when fans interact with your content',
          rate: '0.1 BEZY per interaction',
          icon: '💖'
        },
        {
          method: 'Referrals',
          description: 'Earn when you invite new users to the platform',
          rate: '100 BEZY per referral',
          icon: '👥'
        },
        {
          method: 'Streaming Rewards',
          description: 'Earn from music streams and discovery',
          rate: '0.05 BEZY per stream',
          icon: '📻'
        },
        {
          method: 'Community Building',
          description: 'Earn for active community participation',
          rate: '5-25 BEZY per day',
          icon: '🌟'
        }
      ],
      minimum_payout: 50, // 50 BEZY minimum
      supported_stablecoins: [StableCoin.USDC, StableCoin.USDT, StableCoin.PYUSD, StableCoin.BZUSD],
      verification_requirements: [
        'Valid email address',
        'At least one social media account',
        'Privacy consent agreement',
        'Bank account or crypto wallet connection',
        'Identity verification (for payouts over $100/month)'
      ],
      terms_url: 'https://bezy.app/terms/earnings',
      privacy_policy_url: 'https://bezy.app/privacy/earnings'
    };
    this.loadEnrollments();
  }

  public static getInstance(): EarningsEnrollmentService {
    if (!EarningsEnrollmentService.instance) {
      EarningsEnrollmentService.instance = new EarningsEnrollmentService();
    }
    return EarningsEnrollmentService.instance;
  }

  private async loadEnrollments(): Promise<void> {
    try {
      const storedEnrollments = await AsyncStorage.getItem('earnings_enrollments');
      if (storedEnrollments) {
        this.enrollments = JSON.parse(storedEnrollments);
      } else {
        this.enrollments = this.generateSampleEnrollments();
        await this.saveEnrollments();
      }
    } catch (error) {
      console.error('Error loading earnings enrollments:', error);
      this.enrollments = this.generateSampleEnrollments();
    }
  }

  private async saveEnrollments(): Promise<void> {
    try {
      await AsyncStorage.setItem('earnings_enrollments', JSON.stringify(this.enrollments));
    } catch (error) {
      console.error('Error saving earnings enrollments:', error);
    }
  }

  public async createEnrollment(enrollmentData: Omit<EnrollmentApplication, 'id' | 'status' | 'earnings_to_date' | 'pending_balance' | 'created_at' | 'updated_at'>): Promise<EnrollmentApplication> {
    const newEnrollment: EnrollmentApplication = {
      ...enrollmentData,
      id: `enroll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: EnrollmentStatus.PENDING,
      earnings_to_date: 0,
      pending_balance: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.enrollments.unshift(newEnrollment);
    await this.saveEnrollments();
    return newEnrollment;
  }

  public async updateEnrollment(enrollmentId: string, updateData: Partial<EnrollmentApplication>): Promise<boolean> {
    const enrollmentIndex = this.enrollments.findIndex(e => e.id === enrollmentId);
    if (enrollmentIndex === -1) return false;

    this.enrollments[enrollmentIndex] = {
      ...this.enrollments[enrollmentIndex],
      ...updateData,
      updated_at: new Date().toISOString(),
    };

    await this.saveEnrollments();
    return true;
  }

  public async getEnrollmentByUserId(userId: string): Promise<EnrollmentApplication | null> {
    return this.enrollments.find(e => e.user_id === userId) || null;
  }

  public async verifyEnrollment(enrollmentId: string): Promise<boolean> {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    enrollment.status = EnrollmentStatus.VERIFIED;
    enrollment.verified_at = new Date().toISOString();
    enrollment.updated_at = new Date().toISOString();

    await this.saveEnrollments();
    return true;
  }

  public async activateEarnings(enrollmentId: string): Promise<boolean> {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment || enrollment.status !== EnrollmentStatus.VERIFIED) return false;

    enrollment.status = EnrollmentStatus.ACTIVE;
    enrollment.updated_at = new Date().toISOString();

    await this.saveEnrollments();
    return true;
  }

  public async addEarnings(userId: string, amount: number, method: string): Promise<boolean> {
    const enrollment = this.enrollments.find(e => e.user_id === userId);
    if (!enrollment || enrollment.status !== EnrollmentStatus.ACTIVE) return false;

    enrollment.pending_balance += amount;
    enrollment.earnings_to_date += amount;
    enrollment.updated_at = new Date().toISOString();

    await this.saveEnrollments();
    return true;
  }

  public async processPayout(enrollmentId: string, amount: number): Promise<boolean> {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment || enrollment.pending_balance < amount) return false;

    enrollment.pending_balance -= amount;
    enrollment.last_payout_date = new Date().toISOString();
    enrollment.updated_at = new Date().toISOString();

    await this.saveEnrollments();
    return true;
  }

  public async connectSocialMedia(enrollmentId: string, connection: SocialMediaConnection): Promise<boolean> {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    const existingIndex = enrollment.social_connections.findIndex(c => c.platform === connection.platform);
    if (existingIndex >= 0) {
      enrollment.social_connections[existingIndex] = connection;
    } else {
      enrollment.social_connections.push(connection);
    }

    enrollment.updated_at = new Date().toISOString();
    await this.saveEnrollments();
    return true;
  }

  public async connectBankAccount(enrollmentId: string, bankInfo: BankAccountInfo): Promise<boolean> {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    enrollment.bank_account = bankInfo;
    enrollment.updated_at = new Date().toISOString();
    await this.saveEnrollments();
    return true;
  }

  public async connectWallet(enrollmentId: string, walletInfo: WalletConnection): Promise<boolean> {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    enrollment.wallet_connection = walletInfo;
    enrollment.updated_at = new Date().toISOString();
    await this.saveEnrollments();
    return true;
  }

  public async updatePrivacyConsent(enrollmentId: string, consent: PrivacyConsent): Promise<boolean> {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    enrollment.privacy_consent = consent;
    enrollment.updated_at = new Date().toISOString();
    await this.saveEnrollments();
    return true;
  }

  public async updateEarningsSettings(enrollmentId: string, settings: EarningsSettings): Promise<boolean> {
    const enrollment = this.enrollments.find(e => e.id === enrollmentId);
    if (!enrollment) return false;

    enrollment.earnings_settings = settings;
    enrollment.updated_at = new Date().toISOString();
    await this.saveEnrollments();
    return true;
  }

  public getProgramInfo(): BezyEarningsProgram {
    return this.programInfo;
  }

  public async getAllEnrollments(): Promise<EnrollmentApplication[]> {
    return this.enrollments.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  private generateSampleEnrollments(): EnrollmentApplication[] {
    return [
      {
        id: 'enroll_1',
        user_id: 'user_1',
        email: 'maya@example.com',
        full_name: 'Maya Rodriguez',
        phone: '+1 (555) 123-4567',
        social_connections: [
          {
            platform: SocialPlatform.INSTAGRAM,
            username: '@mayarodriguezmusic',
            verified: true,
            follower_count: 15420,
            profile_url: 'https://instagram.com/mayarodriguezmusic'
          },
          {
            platform: SocialPlatform.SPOTIFY,
            username: 'Maya Rodriguez',
            verified: true,
            follower_count: 8932,
            profile_url: 'https://open.spotify.com/artist/mayarodriguez'
          }
        ],
        privacy_consent: {
          location_services: true,
          data_sharing: true,
          marketing_communications: false,
          analytics_tracking: true,
          share_level: PrivacyShareLevel.BOTH,
          consented_at: '2024-12-15T10:00:00Z'
        },
        bank_account: {
          bank_name: 'Chase Bank',
          account_type: 'checking',
          account_holder_name: 'Maya Rodriguez',
          routing_number: '021000021',
          account_number_last_four: '1234',
          verified: true,
          connected_at: '2024-12-15T10:30:00Z'
        },
        wallet_connection: {
          wallet_type: 'magic_link',
          wallet_address: '0x742d35Cc6798C42c684a5890e8bF5A3Af99C4567',
          preferred_stablecoin: StableCoin.USDC,
          connected_at: '2024-12-15T11:00:00Z',
          verified: true
        },
        earnings_settings: {
          auto_conversion_enabled: true,
          conversion_threshold: 100,
          preferred_payout_method: 'bank',
          payout_frequency: 'weekly'
        },
        status: EnrollmentStatus.ACTIVE,
        earnings_to_date: 2847.50,
        pending_balance: 156.25,
        last_payout_date: '2024-12-25T09:00:00Z',
        created_at: '2024-12-15T08:00:00Z',
        updated_at: '2024-12-25T09:00:00Z',
        verified_at: '2024-12-16T14:00:00Z'
      }
    ];
  }
}

export const earningsEnrollmentService = EarningsEnrollmentService.getInstance();