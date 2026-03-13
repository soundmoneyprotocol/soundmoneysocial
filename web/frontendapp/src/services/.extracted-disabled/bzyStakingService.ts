/**
 * BZY Staking Service
 *
 * Implements Solana stake pool architecture for BZY token staking.
 * Users can:
 * 1. Deposit BZY into staking pools
 * 2. Earn rewards from pool validators
 * 3. Receive pool tokens (fractional ownership)
 * 4. Unstake and withdraw BZY
 *
 * Architecture based on: https://www.solana-program.com/docs/stake-pool/overview
 */

export interface StakePool {
  id: string;
  name: string;
  address: string;
  totalStaked: string; // Total BZY staked
  validators: string[]; // Validator addresses delegated to
  apy: number; // Annual Percentage Yield
  fee: number; // Manager fee (in basis points, e.g., 500 = 5%)
  poolTokens: string; // Total pool tokens issued
  reserve: string; // Reserve BZY for withdrawals
  description: string;
  icon?: string;
}

export interface UserStakePosition {
  id: string;
  poolId: string;
  userAddress: string;
  stakedBZY: string;
  poolTokens: string; // Fractional ownership
  earnedRewards: string;
  createdAt: string;
  lastClaimTime: string;
}

export interface StakingReward {
  id: string;
  positionId: string;
  amount: string;
  timestamp: string;
  source: 'validator' | 'audius_coins'; // Rewards can come from validators or Audius coins
  audiosReferenceId?: string; // Reference to Audius coin if applicable
}

export interface AudiusStakingPair {
  coinId: string;
  coinName: string;
  stakingMultiplier: number; // e.g., 1.5x rewards for AUDIO holders
  rewardBoost: number; // Percentage boost (e.g., 15 = 15% boost)
  description: string;
}

class BZYStakingService {
  private stakePools: StakePool[] = [
    {
      id: 'pool-1',
      name: 'SoundMoney Premium Staking',
      address: 'SMStake1111111111111111111111111111111111',
      totalStaked: '1500000',
      validators: [
        'Val1111111111111111111111111111111111111111',
        'Val2222222222222222222222222222222222222222',
        'Val3333333333333333333333333333333333333333',
      ],
      apy: 12.5,
      fee: 300, // 3%
      poolTokens: '1500000',
      reserve: '150000',
      description: 'Main staking pool with diversified validators',
      icon: '🎵',
    },
    {
      id: 'pool-2',
      name: 'Audius Creator Staking',
      address: 'AudiusStaking111111111111111111111111111',
      totalStaked: '800000',
      validators: [
        'AuVal11111111111111111111111111111111111111',
      ],
      apy: 15.0,
      fee: 500, // 5%
      poolTokens: '800000',
      reserve: '80000',
      description: 'Specialized staking pool with Audius integration',
      icon: '🎶',
    },
  ];

  private userPositions: UserStakePosition[] = [];

  private audiusStakingPairs: AudiusStakingPair[] = [
    {
      coinId: 'audio',
      coinName: 'Audius (AUDIO)',
      stakingMultiplier: 1.5,
      rewardBoost: 15,
      description: 'Hold AUDIO coins while staking BZY for 15% reward boost',
    },
    {
      coinId: 'usdc',
      coinName: 'USDC Stablecoin',
      stakingMultiplier: 1.2,
      rewardBoost: 8,
      description: 'Pair USDC with BZY staking for 8% reward boost',
    },
    {
      coinId: 'sol',
      coinName: 'Solana (SOL)',
      stakingMultiplier: 1.3,
      rewardBoost: 12,
      description: 'Hold SOL while staking BZY for 12% reward boost',
    },
  ];

  /**
   * Get all available staking pools
   */
  getStakePools(): StakePool[] {
    return this.stakePools;
  }

  /**
   * Get specific pool details
   */
  getPoolDetails(poolId: string): StakePool | null {
    return this.stakePools.find(p => p.id === poolId) || null;
  }

