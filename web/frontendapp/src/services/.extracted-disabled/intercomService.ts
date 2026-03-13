import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface IntercomUser {
  user_id: string;
  email?: string;
  name?: string;
  phone?: string;
  custom_attributes?: {
    app_version?: string;
    platform?: string;
    user_type?: string;
    subscription_status?: string;
    bezy_balance?: number;
  };
}

interface SupportConversation {
  id: string;
  title: string;
  status: 'open' | 'closed' | 'pending';
  last_message: string;
  last_updated: string;
  created_at: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  tags: string[];
  messages: SupportMessage[];
}

interface SupportMessage {
  id: string;
  conversation_id: string;
  author: {
    type: 'user' | 'admin';
    name: string;
    avatar?: string;
  };
  message: string;
  timestamp: string;
  attachments?: string[];
  message_type: 'text' | 'image' | 'file';
}

interface TechnicalIssue {
  id: string;
  category: 'app_crash' | 'payment_failed' | 'connection_issue' | 'feature_bug' | 'performance' | 'other';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  description: string;
  steps_to_reproduce?: string;
  device_info: {
    platform: string;
    os_version: string;
    app_version: string;
    device_model?: string;
  };
  user_id: string;
  status: 'reported' | 'investigating' | 'in_progress' | 'resolved' | 'closed';
  created_at: string;
  resolved_at?: string;
}

class IntercomService {
  private static instance: IntercomService;
  private isInitialized: boolean = false;
  private apiKey: string = 'ic-test-soundmoney-technical-support'; // Demo API key
  private currentUser: IntercomUser | null = null;

  private constructor() {}

  static getInstance(): IntercomService {
    if (!IntercomService.instance) {
      IntercomService.instance = new IntercomService();
    }
    return IntercomService.instance;
  }

  async initialize(appId: string): Promise<boolean> {
    try {
      this.isInitialized = true;
      console.log('Intercom initialized successfully');
      return true;
    } catch (error) {
      console.error('Failed to initialize Intercom:', error);
      return false;
    }
  }

  async registerUser(user: IntercomUser): Promise<boolean> {
    try {
      this.currentUser = user;

      const userData = {
        ...user,
        custom_attributes: {
          ...user.custom_attributes,
          platform: Platform.OS,
          app_version: '1.0.0',
        }
      };

      await AsyncStorage.setItem('intercom_user', JSON.stringify(userData));
      console.log('User registered with Intercom:', userData.user_id);

      return true;
    } catch (error) {
      console.error('Failed to register user with Intercom:', error);
      return false;
    }
  }

  async startConversation(initialMessage?: string): Promise<string | null> {
    try {
      if (!this.currentUser) {
        throw new Error('User not registered');
      }

      const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const conversation: SupportConversation = {
        id: conversationId,
        title: 'Technical Support Request',
        status: 'open',
        last_message: initialMessage || 'Started conversation with technical support',
        last_updated: new Date().toISOString(),
        created_at: new Date().toISOString(),
        priority: 'normal',
        tags: ['technical_support', 'mobile_app'],
        messages: []
      };

      if (initialMessage) {
        const message: SupportMessage = {
          id: `msg_${Date.now()}`,
          conversation_id: conversationId,
          author: {
            type: 'user',
            name: this.currentUser.name || 'User',
          },
          message: initialMessage,
          timestamp: new Date().toISOString(),
          message_type: 'text'
        };
        conversation.messages.push(message);
      }

      await this.saveConversation(conversation);

      return conversationId;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      return null;
    }
  }

