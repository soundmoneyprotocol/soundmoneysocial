/**
 * Mock Governance Data
 * Simulates governance proposals and voting for demo/hackathon purposes
 */

export interface MockProposal {
  id: string;
  playlistName: string;
  proposer: string;
  state: 'Draft' | 'Voting' | 'Approved' | 'Rejected' | 'Executed';
  createdAt: number;
  votingDeadline: number;
  approveVotes: number;
  rejectVotes: number;
  totalVotes: number;
  description?: string;
  voting: {
    yes: number;
    no: number;
    abstain: number;
    totalWeight: number;
  };
}

/**
 * Generate mock proposals
 */
export const generateMockProposals = (): MockProposal[] => {
  const now = Date.now();
  return [
    {
      id: '1',
      playlistName: 'Chart Toppers 2025',
      proposer: 'curator.eth',
      state: 'Voting',
      createdAt: now - 7 * 24 * 60 * 60 * 1000,
      votingDeadline: now + 3 * 24 * 60 * 60 * 1000,
      approveVotes: 1250,
      rejectVotes: 340,
      totalVotes: 1590,
      description: 'Curate the top 50 charts for this month',
      voting: {
        yes: 1250,
        no: 340,
        abstain: 0,
        totalWeight: 1590,
      },
    },
    {
      id: '2',
      playlistName: 'Indie Gems Discovery',
      proposer: 'community_curator',
      state: 'Voting',
      createdAt: now - 5 * 24 * 60 * 60 * 1000,
      votingDeadline: now + 5 * 24 * 60 * 60 * 1000,
      approveVotes: 890,
      rejectVotes: 120,
      totalVotes: 1010,
      description: 'Showcase emerging indie artists',
      voting: {
        yes: 890,
        no: 120,
        abstain: 0,
        totalWeight: 1010,
      },
    },
    {
      id: '3',
      playlistName: 'Viral Hits & Trends',
      proposer: 'trendspotter',
      state: 'Approved',
      createdAt: now - 14 * 24 * 60 * 60 * 1000,
      votingDeadline: now - 2 * 24 * 60 * 60 * 1000,
      approveVotes: 2150,
      rejectVotes: 280,
      totalVotes: 2430,
      description: 'Feature the hottest trending songs',
      voting: {
        yes: 2150,
        no: 280,
        abstain: 0,
        totalWeight: 2430,
      },
    },
    {
      id: '4',
      playlistName: 'Nostalgia Classics',
      proposer: 'oldschool_fan',
      state: 'Approved',
      createdAt: now - 21 * 24 * 60 * 60 * 1000,
      votingDeadline: now - 9 * 24 * 60 * 60 * 1000,
      approveVotes: 1680,
      rejectVotes: 220,
      totalVotes: 1900,
      description: 'Bring back the best hits from the 80s and 90s',
      voting: {
        yes: 1680,
        no: 220,
        abstain: 0,
        totalWeight: 1900,
      },
    },
  ];
};

/**
 * Create a mock proposal (simulates creation without backend)
 */
export const createMockProposal = (config: {
  playlistName: string;
  description?: string;
  votingPeriodHours?: number;
}): MockProposal => {
  const now = Date.now();
  const votingHours = config.votingPeriodHours || 48;

  return {
    id: `proposal-${Date.now()}`,
    playlistName: config.playlistName,
    proposer: 'current_user.eth',
    state: 'Voting',
    createdAt: now,
    votingDeadline: now + votingHours * 60 * 60 * 1000,
    approveVotes: 0,
    rejectVotes: 0,
    totalVotes: 0,
    description: config.description || 'A new proposal',
    voting: {
      yes: 0,
      no: 0,
      abstain: 0,
      totalWeight: 0,
    },
  };
};

/**
 * Simulate proposal creation with realistic delay
 */
export const simulateProposalCreation = async (config: {
  playlistName: string;
  description?: string;
  votingPeriodHours?: number;
}): Promise<MockProposal> => {
  // Simulate network delay (1-3 seconds)
  await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

  // Create mock proposal
  const proposal = createMockProposal(config);

  console.log('🎬 Demo Mode: Proposal created:', proposal);
  return proposal;
};

/**
 * Simulate voting
 */
export const simulateVote = async (proposalId: string, choice: 'approve' | 'reject' | 'abstain', weight: number = 1): Promise<boolean> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 1500));

  console.log('🎬 Demo Mode: Vote submitted:', { proposalId, choice, weight });
  return true;
};

/**
 * Check if demo mode is enabled
 */
export const isDemoMode = (): boolean => {
  return process.env.EXPO_PUBLIC_GOVERNANCE_DEMO_MODE === 'true';
};
