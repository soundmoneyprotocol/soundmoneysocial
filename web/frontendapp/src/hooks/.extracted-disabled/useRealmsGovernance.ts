/**
 * Hook for Realms Governance
 * Provides access to on-chain DAO and proposal data from Realms
 */

import { useState, useCallback, useEffect } from 'react';
import { realmsGovernanceService, GovernanceDAO, GovernanceProposal, UserGovernanceStats } from '../services/realmsGovernanceService';

export function useRealmsGovernance() {
  const [daos, setDAOs] = useState<GovernanceDAO[]>([]);
  const [proposals, setProposals] = useState<GovernanceProposal[]>([]);
  const [userStats, setUserStats] = useState<UserGovernanceStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataSource, setDataSource] = useState<'api' | 'onchain'>('onchain');

  // Initialize on mount
  useEffect(() => {
    console.log('🌐 Realms Governance Hook initialized');
    const source = realmsGovernanceService.getDataSource();
    setDataSource(source);
  }, []);

  const fetchDAOs = useCallback(
    async (options?: { limit?: number; offset?: number; search?: string }) => {
      try {
        setLoading(true);
        setError(null);
        console.log('📊 Fetching DAOs...');

        const result = await realmsGovernanceService.getDAOs(options);
        setDAOs(result);
        console.log('✅ DAOs fetched:', { count: result.length });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch DAOs';
        setError(message);
        console.error('❌ Error fetching DAOs:', message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchProposals = useCallback(
    async (realmPk: string, filters?: { state?: string; limit?: number; offset?: number }) => {
      try {
        setLoading(true);
        setError(null);
        console.log('📜 Fetching proposals for realm:', realmPk);

        const result = await realmsGovernanceService.getProposals(realmPk, filters);
        setProposals(result);
        console.log('✅ Proposals fetched:', { count: result.length });
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch proposals';
        setError(message);
        console.error('❌ Error fetching proposals:', message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getProposal = useCallback(
    async (proposalPk: string, realmPk: string): Promise<GovernanceProposal | null> => {
      try {
        setError(null);
        console.log('📄 Fetching proposal:', proposalPk);

        const result = await realmsGovernanceService.getProposal(proposalPk, realmPk);
        console.log('✅ Proposal fetched');
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch proposal';
        setError(message);
        console.error('❌ Error fetching proposal:', message);
        return null;
      }
    },
    []
  );

  const fetchUserStats = useCallback(
    async (walletAddress: string) => {
      try {
        setError(null);
        console.log('👤 Fetching user stats for wallet:', walletAddress);

        const result = await realmsGovernanceService.getUserStats(walletAddress);
        setUserStats(result);
        console.log('✅ User stats fetched');
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch user stats';
        setError(message);
        console.error('❌ Error fetching user stats:', message);
        throw err;
      }
    },
    []
  );

  const castVote = useCallback(
    async (proposalPk: string, choice: 'yes' | 'no' | 'abstain', weight: number = 1) => {
      try {
        setError(null);
        console.log('🗳️ Casting vote on proposal:', { proposalPk, choice, weight });

        const result = await realmsGovernanceService.castVote(proposalPk, choice, weight);
        console.log('✅ Vote cast successfully:', result);
        return result;
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to cast vote';
        setError(message);
        console.error('❌ Error casting vote:', message);
        throw err;
      }
    },
    []
  );

  return {
    // State
    daos,
    proposals,
    userStats,
    loading,
    error,
    dataSource,

    // Methods
    fetchDAOs,
    fetchProposals,
    getProposal,
    fetchUserStats,
    castVote,
  };
}
