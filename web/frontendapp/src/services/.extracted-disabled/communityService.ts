import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';

// ENUMS
export enum PostType {
  ARTIST_DISCOVERY = 'artist_discovery',
  CONTENT_CREATOR = 'content_creator',
  GENERAL_DISCUSSION = 'general_discussion',
  RECOMMENDATION = 'recommendation',
  COLLABORATION = 'collaboration',
  MUSIC_NEWS = 'music_news'
}

export enum PostCategory {
  MUSIC = 'music',
  PODCASTS = 'podcasts',
  STREAMING = 'streaming',
  BEATMAKING = 'beatmaking',
  VOCALS = 'vocals',
  MIXING = 'mixing',
  PROMOTION = 'promotion',
  GEAR = 'gear',
  OTHER = 'other'
}

export enum ReactionType {
  LIKE = 'like',
  LOVE = 'love',
  FIRE = 'fire',
  SUPPORT = 'support',
  DISCOVERY = 'discovery'
}

// INTERFACES
export interface User {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  verification_status: 'verified' | 'unverified' | 'pending';
  follower_count: number;
  is_artist: boolean;
  is_content_creator: boolean;
  joined_date: string;
}

export interface ArtistMention {
  id: string;
  name: string;
  username?: string;
  avatar_url?: string;
  spotify_url?: string;
  apple_music_url?: string;
  soundcloud_url?: string;
  youtube_url?: string;
  instagram_url?: string;
  tiktok_url?: string;
}

export interface MediaAttachment {
  id: string;
  type: 'image' | 'video' | 'audio' | 'link';
  url: string;
  thumbnail_url?: string;
  title?: string;
  description?: string;
  duration?: number; // for audio/video in seconds
}

export interface PostReaction {
  id: string;
  user_id: string;
  username: string;
  avatar_url?: string;
  type: ReactionType;
  created_at: string;
}

export interface CommunityComment {
  id: string;
  post_id: string;
  parent_comment_id?: string; // For threaded replies
  user: User;
  content: string;
  mentioned_artists?: ArtistMention[];
  media_attachments?: MediaAttachment[];
  reactions: PostReaction[];
  reply_count: number;
  created_at: string;
  updated_at?: string;
  is_pinned: boolean;
  is_edited: boolean;
}

export interface CommunityPost {
  id: string;
  user: User;
  type: PostType;
  category: PostCategory;
  title: string;
  content: string;
  featured_artist?: ArtistMention;
  mentioned_artists?: ArtistMention[];
  media_attachments?: MediaAttachment[];
  hashtags: string[];
  reactions: PostReaction[];
  comments: CommunityComment[];
  comment_count: number;
  view_count: number;
  share_count: number;
  created_at: string;
  updated_at?: string;
  is_pinned: boolean;
  is_trending: boolean;
  engagement_score: number;
}

export interface CommunityStats {
  total_posts: number;
  total_comments: number;
  total_users: number;
  daily_active_users: number;
  trending_posts_count: number;
  top_categories: {
    category: PostCategory;
    post_count: number;
  }[];
}

class CommunityService {
  private readonly STORAGE_KEY_POSTS = '@community_posts';
  private readonly STORAGE_KEY_COMMENTS = '@community_comments';
  private readonly STORAGE_KEY_USERS = '@community_users';
  private readonly STORAGE_KEY_STATS = '@community_stats';

  constructor() {
    this.initializeService();
  }

  private async initializeService(): Promise<void> {
    console.log('👥 Community Service initialized');

    // Initialize sample data if none exists
    const existingPosts = await this.getPosts();
    if (existingPosts.length === 0) {
      await this.initializeSampleData();
    }
  }

  // POSTS CRUD
  async createPost(postData: Partial<CommunityPost>): Promise<CommunityPost> {
    try {
      const newPost: CommunityPost = {
        id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        user: postData.user!,
        type: postData.type || PostType.GENERAL_DISCUSSION,
        category: postData.category || PostCategory.MUSIC,
        title: postData.title || '',
        content: postData.content || '',
        featured_artist: postData.featured_artist,
        mentioned_artists: postData.mentioned_artists || [],
        media_attachments: postData.media_attachments || [],
        hashtags: postData.hashtags || [],
        reactions: [],
        comments: [],
        comment_count: 0,
        view_count: 0,
        share_count: 0,
        created_at: new Date().toISOString(),
        is_pinned: false,
        is_trending: false,
        engagement_score: 0
      };

      const posts = await this.getPosts();
      posts.unshift(newPost); // Add to beginning for newest first
      await this.savePosts(posts);

      console.log('📝 Created new community post:', newPost.id);
      return newPost;
    } catch (error) {
      console.error('Failed to create post:', error);
      throw error;
    }
  }

