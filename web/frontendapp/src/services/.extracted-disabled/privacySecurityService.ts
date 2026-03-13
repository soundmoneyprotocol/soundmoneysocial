import AsyncStorage from '@react-native-async-storage/async-storage';

export enum PrivacyLevel {
  PUBLIC = 'public',           // Everyone can see
  FRIENDS = 'friends',         // Only friends/connections
  SUBSCRIBERS = 'subscribers', // Only paying subscribers
  PRIVATE = 'private',        // Only user can see
  MONETIZED = 'monetized'     // Available for purchase/licensing
}

export enum DataType {
  PROFILE = 'profile',
  MUSIC_CONTENT = 'music_content',
  SOCIAL_GRAPH = 'social_graph',
  LISTENING_HISTORY = 'listening_history',
  LOCATION_DATA = 'location_data',
  ENGAGEMENT_DATA = 'engagement_data',
  EARNINGS_DATA = 'earnings_data',
  STREAMING_DATA = 'streaming_data',
  BIOMETRIC_DATA = 'biometric_data',
  DEVICE_INFO = 'device_info',
  COMMUNICATION_DATA = 'communication_data'
}

export enum MonetizationMode {
  NOT_FOR_SALE = 'not_for_sale',
  ONE_TIME_LICENSE = 'one_time_license',
  RECURRING_LICENSE = 'recurring_license',
  SUBSCRIPTION_ACCESS = 'subscription_access',
  PAY_PER_USE = 'pay_per_use',
  AUCTION_BASED = 'auction_based'
}

export interface DataPrivacySetting {
  dataType: DataType;
  privacyLevel: PrivacyLevel;
  monetizationMode: MonetizationMode;
  pricePerAccess?: number; // in BEZY tokens
  pricePerMonth?: number;  // for recurring licenses
  allowedPlatforms?: string[]; // external platforms allowed to access
  retentionPeriod?: number; // days to keep data
  anonymizationLevel?: 'none' | 'partial' | 'full';
  thirdPartySharing?: boolean;
  aiTraining?: boolean;
  dataExport?: boolean;
  userControlled?: boolean; // user has granular control
}

export interface SocialGraphMonetization {
  connectionVisibility: PrivacyLevel;
  influenceScore: boolean; // whether to share influence metrics
  networkValue: number; // estimated value of social graph in BEZY
  monetizationEnabled: boolean;
  licensingTerms: {
    oneTime: number; // BEZY tokens for one-time access
    monthly: number; // BEZY tokens per month
    annual: number; // BEZY tokens per year
  };
  allowedUseCases: string[]; // marketing, research, networking, etc.
  geographicRestrictions?: string[]; // countries/regions where data can be used
  platformExclusions?: string[]; // platforms that cannot access data
}

export interface ContentMonetization {
  nameAndLikeness: {
    monetizationEnabled: boolean;
    pricePerUse: number; // BEZY tokens
    approvalRequired: boolean;
    usageRestrictions: string[];
  };
  musicContent: {
    streamingRoyalties: boolean;
    samplingRights: number; // BEZY tokens per sample
    remixRights: number; // BEZY tokens per remix
    synchronizationRights: number; // BEZY tokens for sync licensing
  };
  socialContent: {
    postLicensing: number; // BEZY tokens per post use
    commentLicensing: number; // BEZY tokens per comment use
    reactionData: number; // BEZY tokens for reaction patterns
  };
}

export interface PrivacySettings {
  mode: 'simple' | 'advanced';
  dataSettings: Record<DataType, DataPrivacySetting>;
  socialGraphMonetization: SocialGraphMonetization;
  contentMonetization: ContentMonetization;
  decentralizedSharing: {
    enabled: boolean;
    autoShareOutside: boolean;
    requirePermission: boolean;
    trackingEnabled: boolean;
    attributionRequired: boolean;
  };
  web3Features: {
    socialGraphNFT: boolean; // mint social graph as NFT
    dataDAO: boolean; // participate in data governance DAO
    crossChainSharing: boolean; // share across blockchain networks
    zeroKnowledgeProofs: boolean; // use ZK for private verification
  };
  lastUpdated: string;
  consentTimestamp: string;
  gdprCompliant: boolean;
  ccpaCompliant: boolean;
}

