// Supabase service for API calls
// This will connect to the shared SoundMoney Supabase instance

export interface SupabaseConfig {
  url: string;
  key: string;
}

const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.REACT_APP_SUPABASE_KEY || '';

export class SupabaseService {
  private static instance: SupabaseService;
  private baseUrl: string;
  private apiKey: string;

  private constructor() {
    this.baseUrl = SUPABASE_URL;
    this.apiKey = SUPABASE_KEY;

    if (!this.baseUrl || !this.apiKey) {
      console.warn('Supabase credentials not configured');
    }
  }

  static getInstance(): SupabaseService {
    if (!SupabaseService.instance) {
      SupabaseService.instance = new SupabaseService();
    }
    return SupabaseService.instance;
  }

  private async request<T>(
    endpoint: string,
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
    body?: any
  ): Promise<T> {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
      'Authorization': `Bearer ${this.apiKey}`,
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
      throw new Error(`Supabase request failed: ${response.statusText}`);
    }

    return response.json();
  }

  // User methods
  async getUserProfile(userId: string) {
    return this.request(`/rest/v1/users?id=eq.${userId}`);
  }

  async updateUserProfile(userId: string, data: any) {
    return this.request(`/rest/v1/users?id=eq.${userId}`, 'PUT', data);
  }

  // Posts/Content methods
  async getPostsByUser(userId: string, limit = 20, offset = 0) {
    return this.request(
      `/rest/v1/posts?user_id=eq.${userId}&limit=${limit}&offset=${offset}`
    );
  }

  async createPost(data: any) {
    return this.request('/rest/v1/posts', 'POST', data);
  }

  // Comments methods
  async getPostComments(postId: string) {
    return this.request(`/rest/v1/comments?post_id=eq.${postId}`);
  }

  async addComment(data: any) {
    return this.request('/rest/v1/comments', 'POST', data);
  }

  // Engagement methods
  async likePost(postId: string, userId: string) {
    return this.request('/rest/v1/likes', 'POST', {
      post_id: postId,
      user_id: userId,
    });
  }

  async unlikePost(postId: string, userId: string) {
    return this.request(
      `/rest/v1/likes?post_id=eq.${postId}&user_id=eq.${userId}`,
      'DELETE'
    );
  }
}

export default SupabaseService.getInstance();
