/**
 * Realms Governance Service
 * High-level service for managing SPL Governance operations
 * Uses governance-idl-sdk for direct on-chain queries
 */

import { realmsSDKService } from './realmsSDKService';
import { realmsAPIService } from './realmsAPIService';

export interface GovernanceDAO {
  realmPk: string;
  name: string;
  description?: string;
  authority: string;
  tokenMint: string;
  communityToken: string;
  votingProposalCount: number;
  logoUrl?: string;
  websiteUrl?: string;
  source: 'api' | 'sdk' | 'onchain';
}

export interface GovernanceProposal {
  proposalPk: string;
  realmPk: string;
  name: string;
  description: string;
  proposer: string;
  state: string;
  startTime: number;
  votingEndTime: number;
  voteStats: {
    yes: number;
    no: number;
    abstain: number;
    total: number;
  };
  timeRemaining: number; // milliseconds
  isActive: boolean;
  source: 'api' | 'sdk';
}

export interface UserGovernanceStats {
  walletAddress: string;
  votingPower: number;
  proposalsCreated: number;
  proposalsVotedOn: number;
  delegatingTo?: string;
  delegatedTokens: number;
  source: 'api' | 'sdk';
}

class RealmsGovernanceService {
  private useAPI = false;
  private useSDK = false;

  /**
   * Initialize with either API key or SDK
   * Prefers SDK if RPC is available, falls back to API if key available
   */
  initialize(options?: {
    apiKey?: string;
    apiBaseUrl?: string;
    rpcUrl?: string;
    governanceProgramId?: string;
  }) {
    // Try to initialize SDK with RPC
    const rpcUrl = options?.rpcUrl || process.env.EXPO_PUBLIC_SOLANA_RPC;
    if (rpcUrl && rpcUrl !== 'your_rpc_url_here') {
      try {
        realmsSDKService.initialize(rpcUrl, options?.governanceProgramId);
        this.useSDK = realmsSDKService.isReady();
        if (this.useSDK) {
          console.log('🔗 Using Realms SDK (governance-idl-sdk) for on-chain queries');
          return; // SDK is preferred
        }
      } catch (error) {
        console.warn('⚠️ Failed to initialize SDK:', error);
      }
    }

    // Fall back to API if key available
    const apiKey = options?.apiKey || process.env.EXPO_PUBLIC_REALMS_API_KEY;
    if (apiKey && apiKey !== 'your_realms_api_key_here') {
      try {
        realmsAPIService.initialize(apiKey, options?.apiBaseUrl);
        this.useAPI = realmsAPIService.isReady();
        if (this.useAPI) {
          console.log('🌐 Using Realms API for governance data');
          return;
        }
      } catch (error) {
        console.warn('⚠️ Failed to initialize API:', error);
      }
    }

    console.log('ℹ️ No governance data source configured. Provide RPC URL or API key.');
  }