export interface DataUsageInsight {
  platform: string;
  dataType: DataType;
  accessCount: number;
  lastAccessed: string;
  revenueGenerated: number; // in BEZY tokens
  usageDescription: string;
  canRevoke: boolean;
}

export interface PrivacyAlert {
  id: string;
  type: 'data_access' | 'monetization_opportunity' | 'privacy_risk' | 'new_platform';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  action?: string;
  timestamp: string;
  dismissed: boolean;
}

class PrivacySecurityService {
  private static instance: PrivacySecurityService;
  private readonly STORAGE_KEY = 'privacy_settings';
  private readonly INSIGHTS_KEY = 'data_usage_insights';
  private readonly ALERTS_KEY = 'privacy_alerts';

  private constructor() {}

  static getInstance(): PrivacySecurityService {
    if (!PrivacySecurityService.instance) {
      PrivacySecurityService.instance = new PrivacySecurityService();
    }
    return PrivacySecurityService.instance;
  }

  async getDefaultSettings(): Promise<PrivacySettings> {
    return {
      mode: 'simple',
      dataSettings: {
        [DataType.PROFILE]: {
          dataType: DataType.PROFILE,
          privacyLevel: PrivacyLevel.FRIENDS,
          monetizationMode: MonetizationMode.NOT_FOR_SALE,
          userControlled: true,
          anonymizationLevel: 'partial',
          thirdPartySharing: false,
          aiTraining: false,
          dataExport: true
        },
        [DataType.MUSIC_CONTENT]: {
          dataType: DataType.MUSIC_CONTENT,
          privacyLevel: PrivacyLevel.PUBLIC,
          monetizationMode: MonetizationMode.SUBSCRIPTION_ACCESS,
          pricePerAccess: 10,
          pricePerMonth: 100,
          userControlled: true,
          thirdPartySharing: true,
          aiTraining: false,
          dataExport: true
        },
        [DataType.SOCIAL_GRAPH]: {
          dataType: DataType.SOCIAL_GRAPH,
          privacyLevel: PrivacyLevel.PRIVATE,
          monetizationMode: MonetizationMode.ONE_TIME_LICENSE,
          pricePerAccess: 500,
          userControlled: true,
          anonymizationLevel: 'full',
          thirdPartySharing: false,
          aiTraining: false,
          dataExport: false
        },
        [DataType.LISTENING_HISTORY]: {
          dataType: DataType.LISTENING_HISTORY,
          privacyLevel: PrivacyLevel.PRIVATE,
          monetizationMode: MonetizationMode.PAY_PER_USE,
          pricePerAccess: 25,
          userControlled: true,
          anonymizationLevel: 'partial',
          thirdPartySharing: false,
          aiTraining: true,
          dataExport: true
        },
        [DataType.LOCATION_DATA]: {
          dataType: DataType.LOCATION_DATA,
          privacyLevel: PrivacyLevel.PRIVATE,
          monetizationMode: MonetizationMode.NOT_FOR_SALE,
          userControlled: true,
          anonymizationLevel: 'full',
          thirdPartySharing: false,
          aiTraining: false,
          dataExport: false,
          retentionPeriod: 30
        },
        [DataType.ENGAGEMENT_DATA]: {
          dataType: DataType.ENGAGEMENT_DATA,
          privacyLevel: PrivacyLevel.SUBSCRIBERS,
          monetizationMode: MonetizationMode.RECURRING_LICENSE,
          pricePerMonth: 50,
          userControlled: true,
          anonymizationLevel: 'partial',
          thirdPartySharing: true,
          aiTraining: true,
          dataExport: true
        },
        [DataType.EARNINGS_DATA]: {
          dataType: DataType.EARNINGS_DATA,
          privacyLevel: PrivacyLevel.PRIVATE,
          monetizationMode: MonetizationMode.NOT_FOR_SALE,
          userControlled: true,
          anonymizationLevel: 'full',
          thirdPartySharing: false,
          aiTraining: false,
          dataExport: true
        },
        [DataType.STREAMING_DATA]: {
          dataType: DataType.STREAMING_DATA,
          privacyLevel: PrivacyLevel.FRIENDS,
          monetizationMode: MonetizationMode.PAY_PER_USE,
          pricePerAccess: 15,
          userControlled: true,
          anonymizationLevel: 'partial',
          thirdPartySharing: true,
          aiTraining: true,
          dataExport: true
        },
        [DataType.BIOMETRIC_DATA]: {
          dataType: DataType.BIOMETRIC_DATA,
          privacyLevel: PrivacyLevel.PRIVATE,
          monetizationMode: MonetizationMode.NOT_FOR_SALE,
          userControlled: true,
          anonymizationLevel: 'full',
          thirdPartySharing: false,
          aiTraining: false,
          dataExport: false,
          retentionPeriod: 7
        },
        [DataType.DEVICE_INFO]: {
          dataType: DataType.DEVICE_INFO,
          privacyLevel: PrivacyLevel.PRIVATE,
          monetizationMode: MonetizationMode.NOT_FOR_SALE,
          userControlled: true,
          anonymizationLevel: 'full',
          thirdPartySharing: false,
          aiTraining: true,
          dataExport: false
        },
        [DataType.COMMUNICATION_DATA]: {
          dataType: DataType.COMMUNICATION_DATA,
          privacyLevel: PrivacyLevel.PRIVATE,
          monetizationMode: MonetizationMode.NOT_FOR_SALE,
          userControlled: true,
          anonymizationLevel: 'full',
          thirdPartySharing: false,
          aiTraining: false,
          dataExport: true,
          retentionPeriod: 90
        }
      },
      socialGraphMonetization: {
        connectionVisibility: PrivacyLevel.FRIENDS,
        influenceScore: false,
        networkValue: 0,
        monetizationEnabled: false,
        licensingTerms: {
          oneTime: 1000,
          monthly: 200,
          annual: 2000
        },
        allowedUseCases: ['networking', 'music_discovery'],
        geographicRestrictions: [],
        platformExclusions: []
      },
      contentMonetization: {
        nameAndLikeness: {
          monetizationEnabled: false,
          pricePerUse: 100,
          approvalRequired: true,
          usageRestrictions: ['no_deepfakes', 'no_political_ads', 'no_adult_content']
        },
        musicContent: {
          streamingRoyalties: true,
          samplingRights: 50,
          remixRights: 100,
          synchronizationRights: 500
        },
        socialContent: {
          postLicensing: 10,
          commentLicensing: 5,
          reactionData: 1
        }
      },
      decentralizedSharing: {
        enabled: false,
        autoShareOutside: false,
        requirePermission: true,
        trackingEnabled: true,
        attributionRequired: true
      },
      web3Features: {
        socialGraphNFT: false,
        dataDAO: false,
        crossChainSharing: false,
        zeroKnowledgeProofs: false
      },
      lastUpdated: new Date().toISOString(),
      consentTimestamp: new Date().toISOString(),
      gdprCompliant: true,
      ccpaCompliant: true
    };
  }

