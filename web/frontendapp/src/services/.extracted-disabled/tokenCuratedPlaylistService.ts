/**
 * Token Curated Playlist Service
 * Comprehensive playlist management with governance, payola, and engagement tracking
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabaseService';
import { creatorTokenService } from './creatorTokenService';
import { activityTrackingService } from './activityTrackingService';
import { UserTrack } from '../hooks/useMusicLibrary';

export interface PlaylistTrack {
  id: string;
  content_id: string;
  track_info: UserTrack;
  position: number;
  added_at: string;
  added_by: string;
  engagement_score: number;
  vote_score: number;
  payola_amount?: number; // Amount paid for inclusion
  payola_tx_id?: string;
  status: 'active' | 'pending_approval' | 'rejected' | 'removed';
}

export interface PlaylistVote {
  id: string;
  playlist_id: string;
  track_id: string;
  voter_id: string;
  vote_type: 'include' | 'exclude' | 'rank_up' | 'rank_down';
  vote_weight: number; // Based on token holdings
  timestamp: string;
  reasoning?: string;
}

export interface PayolaProposal {
  id: string;
  playlist_id: string;
  track_id: string;
  proposer_id: string;
  fee_amount: number; // In BEZY
  message?: string;
  status: 'pending' | 'approved' | 'rejected' | 'escrowed';
  escrow_tx_id?: string;
  created_at: string;
  voting_deadline: string;
}

export interface PlaylistGovernance {
  voting_enabled: boolean;
  payola_enabled: boolean;
  min_vote_threshold: number; // Minimum votes needed for action
  voting_period_hours: number;
  inclusion_fee: number; // Base fee for payola inclusion
  token_weight_enabled: boolean; // Whether token holdings affect vote weight
  curator_override: boolean; // Whether curator can override votes
  auto_ranking: boolean; // Whether engagement affects position automatically
}

export interface TokenCuratedPlaylist {
  id: string;
  name: string;
  description: string;
  creator_id: string;
  type: 'personal' | 'token_curated' | 'community_governed' | 'payola_enabled';
  is_public: boolean;
  governance: PlaylistGovernance;
  tracks: PlaylistTrack[];
  token_requirements?: {
    required_tokens: string[]; // Token IDs required for voting
    minimum_holding: number; // Minimum token amount for participation
  };
  engagement_metrics: {
    total_plays: number;
    unique_listeners: number;
    skip_rate: number;
    average_completion: number;
    last_updated: string;
  };
  revenue_sharing: {
    curator_percentage: number;
    voter_percentage: number;
    creator_percentage: number;
  };
  created_at: string;
  updated_at: string;
}

export interface VotingPower {
  user_id: string;
  base_votes: number;
  token_multiplier: number;
  total_voting_power: number;
  held_tokens: Array<{
    token_id: string;
    amount: number;
    weight: number;
  }>;
}

export interface PlaylistRankingUpdate {
  playlist_id: string;
  track_id: string;
  old_position: number;
  new_position: number;
  reason: 'votes' | 'engagement' | 'curator_action' | 'payola';
  timestamp: string;
}

class TokenCuratedPlaylistService {
  private eventListeners: Map<string, Function[]> = new Map();

  constructor() {
    console.log('🎵 Token Curated Playlist Service initialized');
  }

  // Playlist Management
  async createPlaylist(
    creatorId: string,
    name: string,
    type: TokenCuratedPlaylist['type'],
    governance?: Partial<PlaylistGovernance>
  ): Promise<TokenCuratedPlaylist> {
    const defaultGovernance: PlaylistGovernance = {
      voting_enabled: type === 'community_governed',
      payola_enabled: type === 'payola_enabled',
      min_vote_threshold: 5,
      voting_period_hours: 24,
      inclusion_fee: 10, // 10 BEZY default
      token_weight_enabled: true,
      curator_override: true,
      auto_ranking: true,
    };

    const playlist: TokenCuratedPlaylist = {
      id: this.generatePlaylistId(),
      name,
      description: '',
      creator_id: creatorId,
      type,
      is_public: type !== 'personal',
      governance: { ...defaultGovernance, ...governance },
      tracks: [],
      engagement_metrics: {
        total_plays: 0,
        unique_listeners: 0,
        skip_rate: 0,
        average_completion: 0,
        last_updated: new Date().toISOString(),
      },
      revenue_sharing: {
        curator_percentage: 40,
        voter_percentage: 30,
        creator_percentage: 30,
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      await this.savePlaylistToDatabase(playlist);
      console.log('✅ Playlist created:', name, type);
      return playlist;
    } catch (error) {
      console.error('Error creating playlist:', error);
      throw error;
    }
  }

  async getUserPlaylists(userId: string): Promise<TokenCuratedPlaylist[]> {
    try {
      const stored = await this.getStoredPlaylists();
      return stored.filter(p => p.creator_id === userId);
    } catch (error) {
      console.error('Error getting user playlists:', error);
      return [];
    }
  }

  async getPublicPlaylists(limit: number = 20): Promise<TokenCuratedPlaylist[]> {
    try {
      const stored = await this.getStoredPlaylists();
      return stored
        .filter(p => p.is_public)
        .sort((a, b) => b.engagement_metrics.total_plays - a.engagement_metrics.total_plays)
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting public playlists:', error);
      return [];
    }
  }

  // Track Management
  async addTrackToPlaylist(
    playlistId: string,
    trackInfo: UserTrack,
    addedBy: string,
    payolaAmount?: number
  ): Promise<void> {
    try {
      const playlist = await this.getPlaylistById(playlistId);
      if (!playlist) throw new Error('Playlist not found');

      // Check permissions
      if (!this.canAddTrack(playlist, addedBy)) {
        throw new Error('Insufficient permissions to add tracks');
      }

      // Handle payola payment if applicable
      let payolaTxId: string | undefined;
      if (payolaAmount && payolaAmount > 0) {
        payolaTxId = await this.processPayolaPayment(playlistId, addedBy, payolaAmount);
      }

      const newTrack: PlaylistTrack = {
        id: this.generateTrackId(),
        content_id: trackInfo.id,
        track_info: trackInfo,
        position: playlist.tracks.length + 1,
        added_at: new Date().toISOString(),
        added_by: addedBy,
        engagement_score: 0,
        vote_score: 0,
        payola_amount: payolaAmount,
        payola_tx_id: payolaTxId,
        status: playlist.governance.voting_enabled ? 'pending_approval' : 'active',
      };

      playlist.tracks.push(newTrack);
      playlist.updated_at = new Date().toISOString();

      await this.savePlaylistToDatabase(playlist);

      // Start voting process if needed
      if (playlist.governance.voting_enabled) {
        await this.initiateVotingProcess(playlistId, newTrack.id);
      }

      console.log('📈 Track added to playlist:', trackInfo.title);
    } catch (error) {
      console.error('Error adding track to playlist:', error);
      throw error;
    }
  }

  async removeTrackFromPlaylist(
    playlistId: string,
    trackId: string,
    removedBy: string
  ): Promise<void> {
    try {
      const playlist = await this.getPlaylistById(playlistId);
      if (!playlist) throw new Error('Playlist not found');

      if (!this.canRemoveTrack(playlist, removedBy)) {
        throw new Error('Insufficient permissions to remove tracks');
      }

      playlist.tracks = playlist.tracks.filter(t => t.id !== trackId);

      // Reorder positions
      playlist.tracks.forEach((track, index) => {
        track.position = index + 1;
      });

      playlist.updated_at = new Date().toISOString();
      await this.savePlaylistToDatabase(playlist);

      console.log('🗑️ Track removed from playlist');
    } catch (error) {
      console.error('Error removing track from playlist:', error);
      throw error;
    }
  }

  // Voting System
  async submitVote(
    playlistId: string,
    trackId: string,
    voterId: string,
    voteType: PlaylistVote['vote_type'],
    reasoning?: string
  ): Promise<void> {
    try {
      const [playlist, votingPower] = await Promise.all([
        this.getPlaylistById(playlistId),
        this.calculateVotingPower(voterId, playlistId)
      ]);

      if (!playlist) throw new Error('Playlist not found');
      if (votingPower.total_voting_power === 0) {
        throw new Error('Insufficient voting power');
      }

      const vote: PlaylistVote = {
        id: this.generateVoteId(),
        playlist_id: playlistId,
        track_id: trackId,
        voter_id: voterId,
        vote_type: voteType,
        vote_weight: votingPower.total_voting_power,
        timestamp: new Date().toISOString(),
        reasoning,
      };

      // Store vote
      await this.storeVote(vote);

      // Process vote immediately
      await this.processVoteResult(vote);

      console.log('🗳️ Vote submitted:', voteType, vote.vote_weight);
    } catch (error) {
      console.error('Error submitting vote:', error);
      throw error;
    }
  }

  async calculateVotingPower(userId: string, playlistId: string): Promise<VotingPower> {
    try {
      const playlist = await this.getPlaylistById(playlistId);
      if (!playlist) throw new Error('Playlist not found');

      let baseVotes = 1;
      let tokenMultiplier = 1;
      const heldTokens: VotingPower['held_tokens'] = [];

      if (playlist.governance.token_weight_enabled && playlist.token_requirements) {
        // Get user's token holdings
        const userTokens = await creatorTokenService.getUserTokens(userId);

        for (const requiredTokenId of playlist.token_requirements.required_tokens) {
          const holding = userTokens.find(t => t.id === requiredTokenId);
          if (holding) {
            const tokenWeight = Math.min(holding.total_supply * 0.01, 10); // Cap at 10x
            heldTokens.push({
              token_id: requiredTokenId,
              amount: holding.total_supply,
              weight: tokenWeight,
            });
            tokenMultiplier += tokenWeight;
          }
        }

        // Check minimum holding requirement
        const totalHolding = heldTokens.reduce((sum, t) => sum + t.amount, 0);
        if (totalHolding < (playlist.token_requirements.minimum_holding || 0)) {
          baseVotes = 0;
        }
      }

      return {
        user_id: userId,
        base_votes: baseVotes,
        token_multiplier: tokenMultiplier,
        total_voting_power: baseVotes * tokenMultiplier,
        held_tokens: heldTokens,
      };
    } catch (error) {
      console.error('Error calculating voting power:', error);
      return {
        user_id: userId,
        base_votes: 0,
        token_multiplier: 0,
        total_voting_power: 0,
        held_tokens: [],
      };
    }
  }

  private async processVoteResult(vote: PlaylistVote): Promise<void> {
    try {
      const playlist = await this.getPlaylistById(vote.playlist_id);
      if (!playlist) return;

      const track = playlist.tracks.find(t => t.id === vote.track_id);
      if (!track) return;

      // Get all votes for this track
      const allVotes = await this.getVotesForTrack(vote.track_id);

      // Calculate vote scores
      const includeVotes = allVotes
        .filter(v => v.vote_type === 'include')
        .reduce((sum, v) => sum + v.vote_weight, 0);

      const excludeVotes = allVotes
        .filter(v => v.vote_type === 'exclude')
        .reduce((sum, v) => sum + v.vote_weight, 0);

      const rankUpVotes = allVotes
        .filter(v => v.vote_type === 'rank_up')
        .reduce((sum, v) => sum + v.vote_weight, 0);

      const rankDownVotes = allVotes
        .filter(v => v.vote_type === 'rank_down')
        .reduce((sum, v) => sum + v.vote_weight, 0);

      // Update track vote score
      track.vote_score = includeVotes - excludeVotes + (rankUpVotes - rankDownVotes) * 0.5;

      // Check if threshold met for inclusion/exclusion
      const totalVotes = includeVotes + excludeVotes;
      if (totalVotes >= playlist.governance.min_vote_threshold) {
        if (includeVotes > excludeVotes) {
          track.status = 'active';
        } else {
          track.status = 'rejected';
        }
      }

      // Update playlist ranking if auto-ranking enabled
      if (playlist.governance.auto_ranking) {
        await this.updatePlaylistRankings(playlist.id);
      }

      await this.savePlaylistToDatabase(playlist);
    } catch (error) {
      console.error('Error processing vote result:', error);
    }
  }

  // Payola System
  async submitPayolaProposal(
    playlistId: string,
    trackId: string,
    proposerId: string,
    feeAmount: number,
    message?: string
  ): Promise<PayolaProposal> {
    try {
      const playlist = await this.getPlaylistById(playlistId);
      if (!playlist) throw new Error('Playlist not found');

      if (!playlist.governance.payola_enabled) {
        throw new Error('Payola not enabled for this playlist');
      }

      if (feeAmount < playlist.governance.inclusion_fee) {
        throw new Error(`Minimum fee is ${playlist.governance.inclusion_fee} BEZY`);
      }

      const proposal: PayolaProposal = {
        id: this.generateProposalId(),
        playlist_id: playlistId,
        track_id: trackId,
        proposer_id: proposerId,
        fee_amount: feeAmount,
        message,
        status: 'pending',
        created_at: new Date().toISOString(),
        voting_deadline: new Date(Date.now() + playlist.governance.voting_period_hours * 60 * 60 * 1000).toISOString(),
      };

      await this.storePayolaProposal(proposal);

      console.log('💰 Payola proposal submitted:', feeAmount, 'BEZY');
      return proposal;
    } catch (error) {
      console.error('Error submitting payola proposal:', error);
      throw error;
    }
  }

  private async processPayolaPayment(
    playlistId: string,
    payerId: string,
    amount: number
  ): Promise<string> {
    try {
      // Escrow the payment
      const escrowTxId = await this.escrowPayment(payerId, amount);

      // Get playlist for revenue sharing
      const playlist = await this.getPlaylistById(playlistId);
      if (playlist) {
        const curatorShare = amount * (playlist.revenue_sharing.curator_percentage / 100);
        const voterShare = amount * (playlist.revenue_sharing.voter_percentage / 100);
        const creatorShare = amount * (playlist.revenue_sharing.creator_percentage / 100);

        // Distribute payments
        await this.distributePayment(playlist.creator_id, curatorShare, 'curator_revenue');
        // Voter rewards would be distributed after successful inclusion
      }

      return escrowTxId;
    } catch (error) {
      console.error('Error processing payola payment:', error);
      throw error;
    }
  }

  private async escrowPayment(payerId: string, amount: number): Promise<string> {
    // Mock implementation - would integrate with actual payment system
    return `escrow_${Date.now()}_${payerId}`;
  }

  private async distributePayment(
    recipientId: string,
    amount: number,
    type: string
  ): Promise<void> {
    // Mock implementation - would integrate with token transfer system
    console.log(`💸 Distributing ${amount} BEZY to ${recipientId} for ${type}`);
  }

  // Engagement Tracking
  async trackPlaylistEngagement(
    playlistId: string,
    trackId: string,
    userId: string,
    engagementType: 'play' | 'skip' | 'complete',
    metadata?: any
  ): Promise<void> {
    try {
      // Track with activity service
      await activityTrackingService.trackEvent(
        userId,
        playlistId,
        'engagement',
        `playlist_${engagementType}`,
        {
          content_id: trackId,
          metadata: {
            playlist_id: playlistId,
            track_id: trackId,
            ...metadata,
          }
        }
      );

      // Update playlist engagement metrics
      await this.updateEngagementMetrics(playlistId, trackId, engagementType);

      // Update track engagement score
      await this.updateTrackEngagementScore(playlistId, trackId);
    } catch (error) {
      console.error('Error tracking playlist engagement:', error);
    }
  }

  private async updateEngagementMetrics(
    playlistId: string,
    trackId: string,
    engagementType: string
  ): Promise<void> {
    try {
      const playlist = await this.getPlaylistById(playlistId);
      if (!playlist) return;

      switch (engagementType) {
        case 'play':
          playlist.engagement_metrics.total_plays++;
          break;
        case 'skip':
          // Skip rate calculation would be more complex in production
          break;
        case 'complete':
          // Completion rate calculation
          break;
      }

      playlist.engagement_metrics.last_updated = new Date().toISOString();
      await this.savePlaylistToDatabase(playlist);
    } catch (error) {
      console.error('Error updating engagement metrics:', error);
    }
  }

  private async updateTrackEngagementScore(
    playlistId: string,
    trackId: string
  ): Promise<void> {
    try {
      const playlist = await this.getPlaylistById(playlistId);
      if (!playlist) return;

      const track = playlist.tracks.find(t => t.id === trackId);
      if (!track) return;

      // Calculate engagement score based on plays, completion, etc.
      // This would be much more sophisticated in production
      const baseScore = Math.random() * 100; // Mock calculation
      track.engagement_score = Math.min(baseScore + track.vote_score, 100);

      await this.savePlaylistToDatabase(playlist);
    } catch (error) {
      console.error('Error updating track engagement score:', error);
    }
  }

  // Dynamic Ranking (Billboard-style)
  async updatePlaylistRankings(playlistId: string): Promise<PlaylistRankingUpdate[]> {
    try {
      const playlist = await this.getPlaylistById(playlistId);
      if (!playlist) return [];

      const updates: PlaylistRankingUpdate[] = [];

      // Sort tracks by combined score (votes + engagement)
      const sortedTracks = [...playlist.tracks]
        .filter(track => track.status === 'active')
        .sort((a, b) => {
          const scoreA = a.vote_score + (a.engagement_score * 0.3); // 30% weight for engagement
          const scoreB = b.vote_score + (b.engagement_score * 0.3);
          return scoreB - scoreA;
        });

      // Update positions and track changes
      sortedTracks.forEach((track, newIndex) => {
        const newPosition = newIndex + 1;
        if (track.position !== newPosition) {
          updates.push({
            playlist_id: playlistId,
            track_id: track.id,
            old_position: track.position,
            new_position: newPosition,
            reason: 'votes', // Could be more specific
            timestamp: new Date().toISOString(),
          });
          track.position = newPosition;
        }
      });

      if (updates.length > 0) {
        playlist.updated_at = new Date().toISOString();
        await this.savePlaylistToDatabase(playlist);

        // Store ranking updates for history
        await this.storeRankingUpdates(updates);

        console.log(`📊 Updated ${updates.length} playlist positions`);
      }

      return updates;
    } catch (error) {
      console.error('Error updating playlist rankings:', error);
      return [];
    }
  }

  // Governance Analytics
  async getPlaylistGovernanceStats(playlistId: string): Promise<{
    total_votes: number;
    active_voters: number;
    average_vote_weight: number;
    voting_participation: number;
    payola_revenue: number;
    governance_health_score: number;
  }> {
    try {
      const votes = await this.getVotesForPlaylist(playlistId);
      const uniqueVoters = new Set(votes.map(v => v.voter_id));
      const totalWeight = votes.reduce((sum, v) => sum + v.vote_weight, 0);

      // Mock calculations - would be more sophisticated in production
      return {
        total_votes: votes.length,
        active_voters: uniqueVoters.size,
        average_vote_weight: votes.length > 0 ? totalWeight / votes.length : 0,
        voting_participation: 0.75, // Mock participation rate
        payola_revenue: 150.5, // Mock revenue
        governance_health_score: 85, // Mock health score
      };
    } catch (error) {
      console.error('Error getting governance stats:', error);
      return {
        total_votes: 0,
        active_voters: 0,
        average_vote_weight: 0,
        voting_participation: 0,
        payola_revenue: 0,
        governance_health_score: 0,
      };
    }
  }

  // Permission Checks
  private canAddTrack(playlist: TokenCuratedPlaylist, userId: string): boolean {
    if (playlist.creator_id === userId) return true;
    if (playlist.type === 'personal') return false;
    if (playlist.governance.payola_enabled) return true;
    return playlist.type === 'community_governed';
  }

  private canRemoveTrack(playlist: TokenCuratedPlaylist, userId: string): boolean {
    if (playlist.creator_id === userId) return true;
    return playlist.governance.curator_override;
  }

  // Data Storage Methods
  private async savePlaylistToDatabase(playlist: TokenCuratedPlaylist): Promise<void> {
    try {
      const playlists = await this.getStoredPlaylists();
      const index = playlists.findIndex(p => p.id === playlist.id);

      if (index >= 0) {
        playlists[index] = playlist;
      } else {
        playlists.push(playlist);
      }

      await AsyncStorage.setItem('token_curated_playlists', JSON.stringify(playlists));
    } catch (error) {
      console.error('Error saving playlist:', error);
      throw error;
    }
  }

  private async getStoredPlaylists(): Promise<TokenCuratedPlaylist[]> {
    try {
      const stored = await AsyncStorage.getItem('token_curated_playlists');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async getPlaylistById(id: string): Promise<TokenCuratedPlaylist | null> {
    const playlists = await this.getStoredPlaylists();
    return playlists.find(p => p.id === id) || null;
  }

  private async storeVote(vote: PlaylistVote): Promise<void> {
    try {
      const votes = await this.getStoredVotes();
      votes.push(vote);
      await AsyncStorage.setItem('playlist_votes', JSON.stringify(votes));
    } catch (error) {
      console.error('Error storing vote:', error);
    }
  }

  private async getStoredVotes(): Promise<PlaylistVote[]> {
    try {
      const stored = await AsyncStorage.getItem('playlist_votes');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async getVotesForTrack(trackId: string): Promise<PlaylistVote[]> {
    const votes = await this.getStoredVotes();
    return votes.filter(v => v.track_id === trackId);
  }

  private async getVotesForPlaylist(playlistId: string): Promise<PlaylistVote[]> {
    const votes = await this.getStoredVotes();
    return votes.filter(v => v.playlist_id === playlistId);
  }

  private async storePayolaProposal(proposal: PayolaProposal): Promise<void> {
    try {
      const proposals = await this.getStoredPayolaProposals();
      proposals.push(proposal);
      await AsyncStorage.setItem('payola_proposals', JSON.stringify(proposals));
    } catch (error) {
      console.error('Error storing payola proposal:', error);
    }
  }

  private async getStoredPayolaProposals(): Promise<PayolaProposal[]> {
    try {
      const stored = await AsyncStorage.getItem('payola_proposals');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async storeRankingUpdates(updates: PlaylistRankingUpdate[]): Promise<void> {
    try {
      const allUpdates = await this.getStoredRankingUpdates();
      allUpdates.push(...updates);
      await AsyncStorage.setItem('playlist_ranking_updates', JSON.stringify(allUpdates));
    } catch (error) {
      console.error('Error storing ranking updates:', error);
    }
  }

  private async getStoredRankingUpdates(): Promise<PlaylistRankingUpdate[]> {
    try {
      const stored = await AsyncStorage.getItem('playlist_ranking_updates');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  private async initiateVotingProcess(playlistId: string, trackId: string): Promise<void> {
    // In production, this would set up scheduled tasks for voting deadlines
    console.log(`🗳️ Voting initiated for track ${trackId} in playlist ${playlistId}`);
  }

  // Utility Methods
  private generatePlaylistId(): string {
    return `playlist_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateTrackId(): string {
    return `ptrack_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateVoteId(): string {
    return `vote_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private generateProposalId(): string {
    return `proposal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  // Cleanup
  async cleanup(): Promise<void> {
    this.eventListeners.clear();
    console.log('🧹 Token Curated Playlist Service cleanup completed');
  }
}

export const tokenCuratedPlaylistService = new TokenCuratedPlaylistService();
export default tokenCuratedPlaylistService;