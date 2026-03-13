/**
 * Activity Tracking & Fan Engagement Service
 * Comprehensive real-time tracking of user interactions, fan engagement, and communication
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseService';
// Temporarily disabled to prevent app crashes
// import * as Location from 'expo-location';

export interface LocationData {
  country: string;
  state?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  ip_address_hash: string; // Hashed for privacy compliance
  timezone?: string;
}

export interface DeviceInfo {
  platform: string;
  app_version: string;
  device_model?: string;
  os_version?: string;
  screen_resolution?: string;
}

export interface ActivityEvent {
  id: string;
  user_id: string; // The person performing the action
  creator_id: string; // The content creator being interacted with
  event_type: 'stream' | 'engagement' | 'investment' | 'social' | 'communication';
  event_action: string;
  content_id?: string;
  token_id?: string;
  message_id?: string;
  metadata: {
    duration?: number; // For streaming events
    amount?: number; // For investment events
    completion_rate?: number; // For stream completion
    location: LocationData;
    device_info: DeviceInfo;
    timestamp: string;
    session_id: string;
  };
}

export interface FanProfile {
  id: string;
  user_id: string; // The fan's ID
  creator_id: string; // The creator they're following
  display_name: string;
  avatar_url?: string;
  email?: string;
  total_streams: number;
  total_stream_duration: number; // in seconds
  total_investment: number; // USD value
  favorite_tracks: string[];
  first_interaction: string;
  last_activity: string;
  location_history: LocationData[];
  engagement_score: number; // 0-100 based on interaction frequency
  communication_preferences: {
    email: boolean;
    push_notifications: boolean;
    in_app_messages: boolean;
  };
  segment: 'casual' | 'regular' | 'superfan' | 'investor';
}

export interface ContentAnalytics {
  content_id: string;
  total_streams: number;
  unique_listeners: number;
  total_duration: number;
  completion_rate: number;
  geographic_distribution: {
    [country: string]: number;
  };
  top_cities: Array<{
    city: string;
    country: string;
    streams: number;
  }>;
  peak_listening_hours: number[];
  fan_segments: {
    [segment: string]: number;
  };
}

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  type: 'direct' | 'broadcast' | 'email';
  status: 'sent' | 'delivered' | 'read';
  timestamp: string;
  metadata?: {
    subject?: string; // For email messages
    broadcast_segment?: string; // For targeted broadcasts
  };
}

export interface ActivitySummary {
  period: 'today' | 'week' | 'month' | 'year';
  total_streams: number;
  unique_listeners: number;
  new_fans: number;
  total_revenue: number;
  top_content: Array<{
    id: string;
    title: string;
    streams: number;
  }>;
  geographic_insights: {
    top_countries: Array<{
      country: string;
      streams: number;
      percentage: number;
    }>;
    new_markets: string[];
  };
  engagement_metrics: {
    message_responses: number;
    fan_retention_rate: number;
    average_session_duration: number;
  };
}

class ActivityTrackingService {
  private eventQueue: ActivityEvent[] = [];
  private isTracking: boolean = false;
  private locationPermissionGranted: boolean = false;
  private currentSession: string = '';

  constructor() {
    console.log('📊 Activity Tracking Service initialized');
    this.initializeSession();
    this.requestLocationPermission();
  }

  // Session Management
  private async initializeSession(): Promise<void> {
    this.currentSession = `session_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    console.log('🔄 New tracking session:', this.currentSession);
  }

  private async requestLocationPermission(): Promise<void> {
    try {
      console.log('📍 Location module temporarily disabled, using mock location');
      this.locationPermissionGranted = false;
    } catch (error) {
      console.error('Error requesting location permission:', error);
      this.locationPermissionGranted = false;
    }
  }

  // Location Tracking
  private async getCurrentLocation(): Promise<LocationData> {
    try {
      // Location module disabled, use mock location
      return this.getMockLocation();
    } catch (error) {
      console.error('Error getting location:', error);
      return this.getMockLocation();
    }
  }

  private async getMockLocation(): Promise<LocationData> {
    try {
      return {
        country: 'United States',
        state: 'California',
        city: 'San Francisco',
        ip_address_hash: await this.hashIPAddress(),
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      };
    } catch (error) {
      console.error('Error getting mock location:', error);
      return {
        country: 'Unknown',
        ip_address_hash: await this.hashIPAddress(),
        timezone: 'UTC',
      };
    }
  }

  private async getIPBasedLocation(): Promise<LocationData> {
    try {
      // Mock IP-based location - in production, use a service like ipinfo.io
      const response = await fetch('https://ipapi.co/json/');
      const data = await response.json();

      return {
        country: data.country_name || 'Unknown',
        state: data.region || undefined,
        city: data.city || undefined,
        ip_address_hash: await this.hashIPAddress(data.ip),
        timezone: data.timezone,
      };
    } catch (error) {
      console.error('Error getting IP location:', error);
      return this.getMockLocation();
    }
  }

  private async hashIPAddress(ip?: string): Promise<string> {
    // Simple hash for privacy - in production use proper crypto
    const ipToHash = ip || '127.0.0.1';
    let hash = 0;
    for (let i = 0; i < ipToHash.length; i++) {
      const char = ipToHash.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  private async getDeviceInfo(): Promise<DeviceInfo> {
    // In React Native, you'd use react-native-device-info
    return {
      platform: 'ios', // or android
      app_version: '1.0.0',
      device_model: 'iPhone', // Get from device
      os_version: '17.0', // Get from device
      screen_resolution: '390x844', // Get from device
    };
  }

  // Check if table exists before querying
  private isTableMissingError(error: any): boolean {
    return error?.code === 'PGRST205' || error?.message?.includes('Could not find the table');
  }

  // Event Tracking
  async trackEvent(
    userId: string,
    creatorId: string,
    eventType: ActivityEvent['event_type'],
    eventAction: string,
    additionalData?: Partial<ActivityEvent>
  ): Promise<void> {
    try {
      const location = await this.getCurrentLocation();
      const deviceInfo = await this.getDeviceInfo();

      const event: ActivityEvent = {
        id: this.generateEventId(),
        user_id: userId,
        creator_id: creatorId,
        event_type: eventType,
        event_action: eventAction,
        content_id: additionalData?.content_id,
        token_id: additionalData?.token_id,
        message_id: additionalData?.message_id,
        metadata: {
          duration: additionalData?.metadata?.duration,
          amount: additionalData?.metadata?.amount,
          completion_rate: additionalData?.metadata?.completion_rate,
          location,
          device_info: deviceInfo,
          timestamp: new Date().toISOString(),
          session_id: this.currentSession,
          ...additionalData?.metadata,
        },
      };

      // Add to queue for batch processing
      this.eventQueue.push(event);

      // Process queue if it gets large or after timeout
      if (this.eventQueue.length >= 5) {
        await this.processEventQueue();
      }

      console.log('📈 Event tracked:', eventAction);
    } catch (error) {
      console.error('Error tracking event:', error);
    }
  }

  private async processEventQueue(): Promise<void> {
    if (this.eventQueue.length === 0) return;

    try {
      const events = [...this.eventQueue];
      this.eventQueue = [];

      // Save to Supabase
      const { error } = await supabase
        .from('activity_events')
        .insert(events);

      if (error) {
        if (this.isTableMissingError(error)) {
          console.warn('⚠️ activity_events table not yet created, events queued locally');
        } else {
          console.error('Error saving events:', error);
        }
        // Re-add failed events to queue
        this.eventQueue.unshift(...events);
      } else {
        console.log(`✅ Processed ${events.length} activity events`);
      }

      // Update real-time listeners
      this.notifyRealTimeListeners(events);
    } catch (error) {
      console.error('Error processing event queue:', error);
    }
  }

  // Fan Analytics & Management
  async getFanProfiles(creatorId: string): Promise<FanProfile[]> {
    try {
      const { data: events, error } = await supabase
        .from('activity_events')
        .select('*')
        .eq('creator_id', creatorId)
        .order('metadata->timestamp', { ascending: false });

      if (error) {
        if (this.isTableMissingError(error)) {
          console.warn('⚠️ activity_events table not yet created');
          return [];
        }
        throw error;
      }

      // Aggregate events into fan profiles
      const fanMap = new Map<string, Partial<FanProfile>>();

      for (const event of events || []) {
        const userId = event.user_id;

        if (!fanMap.has(userId)) {
          fanMap.set(userId, {
            id: `fan_${userId}_${creatorId}`,
            user_id: userId,
            creator_id: creatorId,
            total_streams: 0,
            total_stream_duration: 0,
            total_investment: 0,
            favorite_tracks: [],
            location_history: [],
            engagement_score: 0,
            first_interaction: event.metadata.timestamp,
            last_activity: event.metadata.timestamp,
          });
        }

        const fan = fanMap.get(userId)!;

        // Update activity metrics
        if (event.event_type === 'stream') {
          fan.total_streams = (fan.total_streams || 0) + 1;
          fan.total_stream_duration = (fan.total_stream_duration || 0) + (event.metadata.duration || 0);
        }

        if (event.event_type === 'investment') {
          fan.total_investment = (fan.total_investment || 0) + (event.metadata.amount || 0);
        }

        // Update location history
        if (event.metadata.location && fan.location_history) {
          fan.location_history.push(event.metadata.location);
        }

        // Update last activity
        if (event.metadata.timestamp > (fan.last_activity || '')) {
          fan.last_activity = event.metadata.timestamp;
        }

        fan.engagement_score = this.calculateEngagementScore(fan);
      }

      // Convert to full fan profiles and get user details
      const fanProfiles = await Promise.all(
        Array.from(fanMap.values()).map(async (fan) => {
          const userDetails = await this.getUserDetails(fan.user_id!);
          return {
            ...fan,
            display_name: userDetails.display_name || 'Unknown Fan',
            avatar_url: userDetails.avatar_url,
            email: userDetails.email,
            communication_preferences: userDetails.communication_preferences || {
              email: true,
              push_notifications: true,
              in_app_messages: true,
            },
            segment: this.categorizeFanSegment(fan),
          } as FanProfile;
        })
      );

      return fanProfiles.sort((a, b) => b.engagement_score - a.engagement_score);
    } catch (error) {
      console.error('Error getting fan profiles:', error);
      return [];
    }
  }

  private calculateEngagementScore(fan: Partial<FanProfile>): number {
    let score = 0;

    // Streaming activity (40 points max)
    const streamPoints = Math.min((fan.total_streams || 0) * 2, 40);
    score += streamPoints;

    // Investment activity (30 points max)
    const investmentPoints = Math.min((fan.total_investment || 0) / 10, 30);
    score += investmentPoints;

    // Recency bonus (20 points max)
    if (fan.last_activity) {
      const daysSinceActivity = (Date.now() - new Date(fan.last_activity).getTime()) / (1000 * 60 * 60 * 24);
      const recencyPoints = Math.max(20 - daysSinceActivity, 0);
      score += recencyPoints;
    }

    // Duration bonus (10 points max)
    const avgDuration = (fan.total_stream_duration || 0) / Math.max(fan.total_streams || 1, 1);
    const durationPoints = Math.min(avgDuration / 30, 10); // 30 seconds = 1 point
    score += durationPoints;

    return Math.min(Math.round(score), 100);
  }

  private categorizeFanSegment(fan: Partial<FanProfile>): FanProfile['segment'] {
    const score = fan.engagement_score || 0;
    const investment = fan.total_investment || 0;

    if (investment > 100 || score >= 80) return 'superfan';
    if (investment > 0 || score >= 60) return 'investor';
    if (score >= 30) return 'regular';
    return 'casual';
  }

  private async getUserDetails(userId: string): Promise<{
    display_name?: string;
    avatar_url?: string;
    email?: string;
    communication_preferences?: FanProfile['communication_preferences'];
  }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('name, avatar_url, email, communication_preferences')
        .eq('id', userId)
        .single();

      if (error) throw error;

      return {
        display_name: data.name,
        avatar_url: data.avatar_url,
        email: data.email,
        communication_preferences: data.communication_preferences,
      };
    } catch (error) {
      console.error('Error getting user details:', error);
      return {};
    }
  }

  // Content Analytics
  async getContentAnalytics(creatorId: string, contentId?: string): Promise<ContentAnalytics[]> {
    try {
      let query = supabase
        .from('activity_events')
        .select('*')
        .eq('creator_id', creatorId)
        .eq('event_type', 'stream');

      if (contentId) {
        query = query.eq('content_id', contentId);
      }

      const { data: events, error } = await query;
      if (error) {
        if (this.isTableMissingError(error)) {
          console.warn('⚠️ activity_events table not yet created');
          return [];
        }
        throw error;
      }

      // Group by content_id
      const contentMap = new Map<string, ActivityEvent[]>();
      for (const event of events || []) {
        if (!event.content_id) continue;

        if (!contentMap.has(event.content_id)) {
          contentMap.set(event.content_id, []);
        }
        contentMap.get(event.content_id)!.push(event);
      }

      // Generate analytics for each content
      const analytics: ContentAnalytics[] = [];
      for (const [contentId, contentEvents] of contentMap) {
        const uniqueUsers = new Set(contentEvents.map(e => e.user_id));
        const completedStreams = contentEvents.filter(e => (e.metadata.completion_rate || 0) >= 0.8);

        // Geographic distribution
        const geoDistribution: { [country: string]: number } = {};
        const cityStreams: Array<{ city: string; country: string; streams: number }> = [];

        contentEvents.forEach(event => {
          const country = event.metadata.location.country;
          geoDistribution[country] = (geoDistribution[country] || 0) + 1;

          if (event.metadata.location.city) {
            const existing = cityStreams.find(c =>
              c.city === event.metadata.location.city &&
              c.country === event.metadata.location.country
            );
            if (existing) {
              existing.streams++;
            } else {
              cityStreams.push({
                city: event.metadata.location.city,
                country: event.metadata.location.country,
                streams: 1
              });
            }
          }
        });

        analytics.push({
          content_id: contentId,
          total_streams: contentEvents.length,
          unique_listeners: uniqueUsers.size,
          total_duration: contentEvents.reduce((sum, e) => sum + (e.metadata.duration || 0), 0),
          completion_rate: completedStreams.length / contentEvents.length,
          geographic_distribution: geoDistribution,
          top_cities: cityStreams.sort((a, b) => b.streams - a.streams).slice(0, 10),
          peak_listening_hours: this.calculatePeakHours(contentEvents),
          fan_segments: this.calculateFanSegments(contentEvents),
        });
      }

      return analytics.sort((a, b) => b.total_streams - a.total_streams);
    } catch (error) {
      console.error('Error getting content analytics:', error);
      return [];
    }
  }

  private calculatePeakHours(events: ActivityEvent[]): number[] {
    const hourCounts = new Array(24).fill(0);

    events.forEach(event => {
      const hour = new Date(event.metadata.timestamp).getHours();
      hourCounts[hour]++;
    });

    return hourCounts;
  }

  private calculateFanSegments(events: ActivityEvent[]): { [segment: string]: number } {
    const segments = { casual: 0, regular: 0, superfan: 0, investor: 0 };

    const userCounts = new Map<string, number>();
    events.forEach(event => {
      userCounts.set(event.user_id, (userCounts.get(event.user_id) || 0) + 1);
    });

    userCounts.forEach(count => {
      if (count >= 10) segments.superfan++;
      else if (count >= 5) segments.regular++;
      else segments.casual++;
    });

    return segments;
  }

  // Messaging & Communication
  async sendMessage(
    senderId: string,
    receiverId: string,
    content: string,
    type: Message['type'] = 'direct',
    metadata?: Message['metadata']
  ): Promise<Message> {
    const message: Message = {
      id: this.generateMessageId(),
      sender_id: senderId,
      receiver_id: receiverId,
      content,
      type,
      status: 'sent',
      timestamp: new Date().toISOString(),
      metadata,
    };

    try {
      const { error } = await supabase
        .from('messages')
        .insert([message]);

      if (error) {
        if (this.isTableMissingError(error)) {
          console.warn('⚠️ messages table not yet created');
          throw error;
        }
        throw error;
      }

      // Track communication event
      await this.trackEvent(senderId, receiverId, 'communication', 'message_sent', {
        message_id: message.id,
      });

      console.log('✉️ Message sent:', message.id);
      return message;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async broadcastToFans(
    creatorId: string,
    content: string,
    targetSegment?: FanProfile['segment']
  ): Promise<void> {
    try {
      const fans = await this.getFanProfiles(creatorId);
      const targetFans = targetSegment
        ? fans.filter(fan => fan.segment === targetSegment)
        : fans.filter(fan => fan.communication_preferences.in_app_messages);

      const messages = targetFans.map(fan => ({
        id: this.generateMessageId(),
        sender_id: creatorId,
        receiver_id: fan.user_id,
        content,
        type: 'broadcast' as const,
        status: 'sent' as const,
        timestamp: new Date().toISOString(),
        metadata: {
          broadcast_segment: targetSegment || 'all',
        },
      }));

      const { error } = await supabase
        .from('messages')
        .insert(messages);

      if (error) {
        if (this.isTableMissingError(error)) {
          console.warn('⚠️ messages table not yet created');
          return;
        }
        throw error;
      }

      console.log(`📢 Broadcast sent to ${targetFans.length} fans`);
    } catch (error) {
      console.error('Error broadcasting to fans:', error);
    }
  }

  async getMessages(userId: string, limit: number = 50): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('timestamp', { ascending: false })
        .limit(limit);

      if (error) {
        if (this.isTableMissingError(error)) {
          console.warn('⚠️ messages table not yet created');
          return [];
        }
        throw error;
      }
      return data || [];
    } catch (error) {
      console.error('Error getting messages:', error);
      return [];
    }
  }

  // Real-time Updates
  private realTimeListeners: Array<(events: ActivityEvent[]) => void> = [];

  subscribeToRealTimeUpdates(callback: (events: ActivityEvent[]) => void): () => void {
    this.realTimeListeners.push(callback);

    // Set up Supabase real-time subscription
    const subscription = supabase
      .channel('activity_updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'activity_events',
        },
        (payload) => {
          console.log('🔴 Real-time activity update:', payload);
          // Notify all listeners
          this.realTimeListeners.forEach(listener => {
            listener([payload.new as ActivityEvent]);
          });
        }
      )
      .subscribe();

    // Return unsubscribe function
    return () => {
      const index = this.realTimeListeners.indexOf(callback);
      if (index > -1) {
        this.realTimeListeners.splice(index, 1);
      }
      supabase.removeChannel(subscription);
    };
  }

  private notifyRealTimeListeners(events: ActivityEvent[]): void {
    this.realTimeListeners.forEach(listener => {
      try {
        listener(events);
      } catch (error) {
        console.error('Error notifying real-time listener:', error);
      }
    });
  }

  // Utility Methods
  private generateEventId(): string {
    return `event_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  // Activity Summary
  async getActivitySummary(creatorId: string, period: ActivitySummary['period']): Promise<ActivitySummary> {
    try {
      const startDate = this.getPeriodStartDate(period);

      const { data: events, error } = await supabase
        .from('activity_events')
        .select('*')
        .eq('creator_id', creatorId)
        .gte('metadata->timestamp', startDate);

      if (error) {
        if (this.isTableMissingError(error)) {
          console.warn('⚠️ activity_events table not yet created');
          return {
            period,
            total_streams: 0,
            unique_listeners: 0,
            new_fans: 0,
            total_revenue: 0,
            top_content: [],
            geographic_insights: { top_countries: [], new_markets: [] },
            engagement_metrics: { message_responses: 0, fan_retention_rate: 0, average_session_duration: 0 },
          };
        }
        throw error;
      }

      const streamEvents = events?.filter(e => e.event_type === 'stream') || [];
      const uniqueListeners = new Set(streamEvents.map(e => e.user_id));

      // Calculate new fans (first-time listeners in period)
      const existingFans = await this.getExistingFans(creatorId, startDate);
      const newFans = uniqueListeners.size - existingFans.size;

      return {
        period,
        total_streams: streamEvents.length,
        unique_listeners: uniqueListeners.size,
        new_fans: Math.max(newFans, 0),
        total_revenue: this.calculateRevenue(events || []),
        top_content: await this.getTopContent(streamEvents),
        geographic_insights: this.getGeographicInsights(streamEvents),
        engagement_metrics: await this.getEngagementMetrics(creatorId, startDate),
      };
    } catch (error) {
      console.error('Error getting activity summary:', error);
      return {
        period,
        total_streams: 0,
        unique_listeners: 0,
        new_fans: 0,
        total_revenue: 0,
        top_content: [],
        geographic_insights: { top_countries: [], new_markets: [] },
        engagement_metrics: { message_responses: 0, fan_retention_rate: 0, average_session_duration: 0 },
      };
    }
  }

  private getPeriodStartDate(period: ActivitySummary['period']): string {
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    return startDate.toISOString();
  }

  private async getExistingFans(creatorId: string, beforeDate: string): Promise<Set<string>> {
    try {
      const { data, error } = await supabase
        .from('activity_events')
        .select('user_id')
        .eq('creator_id', creatorId)
        .eq('event_type', 'stream')
        .lt('metadata->timestamp', beforeDate);

      if (error) {
        if (this.isTableMissingError(error)) {
          return new Set();
        }
        throw error;
      }
      return new Set((data || []).map(e => e.user_id));
    } catch (error) {
      console.error('Error getting existing fans:', error);
      return new Set();
    }
  }

  private calculateRevenue(events: ActivityEvent[]): number {
    return events
      .filter(e => e.event_type === 'investment')
      .reduce((sum, e) => sum + (e.metadata.amount || 0), 0);
  }

  private async getTopContent(streamEvents: ActivityEvent[]): Promise<ActivitySummary['top_content']> {
    const contentCounts = new Map<string, number>();

    streamEvents.forEach(event => {
      if (event.content_id) {
        contentCounts.set(event.content_id, (contentCounts.get(event.content_id) || 0) + 1);
      }
    });

    // Get content titles (would need to join with content table in production)
    return Array.from(contentCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, streams]) => ({
        id,
        title: `Content ${id.slice(-6)}`, // Mock title
        streams,
      }));
  }

  private getGeographicInsights(streamEvents: ActivityEvent[]): ActivitySummary['geographic_insights'] {
    const countryCounts = new Map<string, number>();

    streamEvents.forEach(event => {
      const country = event.metadata.location.country;
      countryCounts.set(country, (countryCounts.get(country) || 0) + 1);
    });

    const total = streamEvents.length;
    const topCountries = Array.from(countryCounts.entries())
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([country, streams]) => ({
        country,
        streams,
        percentage: Math.round((streams / total) * 100),
      }));

    return {
      top_countries: topCountries,
      new_markets: [], // Would track new countries in this period
    };
  }

  private async getEngagementMetrics(creatorId: string, startDate: string): Promise<ActivitySummary['engagement_metrics']> {
    // Mock implementation - would calculate from real data
    return {
      message_responses: 0,
      fan_retention_rate: 0.8,
      average_session_duration: 180, // 3 minutes
    };
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.isTracking = false;
    await this.processEventQueue(); // Process any remaining events
    this.realTimeListeners = [];
    console.log('🧹 Activity Tracking Service cleanup completed');
  }
}

export const activityTrackingService = new ActivityTrackingService();
export default activityTrackingService;