  async sendMessage(conversationId: string, message: string, attachments?: string[]): Promise<boolean> {
    try {
      if (!this.currentUser) {
        throw new Error('User not registered');
      }

      const newMessage: SupportMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        conversation_id: conversationId,
        author: {
          type: 'user',
          name: this.currentUser.name || 'User',
        },
        message,
        timestamp: new Date().toISOString(),
        attachments,
        message_type: attachments && attachments.length > 0 ? 'file' : 'text'
      };

      const conversation = await this.getConversation(conversationId);
      if (conversation) {
        conversation.messages.push(newMessage);
        conversation.last_message = message;
        conversation.last_updated = new Date().toISOString();
        await this.saveConversation(conversation);
      }

      // Simulate admin response after a delay
      setTimeout(() => this.simulateAdminResponse(conversationId), 2000);

      return true;
    } catch (error) {
      console.error('Failed to send message:', error);
      return false;
    }
  }

  private async simulateAdminResponse(conversationId: string): Promise<void> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (!conversation) return;

      const adminResponses = [
        'Thanks for reaching out! I\'m looking into your issue now.',
        'I understand your concern. Let me check our system for any known issues.',
        'Could you please provide more details about when this issue started?',
        'I\'ve escalated this to our technical team. You should hear back within 24 hours.',
        'This looks like a known issue. I\'m applying a fix to your account now.',
        'Thanks for the additional information. I\'ll investigate this further and get back to you.',
      ];

      const randomResponse = adminResponses[Math.floor(Math.random() * adminResponses.length)];

      const adminMessage: SupportMessage = {
        id: `msg_${Date.now()}_admin`,
        conversation_id: conversationId,
        author: {
          type: 'admin',
          name: 'Alex - Technical Support',
          avatar: '👨‍💻'
        },
        message: randomResponse,
        timestamp: new Date().toISOString(),
        message_type: 'text'
      };

      conversation.messages.push(adminMessage);
      conversation.last_message = randomResponse;
      conversation.last_updated = new Date().toISOString();

      await this.saveConversation(conversation);
    } catch (error) {
      console.error('Failed to simulate admin response:', error);
    }
  }

  async getConversations(): Promise<SupportConversation[]> {
    try {
      const conversations = await AsyncStorage.getItem('intercom_conversations');
      return conversations ? JSON.parse(conversations) : [];
    } catch (error) {
      console.error('Failed to get conversations:', error);
      return [];
    }
  }

  async getConversation(conversationId: string): Promise<SupportConversation | null> {
    try {
      const conversations = await this.getConversations();
      return conversations.find(conv => conv.id === conversationId) || null;
    } catch (error) {
      console.error('Failed to get conversation:', error);
      return null;
    }
  }

  private async saveConversation(conversation: SupportConversation): Promise<void> {
    try {
      const conversations = await this.getConversations();
      const existingIndex = conversations.findIndex(conv => conv.id === conversation.id);

      if (existingIndex >= 0) {
        conversations[existingIndex] = conversation;
      } else {
        conversations.push(conversation);
      }

      await AsyncStorage.setItem('intercom_conversations', JSON.stringify(conversations));
    } catch (error) {
      console.error('Failed to save conversation:', error);
    }
  }

  async reportTechnicalIssue(issue: Omit<TechnicalIssue, 'id' | 'created_at' | 'status' | 'device_info'>): Promise<string | null> {
    try {
      const issueId = `issue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const technicalIssue: TechnicalIssue = {
        ...issue,
        id: issueId,
        created_at: new Date().toISOString(),
        status: 'reported',
        device_info: {
          platform: Platform.OS,
          os_version: Platform.Version.toString(),
          app_version: '1.0.0',
          device_model: Platform.OS === 'ios' ? 'iPhone' : 'Android Device'
        }
      };

      // Save the issue
      const issues = await this.getTechnicalIssues();
      issues.push(technicalIssue);
      await AsyncStorage.setItem('technical_issues', JSON.stringify(issues));

      // Create a conversation for this issue
      const conversationId = await this.startConversation(
        `Technical Issue Reported: ${issue.description}\n\nCategory: ${issue.category}\nPriority: ${issue.priority}\n\nSteps to reproduce: ${issue.steps_to_reproduce || 'Not provided'}`
      );

      return conversationId;
    } catch (error) {
      console.error('Failed to report technical issue:', error);
      return null;
    }
  }

  async getTechnicalIssues(): Promise<TechnicalIssue[]> {
    try {
      const issues = await AsyncStorage.getItem('technical_issues');
      return issues ? JSON.parse(issues) : [];
    } catch (error) {
      console.error('Failed to get technical issues:', error);
      return [];
    }
  }

  async closeConversation(conversationId: string): Promise<boolean> {
    try {
      const conversation = await this.getConversation(conversationId);
      if (conversation) {
        conversation.status = 'closed';
        conversation.last_updated = new Date().toISOString();
        await this.saveConversation(conversation);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Failed to close conversation:', error);
      return false;
    }
  }

  async showMessenger(): Promise<boolean> {
    try {
      // In a real implementation, this would show the Intercom messenger
      console.log('Opening Intercom messenger...');
      return true;
    } catch (error) {
      console.error('Failed to show messenger:', error);
      return false;
    }
  }

  async setUserAttribute(key: string, value: any): Promise<boolean> {
    try {
      if (!this.currentUser) return false;

      this.currentUser.custom_attributes = {
        ...this.currentUser.custom_attributes,
        [key]: value
      };

      await AsyncStorage.setItem('intercom_user', JSON.stringify(this.currentUser));
      return true;
    } catch (error) {
      console.error('Failed to set user attribute:', error);
      return false;
    }
  }

  async logEvent(eventName: string, metadata?: Record<string, any>): Promise<boolean> {
    try {
      const event = {
        name: eventName,
        metadata,
        timestamp: new Date().toISOString(),
        user_id: this.currentUser?.user_id
      };

      console.log('Logged Intercom event:', event);
      return true;
    } catch (error) {
      console.error('Failed to log event:', error);
      return false;
    }
  }

  getCurrentUser(): IntercomUser | null {
    return this.currentUser;
  }

  isUserRegistered(): boolean {
    return this.currentUser !== null;
  }
}

export default IntercomService.getInstance();
export type { IntercomUser, SupportConversation, SupportMessage, TechnicalIssue };