  async getPrivacySettings(): Promise<PrivacySettings> {
    try {
      const stored = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      return await this.getDefaultSettings();
    } catch (error) {
      console.error('Error getting privacy settings:', error);
      return await this.getDefaultSettings();
    }
  }

  async updatePrivacySettings(settings: Partial<PrivacySettings>): Promise<boolean> {
    try {
      const current = await this.getPrivacySettings();
      const updated = {
        ...current,
        ...settings,
        lastUpdated: new Date().toISOString()
      };

      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(updated));

      // Log privacy setting change for audit
      await this.logPrivacyEvent('settings_updated', {
        mode: updated.mode,
        timestamp: updated.lastUpdated
      });

      return true;
    } catch (error) {
      console.error('Error updating privacy settings:', error);
      return false;
    }
  }

  async updateDataPrivacySetting(dataType: DataType, setting: Partial<DataPrivacySetting>): Promise<boolean> {
    try {
      const settings = await this.getPrivacySettings();
      settings.dataSettings[dataType] = {
        ...settings.dataSettings[dataType],
        ...setting
      };

      return await this.updatePrivacySettings({ dataSettings: settings.dataSettings });
    } catch (error) {
      console.error('Error updating data privacy setting:', error);
      return false;
    }
  }

  async toggleMonetization(dataType: DataType, enabled: boolean): Promise<boolean> {
    try {
      const mode = enabled ? MonetizationMode.PAY_PER_USE : MonetizationMode.NOT_FOR_SALE;
      return await this.updateDataPrivacySetting(dataType, { monetizationMode: mode });
    } catch (error) {
      console.error('Error toggling monetization:', error);
      return false;
    }
  }

  async setMonetizationPrice(dataType: DataType, price: number, priceType: 'access' | 'monthly' = 'access'): Promise<boolean> {
    try {
      const update = priceType === 'access' ? { pricePerAccess: price } : { pricePerMonth: price };
      return await this.updateDataPrivacySetting(dataType, update);
    } catch (error) {
      console.error('Error setting monetization price:', error);
      return false;
    }
  }

  async getDataUsageInsights(): Promise<DataUsageInsight[]> {
    try {
      const stored = await AsyncStorage.getItem(this.INSIGHTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Return demo insights
      return [
        {
          platform: 'Spotify',
          dataType: DataType.LISTENING_HISTORY,
          accessCount: 45,
          lastAccessed: new Date(Date.now() - 86400000).toISOString(),
          revenueGenerated: 112.5,
          usageDescription: 'Music recommendation algorithm training',
          canRevoke: true
        },
        {
          platform: 'Meta (Instagram)',
          dataType: DataType.SOCIAL_GRAPH,
          accessCount: 12,
          lastAccessed: new Date(Date.now() - 172800000).toISOString(),
          revenueGenerated: 600,
          usageDescription: 'Targeted advertising and friend suggestions',
          canRevoke: true
        },
        {
          platform: 'TikTok',
          dataType: DataType.ENGAGEMENT_DATA,
          accessCount: 28,
          lastAccessed: new Date(Date.now() - 43200000).toISOString(),
          revenueGenerated: 140,
          usageDescription: 'Content discovery and creator matching',
          canRevoke: true
        }
      ];
    } catch (error) {
      console.error('Error getting data usage insights:', error);
      return [];
    }
  }

  async getPrivacyAlerts(): Promise<PrivacyAlert[]> {
    try {
      const stored = await AsyncStorage.getItem(this.ALERTS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }

      // Return demo alerts
      return [
        {
          id: '1',
          type: 'monetization_opportunity',
          title: 'New Monetization Opportunity',
          description: 'Your social graph value has increased 25%. Consider enabling monetization to earn from your influence.',
          severity: 'low',
          action: 'Enable Monetization',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          dismissed: false
        },
        {
          id: '2',
          type: 'data_access',
          title: 'New Platform Access Request',
          description: 'YouTube Music wants access to your listening history for $50 BEZY per month.',
          severity: 'medium',
          action: 'Review Request',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          dismissed: false
        },
        {
          id: '3',
          type: 'privacy_risk',
          title: 'Location Data Exposure',
          description: 'Your location data is being shared with 3 platforms. Consider reviewing your settings.',
          severity: 'high',
          action: 'Review Settings',
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          dismissed: false
        }
      ];
    } catch (error) {
      console.error('Error getting privacy alerts:', error);
      return [];
    }
  }

  async dismissAlert(alertId: string): Promise<boolean> {
    try {
      const alerts = await this.getPrivacyAlerts();
      const updated = alerts.map(alert =>
        alert.id === alertId ? { ...alert, dismissed: true } : alert
      );

      await AsyncStorage.setItem(this.ALERTS_KEY, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.error('Error dismissing alert:', error);
      return false;
    }
  }

  async calculateNetworkValue(): Promise<number> {
    // Simulate network value calculation based on connections, engagement, and influence
    const baseValue = Math.random() * 1000 + 500; // 500-1500 BEZY
    const influenceMultiplier = Math.random() * 2 + 1; // 1-3x multiplier
    return Math.round(baseValue * influenceMultiplier);
  }

  async estimateRevenueOpportunity(dataType: DataType): Promise<number> {
    const baseRates: Record<DataType, number> = {
      [DataType.PROFILE]: 50,
      [DataType.MUSIC_CONTENT]: 200,
      [DataType.SOCIAL_GRAPH]: 500,
      [DataType.LISTENING_HISTORY]: 100,
      [DataType.LOCATION_DATA]: 300,
      [DataType.ENGAGEMENT_DATA]: 150,
      [DataType.EARNINGS_DATA]: 0, // Not recommended for monetization
      [DataType.STREAMING_DATA]: 75,
      [DataType.BIOMETRIC_DATA]: 0, // Not recommended for monetization
      [DataType.DEVICE_INFO]: 25,
      [DataType.COMMUNICATION_DATA]: 0 // Not recommended for monetization
    };

    const multiplier = Math.random() * 1.5 + 0.5; // 0.5-2x variation
    return Math.round(baseRates[dataType] * multiplier);
  }

  private async logPrivacyEvent(event: string, data: any): Promise<void> {
    try {
      // In production, this would send to privacy audit log
      console.log('Privacy Event:', { event, data, timestamp: new Date().toISOString() });
    } catch (error) {
      console.error('Error logging privacy event:', error);
    }
  }

  async exportUserData(): Promise<string> {
    try {
      const settings = await this.getPrivacySettings();
      const insights = await this.getDataUsageInsights();
      const alerts = await this.getPrivacyAlerts();

      const exportData = {
        privacySettings: settings,
        dataUsageInsights: insights,
        privacyAlerts: alerts,
        exportTimestamp: new Date().toISOString(),
        exportVersion: '1.0.0'
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  async revokeDataAccess(platform: string, dataType: DataType): Promise<boolean> {
    try {
      // In production, this would revoke platform access
      await this.logPrivacyEvent('data_access_revoked', { platform, dataType });
      return true;
    } catch (error) {
      console.error('Error revoking data access:', error);
      return false;
    }
  }

  getPrivacyEducationContent(): Record<string, { simple: string; advanced: string; benefits: string[]; risks: string[] }> {
    return {
      social_graph_monetization: {
        simple: "Your social connections have value! You can earn money when companies want to understand your network for advertising or research.",
        advanced: "Social graph monetization leverages network topology analysis, influence scoring, and behavioral pattern recognition to generate value from your digital relationships through licensing agreements with data consumers.",
        benefits: ["Earn passive income from your connections", "Control how your network is used", "Get paid for your influence"],
        risks: ["May affect relationships if overmonetized", "Platform dependency", "Privacy concerns"]
      },
      decentralized_data: {
        simple: "Instead of big tech companies owning your data, you own it on the blockchain and decide who can use it.",
        advanced: "Decentralized data ownership uses blockchain technology, smart contracts, and zero-knowledge proofs to establish cryptographic ownership and granular permissions over personal information assets.",
        benefits: ["True data ownership", "Direct monetization", "Cross-platform portability", "Immutable records"],
        risks: ["Technical complexity", "Gas fees", "Irreversible transactions", "Key management responsibility"]
      },
      privacy_vs_monetization: {
        simple: "You can choose between keeping your data private OR making money from it. SoundMoney lets you pick what works for you.",
        advanced: "Privacy-monetization trade-offs involve differential privacy techniques, homomorphic encryption, and federated learning to enable value extraction while preserving anonymity through mathematical guarantees.",
        benefits: ["Flexible privacy controls", "Transparent value exchange", "User agency", "Granular permissions"],
        risks: ["Complex decision making", "Potential privacy erosion", "Market volatility", "Regulatory uncertainty"]
      }
    };
  }
}

export default PrivacySecurityService.getInstance();
export type { PrivacySettings, DataUsageInsight, PrivacyAlert, DataPrivacySetting, SocialGraphMonetization, ContentMonetization };