  async getPosts(limit = 20, category?: PostCategory): Promise<CommunityPost[]> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_POSTS);
      let posts: CommunityPost[] = data ? JSON.parse(data) : [];

      if (category) {
        posts = posts.filter(post => post.category === category);
      }

      // Sort by engagement score and recency
      posts.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;

        const scoreA = a.engagement_score + (a.is_trending ? 50 : 0);
        const scoreB = b.engagement_score + (b.is_trending ? 50 : 0);

        if (scoreA !== scoreB) return scoreB - scoreA;

        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      });

      return posts.slice(0, limit);
    } catch (error) {
      console.error('Failed to get posts:', error);
      return [];
    }
  }

  async getPostById(postId: string): Promise<CommunityPost | null> {
    try {
      const posts = await this.getPosts(1000); // Get all posts
      const post = posts.find(p => p.id === postId);

      if (post) {
        // Increment view count
        post.view_count += 1;
        await this.updatePost(post);
      }

      return post || null;
    } catch (error) {
      console.error('Failed to get post:', error);
      return null;
    }
  }

  async updatePost(post: CommunityPost): Promise<CommunityPost> {
    try {
      const posts = await this.getPosts(1000);
      const index = posts.findIndex(p => p.id === post.id);

      if (index !== -1) {
        post.updated_at = new Date().toISOString();
        post.engagement_score = this.calculateEngagementScore(post);
        posts[index] = post;
        await this.savePosts(posts);
      }

      return post;
    } catch (error) {
      console.error('Failed to update post:', error);
      throw error;
    }
  }

  // COMMENTS CRUD
  async addComment(postId: string, commentData: Partial<CommunityComment>): Promise<CommunityComment> {
    try {
      const newComment: CommunityComment = {
        id: `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        post_id: postId,
        parent_comment_id: commentData.parent_comment_id,
        user: commentData.user!,
        content: commentData.content || '',
        mentioned_artists: commentData.mentioned_artists || [],
        media_attachments: commentData.media_attachments || [],
        reactions: [],
        reply_count: 0,
        created_at: new Date().toISOString(),
        is_pinned: false,
        is_edited: false
      };

      // Update parent comment reply count if this is a reply
      if (commentData.parent_comment_id) {
        const comments = await this.getComments(postId);
        const parentComment = comments.find(c => c.id === commentData.parent_comment_id);
        if (parentComment) {
          parentComment.reply_count += 1;
          await this.updateComment(parentComment);
        }
      }

      // Update post comment count
      const post = await this.getPostById(postId);
      if (post) {
        post.comments.push(newComment);
        post.comment_count += 1;
        await this.updatePost(post);
      }

      console.log('💬 Added comment to post:', postId);
      return newComment;
    } catch (error) {
      console.error('Failed to add comment:', error);
      throw error;
    }
  }

  async getComments(postId: string): Promise<CommunityComment[]> {
    try {
      const post = await this.getPostById(postId);
      if (!post) return [];

      // Sort comments: pinned first, then by creation time
      return post.comments.sort((a, b) => {
        if (a.is_pinned && !b.is_pinned) return -1;
        if (!a.is_pinned && b.is_pinned) return 1;
        return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      });
    } catch (error) {
      console.error('Failed to get comments:', error);
      return [];
    }
  }

  async updateComment(comment: CommunityComment): Promise<CommunityComment> {
    try {
      const post = await this.getPostById(comment.post_id);
      if (post) {
        const commentIndex = post.comments.findIndex(c => c.id === comment.id);
        if (commentIndex !== -1) {
          comment.updated_at = new Date().toISOString();
          comment.is_edited = true;
          post.comments[commentIndex] = comment;
          await this.updatePost(post);
        }
      }

      return comment;
    } catch (error) {
      console.error('Failed to update comment:', error);
      throw error;
    }
  }

  // REACTIONS
  async toggleReaction(postId: string, userId: string, username: string, reactionType: ReactionType, isComment = false, commentId?: string): Promise<boolean> {
    try {
      if (isComment && commentId) {
        // Handle comment reactions
        const post = await this.getPostById(postId);
        if (post) {
          const comment = post.comments.find(c => c.id === commentId);
          if (comment) {
            const existingReaction = comment.reactions.find(r => r.user_id === userId);

            if (existingReaction) {
              if (existingReaction.type === reactionType) {
                // Remove reaction
                comment.reactions = comment.reactions.filter(r => r.user_id !== userId);
              } else {
                // Change reaction type
                existingReaction.type = reactionType;
              }
            } else {
              // Add new reaction
              comment.reactions.push({
                id: `reaction_${Date.now()}`,
                user_id: userId,
                username,
                type: reactionType,
                created_at: new Date().toISOString()
              });
            }

            await this.updatePost(post);
            return true;
          }
        }
      } else {
        // Handle post reactions
        const post = await this.getPostById(postId);
        if (post) {
          const existingReaction = post.reactions.find(r => r.user_id === userId);

          if (existingReaction) {
            if (existingReaction.type === reactionType) {
              // Remove reaction
              post.reactions = post.reactions.filter(r => r.user_id !== userId);
            } else {
              // Change reaction type
              existingReaction.type = reactionType;
            }
          } else {
            // Add new reaction
            post.reactions.push({
              id: `reaction_${Date.now()}`,
              user_id: userId,
              username,
              type: reactionType,
              created_at: new Date().toISOString()
            });
          }

          await this.updatePost(post);
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error('Failed to toggle reaction:', error);
      return false;
    }
  }

  // SEARCH AND FILTERING
  async searchPosts(query: string, category?: PostCategory): Promise<CommunityPost[]> {
    try {
      const allPosts = await this.getPosts(1000);
      const searchTerm = query.toLowerCase();

      let filtered = allPosts.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.hashtags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
        post.featured_artist?.name.toLowerCase().includes(searchTerm) ||
        post.mentioned_artists?.some(artist => artist.name.toLowerCase().includes(searchTerm))
      );

      if (category) {
        filtered = filtered.filter(post => post.category === category);
      }

      return filtered;
    } catch (error) {
      console.error('Failed to search posts:', error);
      return [];
    }
  }

  // TRENDING AND DISCOVERY
  async getTrendingPosts(limit = 10): Promise<CommunityPost[]> {
    try {
      const posts = await this.getPosts(1000);

      // Update trending status based on engagement
      posts.forEach(post => {
        post.is_trending = post.engagement_score > 25 &&
          this.getTimeSinceCreation(post.created_at) < 24; // Less than 24 hours old
      });

      return posts
        .filter(post => post.is_trending)
        .slice(0, limit);
    } catch (error) {
      console.error('Failed to get trending posts:', error);
      return [];
    }
  }

  // STATISTICS
  async getCommunityStats(): Promise<CommunityStats> {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY_STATS);

      if (data) {
        return JSON.parse(data);
      }

      // Calculate stats
      const posts = await this.getPosts(1000);
      const totalComments = posts.reduce((sum, post) => sum + post.comment_count, 0);
      const trendingPosts = await this.getTrendingPosts(100);

      const categoryStats = Object.values(PostCategory).map(category => ({
        category,
        post_count: posts.filter(post => post.category === category).length
      }));

      const stats: CommunityStats = {
        total_posts: posts.length,
        total_comments: totalComments,
        total_users: 150, // Mock value
        daily_active_users: 45, // Mock value
        trending_posts_count: trendingPosts.length,
        top_categories: categoryStats
          .sort((a, b) => b.post_count - a.post_count)
          .slice(0, 5)
      };

      await AsyncStorage.setItem(this.STORAGE_KEY_STATS, JSON.stringify(stats));
      return stats;
    } catch (error) {
      console.error('Failed to get community stats:', error);
      return {
        total_posts: 0,
        total_comments: 0,
        total_users: 0,
        daily_active_users: 0,
        trending_posts_count: 0,
        top_categories: []
      };
    }
  }

  // UTILITY METHODS
  private calculateEngagementScore(post: CommunityPost): number {
    const reactionScore = post.reactions.length * 2;
    const commentScore = post.comment_count * 3;
    const viewScore = Math.floor(post.view_count / 10);
    const shareScore = post.share_count * 5;
    const recencyBonus = this.getRecencyBonus(post.created_at);

    return reactionScore + commentScore + viewScore + shareScore + recencyBonus;
  }

  private getRecencyBonus(createdAt: string): number {
    const hoursSinceCreated = this.getTimeSinceCreation(createdAt);
    if (hoursSinceCreated < 1) return 10;
    if (hoursSinceCreated < 6) return 5;
    if (hoursSinceCreated < 24) return 2;
    return 0;
  }

  private getTimeSinceCreation(createdAt: string): number {
    return (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60); // Hours
  }

  private async savePosts(posts: CommunityPost[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY_POSTS, JSON.stringify(posts));
      console.log('💾 Saved community posts');
    } catch (error) {
      console.error('Failed to save posts:', error);
    }
  }

  // DATA MANAGEMENT
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove([
        this.STORAGE_KEY_POSTS,
        this.STORAGE_KEY_COMMENTS,
        this.STORAGE_KEY_USERS,
        this.STORAGE_KEY_STATS
      ]);
      console.log('🗑️ Cleared all community data');
    } catch (error) {
      console.error('Failed to clear community data:', error);
    }
  }

  // SAMPLE DATA INITIALIZATION
  private async initializeSampleData(): Promise<void> {
    const sampleUsers: User[] = [
      {
        id: 'user_1',
        username: 'musiclover_alex',
        display_name: 'Alex Thompson',
        avatar_url: 'https://via.placeholder.com/50/4A90E2/FFFFFF?text=AT',
        verification_status: 'verified',
        follower_count: 1250,
        is_artist: false,
        is_content_creator: true,
        joined_date: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user_2',
        username: 'beatmaker_jay',
        display_name: 'Jay Rivers',
        avatar_url: 'https://via.placeholder.com/50/E24A90/FFFFFF?text=JR',
        verification_status: 'verified',
        follower_count: 890,
        is_artist: true,
        is_content_creator: false,
        joined_date: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'user_3',
        username: 'indie_sarah',
        display_name: 'Sarah Chen',
        avatar_url: 'https://via.placeholder.com/50/50E3C2/FFFFFF?text=SC',
        verification_status: 'unverified',
        follower_count: 340,
        is_artist: true,
        is_content_creator: true,
        joined_date: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];

    const samplePosts: CommunityPost[] = [
      {
        id: 'post_1',
        user: sampleUsers[0],
        type: PostType.ARTIST_DISCOVERY,
        category: PostCategory.MUSIC,
        title: 'Hidden Gem Alert: This indie artist deserves more recognition!',
        content: `Just discovered @clairomusic and I'm absolutely blown away! Her dreamy indie pop sound is exactly what my playlist needed. The production on "Sofia" is chef's kiss 👌\n\nShe's got that lo-fi bedroom pop vibe but with incredible songwriting. Definitely giving me Phoebe Bridgers meets Rex Orange County vibes.\n\nAnyone else discovered any hidden gems lately? Drop them below! 👇`,
        featured_artist: {
          id: 'artist_clairo',
          name: 'Clairo',
          username: '@clairomusic',
          avatar_url: 'https://via.placeholder.com/60/9B4A90/FFFFFF?text=C',
          spotify_url: 'https://spotify.com/artist/clairo',
          instagram_url: 'https://instagram.com/clairo'
        },
        hashtags: ['#indiemusic', '#bedrompop', '#newartist', '#discovery', '#indie'],
        reactions: [
          {
            id: 'react_1',
            user_id: 'user_2',
            username: 'beatmaker_jay',
            type: ReactionType.DISCOVERY,
            created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'react_2',
            user_id: 'user_3',
            username: 'indie_sarah',
            type: ReactionType.LOVE,
            created_at: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        ],
        comments: [
          {
            id: 'comment_1',
            post_id: 'post_1',
            user: sampleUsers[1],
            content: 'YES! Clairo is amazing! Have you checked out her latest album "Charm"? It\'s even better than her previous work 🔥',
            reactions: [
              {
                id: 'comment_react_1',
                user_id: 'user_1',
                username: 'musiclover_alex',
                type: ReactionType.LIKE,
                created_at: new Date(Date.now() - 30 * 60 * 1000).toISOString()
              }
            ],
            reply_count: 1,
            created_at: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
            is_pinned: false,
            is_edited: false
          }
        ],
        comment_count: 1,
        view_count: 45,
        share_count: 3,
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        is_pinned: false,
        is_trending: true,
        engagement_score: 28
      },
      {
        id: 'post_2',
        user: sampleUsers[1],
        type: PostType.COLLABORATION,
        category: PostCategory.BEATMAKING,
        title: 'Looking for a vocalist for my new track!',
        content: `Hey everyone! 🎵 I just finished this dreamy R&B beat and I'm looking for someone with smooth vocals to bring it to life.\n\nThe vibe is very SZA meets Daniel Caesar - laid back, soulful, with some jazz influences. I've got the instrumental done and ready to go.\n\nIf you're a vocalist or know someone who might be interested, hit me up! Always excited to collaborate with new artists. 🎤`,
        mentioned_artists: [
          {
            id: 'artist_sza',
            name: 'SZA',
            username: '@sza'
          },
          {
            id: 'artist_daniel',
            name: 'Daniel Caesar',
            username: '@danielcaesar'
          }
        ],
        media_attachments: [
          {
            id: 'media_1',
            type: 'audio',
            url: 'https://example.com/beat_preview.mp3',
            title: 'R&B Beat Preview',
            duration: 120
          }
        ],
        hashtags: ['#collaboration', '#rnb', '#vocals', '#beatmaker', '#newmusic'],
        reactions: [
          {
            id: 'react_3',
            user_id: 'user_3',
            username: 'indie_sarah',
            type: ReactionType.FIRE,
            created_at: new Date(Date.now() - 45 * 60 * 1000).toISOString()
          }
        ],
        comments: [],
        comment_count: 0,
        view_count: 23,
        share_count: 1,
        created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        is_pinned: false,
        is_trending: false,
        engagement_score: 15
      }
    ];

    await this.savePosts(samplePosts);
    console.log('🎯 Initialized sample community data');
  }
}

export const communityService = new CommunityService();