  /**
   * Get list of all DAOs
   */
  async getDAOs(options?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<GovernanceDAO[]> {
    try {
      if (this.useSDK) {
        const realms = await realmsSDKService.getAllRealms();
        return realms.map(realm => ({
          realmPk: realm.address,
          name: realm.name,
          authority: realm.authority,
          tokenMint: realm.tokenMintAddress,
          communityToken: realm.communityTokenAddress,
          votingProposalCount: realm.votingProposalCount,
          source: 'sdk' as const,
        }));
      } else if (this.useAPI) {
        const result = await realmsAPIService.listDAOs(options);
        return result.daos.map(dao => ({
          realmPk: dao.realmPk,
          name: dao.name,
          description: dao.shortDescription,
          authority: dao.authority,
          tokenMint: dao.tokenMintAddress,
          communityToken: dao.communityTokenAddress,
          votingProposalCount: 0,
          logoUrl: dao.logoUrl,
          websiteUrl: dao.websiteUrl,
          source: 'api' as const,
        }));
      } else {
        throw new Error('No governance data source configured');
      }
    } catch (error) {
      console.error('❌ Failed to get DAOs:', error);
      throw error;
    }
  }

  /**
   * Get specific DAO details
   */
  async getDAO(realmPk: string): Promise<GovernanceDAO> {
    try {
      if (this.useSDK) {
        const realm = await realmsSDKService.getRealm(realmPk);
        return {
          realmPk: realm.address,
          name: realm.name,
          authority: realm.authority,
          tokenMint: realm.tokenMintAddress,
          communityToken: realm.communityTokenAddress,
          votingProposalCount: realm.votingProposalCount,
          source: 'sdk' as const,
        };
      } else if (this.useAPI) {
        const result = await realmsAPIService.getDAO(realmPk);
        return {
          realmPk: result.dao.realmPk,
          name: result.dao.name,
          description: result.dao.shortDescription,
          authority: result.dao.authority,
          tokenMint: result.dao.tokenMintAddress,
          communityToken: result.dao.communityTokenAddress,
          votingProposalCount: 0,
          logoUrl: result.dao.logoUrl,
          websiteUrl: result.dao.websiteUrl,
          source: 'api' as const,
        };
      } else {
        throw new Error('No governance data source configured');
      }
    } catch (error) {
      console.error('❌ Failed to get DAO:', error);
      throw error;
    }
  }

  /**
   * Get proposals for a DAO
   */
  async getProposals(
    realmPk: string,
    filters?: {
      state?: string;
      limit?: number;
      offset?: number;
    }
  ): Promise<GovernanceProposal[]> {
    try {
      const now = Date.now();

      if (this.useSDK) {
        const governances = await realmsSDKService.getAllGovernances(realmPk);
        const allProposals: GovernanceProposal[] = [];

        for (const governance of governances) {
          const proposals = await realmsSDKService.getAllProposals(governance.address);
          allProposals.push(
            ...proposals.map(proposal => ({
              proposalPk: proposal.address,
              realmPk: realmPk,
              name: proposal.name,
              description: proposal.description,
              proposer: proposal.proposer,
              state: proposal.state,
              startTime: proposal.startTime * 1000,
              votingEndTime: proposal.votingEndTime * 1000,
              voteStats: {
                yes: proposal.voteCount.yes,
                no: proposal.voteCount.no,
                abstain: proposal.voteCount.abstain,
                total: proposal.voteCount.yes + proposal.voteCount.no + proposal.voteCount.abstain,
              },
              timeRemaining: Math.max(0, (proposal.votingEndTime * 1000) - now),
              isActive: proposal.state === 'Voting',
              source: 'sdk' as const,
            }))
          );
        }

        return allProposals;
      } else if (this.useAPI) {
        const result = await realmsAPIService.getDAOProposals(realmPk, filters);
        return result.proposals.map(proposal => ({
          proposalPk: proposal.proposalPk,
          realmPk: proposal.realmPk,
          name: proposal.name,
          description: proposal.description,
          proposer: proposal.proposer,
          state: proposal.state,
          startTime: proposal.startTime * 1000,
          votingEndTime: proposal.votingEndTime * 1000,
          voteStats: {
            yes: proposal.voteData?.yesVotes || 0,
            no: proposal.voteData?.noVotes || 0,
            abstain: proposal.voteData?.abstainVotes || 0,
            total: proposal.voteData?.totalVotes || 0,
          },
          timeRemaining: Math.max(0, (proposal.votingEndTime * 1000) - now),
          isActive: proposal.state === 'Voting' || proposal.state === 'Draft',
          source: 'api' as const,
        }));
      } else {
        throw new Error('No governance data source configured');
      }
    } catch (error) {
      console.error('❌ Failed to get proposals:', error);
      throw error;
    }
  }

  /**
   * Get specific proposal details
   */
  async getProposal(proposalPk: string, realmPk?: string): Promise<GovernanceProposal | null> {
    try {
      if (this.useSDK) {
        const proposal = await realmsSDKService.getProposalByPubkey(proposalPk);
        if (!proposal) return null;

        const now = Date.now();
        return {
          proposalPk: proposal.address,
          realmPk: realmPk || proposal.governanceAddress,
          name: proposal.name,
          description: proposal.description,
          proposer: proposal.proposer,
          state: proposal.state,
          startTime: proposal.startTime * 1000,
          votingEndTime: proposal.votingEndTime * 1000,
          voteStats: {
            yes: proposal.voteCount.yes,
            no: proposal.voteCount.no,
            abstain: proposal.voteCount.abstain,
            total: proposal.voteCount.yes + proposal.voteCount.no + proposal.voteCount.abstain,
          },
          timeRemaining: Math.max(0, (proposal.votingEndTime * 1000) - now),
          isActive: proposal.state === 'Voting',
          source: 'sdk' as const,
        };
      } else if (this.useAPI && realmPk) {
        const proposals = await this.getProposals(realmPk, { limit: 100 });
        return proposals.find(p => p.proposalPk === proposalPk) || null;
      } else {
        throw new Error('No governance data source configured');
      }
    } catch (error) {
      console.error('❌ Failed to get proposal:', error);
      return null;
    }
  }

  /**
   * Get user governance participation stats
   */
  async getUserStats(walletAddress: string): Promise<UserGovernanceStats> {
    try {
      if (this.useAPI) {
        const userInfo = await realmsAPIService.getUserGovernanceInfo(walletAddress);
        return {
          walletAddress,
          votingPower: userInfo.governanceParticipation.voteWeight,
          proposalsCreated: userInfo.governanceParticipation.proposalsCreated,
          proposalsVotedOn: userInfo.governanceParticipation.proposalsVotedOn,
          delegatingTo: userInfo.delegatingTo,
          delegatedTokens: userInfo.delegatedTokens,
          source: 'api' as const,
        };
      } else if (this.useSDK) {
        console.warn('⚠️ User stats require realm context for SDK queries');
        return {
          walletAddress,
          votingPower: 0,
          proposalsCreated: 0,
          proposalsVotedOn: 0,
          delegatedTokens: 0,
          source: 'sdk' as const,
        };
      } else {
        throw new Error('No governance data source configured');
      }
    } catch (error) {
      console.error('❌ Failed to get user stats:', error);
      throw error;
    }
  }

  /**
   * Get governance participation leaderboard
   */
  async getLeaderboard(options?: {
    limit?: number;
    offset?: number;
    sortBy?: 'participation' | 'votes' | 'created';
  }): Promise<Array<{
    rank: number;
    walletAddress: string;
    score: number;
    proposalsCreated: number;
    proposalsVotedOn: number;
  }>> {
    try {
      if (this.useAPI) {
        const result = await realmsAPIService.getLeaderboard(options);
        return result.entries.map(entry => ({
          rank: entry.rank,
          walletAddress: entry.walletPk,
          score: entry.governanceParticipationScore,
          proposalsCreated: entry.proposalsCreated,
          proposalsVotedOn: entry.proposalsVotedOn,
        }));
      } else {
        console.log('ℹ️ Leaderboard only available with API');
        return [];
      }
    } catch (error) {
      console.error('❌ Failed to get leaderboard:', error);
      throw error;
    }
  }

  /**
   * Cast a vote on a proposal
   */
  async castVote(
    proposalPk: string,
    walletAddress: string,
    choice: 'yes' | 'no' | 'abstain',
    weight: number = 1
  ): Promise<{ transactionSignature: string }> {
    try {
      if (this.useSDK) {
        return await realmsSDKService.castVote(proposalPk, walletAddress, choice, weight);
      } else {
        throw new Error('Vote casting requires SDK (on-chain transactions)');
      }
    } catch (error) {
      console.error('❌ Failed to cast vote:', error);
      throw error;
    }
  }

  /**
   * Get current data source
   */
  getDataSource(): 'api' | 'sdk' | 'none' {
    if (this.useSDK) return 'sdk';
    if (this.useAPI) return 'api';
    return 'none';
  }

  /**
   * Check if SDK is configured
   */
  isSDKConfigured(): boolean {
    return this.useSDK;
  }

  /**
   * Check if API is configured
   */
  isAPIConfigured(): boolean {
    return this.useAPI;
  }
}

export const realmsGovernanceService = new RealmsGovernanceService();