  /**
   * Deposit BZY into a staking pool
   * Returns pool tokens representing fractional ownership
   */
  async depositToPool(
    userAddress: string,
    poolId: string,
    amountBZY: string
  ): Promise<UserStakePosition> {
    const pool = this.stakePools.find(p => p.id === poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    const amountNum = parseFloat(amountBZY);
    if (amountNum <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    // Calculate pool tokens to mint
    // Formula: (amountBZY / totalStaked) * totalPoolTokens
    const totalStakedNum = parseFloat(pool.totalStaked);
    const totalPoolTokensNum = parseFloat(pool.poolTokens);
    const poolTokensToMint = (amountNum / totalStakedNum) * totalPoolTokensNum;

    // Create stake position
    const position: UserStakePosition = {
      id: `pos-${Date.now()}`,
      poolId,
      userAddress,
      stakedBZY: amountBZY,
      poolTokens: poolTokensToMint.toFixed(8),
      earnedRewards: '0',
      createdAt: new Date().toISOString(),
      lastClaimTime: new Date().toISOString(),
    };

    this.userPositions.push(position);

    // Update pool totals (in production, this would be on-chain)
    pool.totalStaked = (totalStakedNum + amountNum).toFixed(8);
    pool.poolTokens = (totalPoolTokensNum + poolTokensToMint).toFixed(8);

    return position;
  }

  /**
   * Withdraw BZY from staking pool
   * Pool tokens are burned and SOL is returned from reserves
   */
  async withdrawFromPool(
    userAddress: string,
    positionId: string,
    withdrawalOption: 'sol' | 'stake'
  ): Promise<{ amountBZY: string; transactionId: string }> {
    const position = this.userPositions.find(p => p.id === positionId && p.userAddress === userAddress);
    if (!position) {
      throw new Error('Position not found');
    }

    const pool = this.stakePools.find(p => p.id === position.poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    const poolTokensNum = parseFloat(position.poolTokens);
    const totalPoolTokensNum = parseFloat(pool.poolTokens);
    const totalStakedNum = parseFloat(pool.totalStaked);

    // Calculate BZY to return
    // Formula: (poolTokens / totalPoolTokens) * totalStaked
    const bzYToReturn = (poolTokensNum / totalPoolTokensNum) * totalStakedNum;

    // Withdrawal options:
    // 1. 'sol' - Withdraw from pool reserves (preferred, fast)
    // 2. 'stake' - Receive activated stake account (can be delegated)

    if (withdrawalOption === 'sol') {
      const reserveNum = parseFloat(pool.reserve);
      if (bzYToReturn > reserveNum) {
        throw new Error(`Insufficient reserve. Available: ${pool.reserve} BZY`);
      }
      pool.reserve = (reserveNum - bzYToReturn).toFixed(8);
    }

    // Remove position and update pool
    this.userPositions = this.userPositions.filter(p => p.id !== positionId);
    pool.totalStaked = (totalStakedNum - bzYToReturn).toFixed(8);
    pool.poolTokens = (totalPoolTokensNum - poolTokensNum).toFixed(8);

    return {
      amountBZY: bzYToReturn.toFixed(8),
      transactionId: `tx-${Date.now()}`,
    };
  }

  /**
   * Get user's staking positions
   */
  getUserPositions(userAddress: string): UserStakePosition[] {
    return this.userPositions.filter(p => p.userAddress === userAddress);
  }

  /**
   * Calculate projected rewards for a position
   * Based on pool APY and days staked
   */
  calculateProjectedRewards(position: UserStakePosition, daysStaked: number = 365): string {
    const pool = this.stakePools.find(p => p.id === position.poolId);
    if (!pool) return '0';

    const stakedNum = parseFloat(position.stakedBZY);
    const apyDecimal = pool.apy / 100;
    const dailyRate = apyDecimal / 365;
    const rewards = stakedNum * dailyRate * daysStaked;

    return rewards.toFixed(8);
  }

  /**
   * Get Audius staking pairs for reward boosts
   */
  getAudiusStakingPairs(): AudiusStakingPair[] {
    return this.audiusStakingPairs;
  }

  /**
   * Calculate reward boost based on held Audius coins
   */
  calculateRewardBoost(
    baseAPY: number,
    heldCoins: { coinId: string; amount: string }[]
  ): { boostedAPY: number; boost: number } {
    let totalBoost = 0;

    for (const holding of heldCoins) {
      const pair = this.audiusStakingPairs.find(p => p.coinId === holding.coinId);
      if (pair && parseFloat(holding.amount) > 0) {
        totalBoost += pair.rewardBoost;
      }
    }

    // Cap boost at 50% maximum
    const finalBoost = Math.min(totalBoost, 50);
    const boostMultiplier = 1 + finalBoost / 100;
    const boostedAPY = baseAPY * boostMultiplier;

    return {
      boostedAPY,
      boost: finalBoost,
    };
  }

  /**
   * Claim accumulated rewards
   * In production, this would trigger on-chain reward distribution
   */
  async claimRewards(userAddress: string, positionId: string): Promise<string> {
    const position = this.userPositions.find(p => p.id === positionId && p.userAddress === userAddress);
    if (!position) {
      throw new Error('Position not found');
    }

    const pool = this.stakePools.find(p => p.id === position.poolId);
    if (!pool) {
      throw new Error('Pool not found');
    }

    // Calculate rewards earned since last claim
    const lastClaim = new Date(position.lastClaimTime);
    const now = new Date();
    const secondsElapsed = (now.getTime() - lastClaim.getTime()) / 1000;
    const daysElapsed = secondsElapsed / (24 * 3600);

    const stakedNum = parseFloat(position.stakedBZY);
    const apyDecimal = pool.apy / 100;
    const dailyRate = apyDecimal / 365;
    const rewardsEarned = stakedNum * dailyRate * daysElapsed;

    // Update position
    position.earnedRewards = (parseFloat(position.earnedRewards) + rewardsEarned).toFixed(8);
    position.lastClaimTime = now.toISOString();

    return rewardsEarned.toFixed(8);
  }

  /**
   * Get pool validator information
   */
  getPoolValidators(poolId: string): Array<{ address: string; commission: number; apy: number }> {
    const pool = this.stakePools.find(p => p.id === poolId);
    if (!pool) return [];

    // Mock validator data
    return pool.validators.map((address, index) => ({
      address,
      commission: 5 + index, // 5%, 6%, 7%
      apy: pool.apy - (index * 0.5), // Slightly different APY per validator
    }));
  }

  /**
   * Get staking statistics
   */
  getStakingStats(): {
    totalBZYStaked: string;
    totalPoolTokens: string;
    averageAPY: number;
    participantCount: number;
  } {
    const totalBZY = this.stakePools.reduce((sum, p) => sum + parseFloat(p.totalStaked), 0);
    const totalPoolTokens = this.stakePools.reduce((sum, p) => sum + parseFloat(p.poolTokens), 0);
    const avgAPY = this.stakePools.reduce((sum, p) => sum + p.apy, 0) / this.stakePools.length;

    return {
      totalBZYStaked: totalBZY.toFixed(8),
      totalPoolTokens: totalPoolTokens.toFixed(8),
      averageAPY: parseFloat(avgAPY.toFixed(2)),
      participantCount: this.userPositions.length,
    };
  }
}

export const bzyStakingService = new BZYStakingService();
