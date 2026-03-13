/**
 * Bonding Curve Service
 *
 * Handles all price math for artist coins in both phases:
 *   Phase 1 (bonding): Quadratic curve from initial → graduation market cap
 *   Phase 2 (AMM):     Constant-product x*y=k spot price
 *
 * All BEZY amounts are in micro-BEZY (6 decimals).
 * 1 BEZY = 1_000_000 micro-BEZY
 *
 * Mirrors the on-chain math so the UI can show accurate quotes
 * before submitting a transaction.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

export const MICRO = 1_000_000n; // 1 BEZY in micro-BEZY

export const COIN_DEFAULTS = {
  TOTAL_SUPPLY:         1_000_000_000n, // 1B coins
  CURVE_SUPPLY:           250_000_000n, // 25%
  ARTIST_SUPPLY:          500_000_000n, // 50%
  LP_SUPPLY:              200_000_000n, // 20%
  REWARD_SUPPLY:           50_000_000n, // 5%

  // Market caps in micro-BEZY
  INITIAL_MARKET_CAP:      10_000n * MICRO,   //  10,000 BEZY
  GRADUATION_MARKET_CAP: 1_000_000n * MICRO,  // 1,000,000 BEZY

  TRADING_FEE_BPS: 100n,   // 1%
  ARTIST_FEE_SHARE: 0.5,   // 50% of fee goes to artist
} as const;

// ─── Types ───────────────────────────────────────────────────────────────────

export type CoinPhase = 'bonding' | 'graduated';

export interface CoinState {
  status: CoinPhase;
  curveSupply: bigint;        // total coins on bonding curve (default 250M)
  curveSupplySold: bigint;    // how many sold so far
  bezRaised: bigint;          // micro-BEZY raised during bonding phase
  initialMarketCap: bigint;   // micro-BEZY
  graduationMarketCap: bigint;// micro-BEZY
  tradingFeeBps: bigint;
  // AMM state (only relevant post-graduation)
  ammBezReserve: bigint;
  ammCoinReserve: bigint;
}

export interface TradeQuote {
  phase: CoinPhase;
  coinAmount: bigint;        // coins to receive (buy) or to sell
  bezAmount: bigint;         // BEZY to spend (buy) or receive (sell), before fee
  fee: bigint;               // total fee in micro-BEZY
  artistFee: bigint;
  treasuryFee: bigint;
  pricePerCoin: bigint;      // micro-BEZY per coin at execution
  priceImpactBps: bigint;    // for AMM phase only
  willGraduate: boolean;     // does this buy push the coin over graduation?
}

export interface GraduationResult {
  ammBezReserve: bigint;    // seeded into AMM
  ammCoinReserve: bigint;   // seeded into AMM
}

// ─── Price Math ───────────────────────────────────────────────────────────────

/**
 * Quadratic bonding curve price function.
 *
 * Market cap at a given sold amount:
 *   mc(sold) = initialMC + (gradMC - initialMC) * (sold / curveSupply)²
 *
 * Price per coin ≈ derivative of mc with respect to sold:
 *   price(sold) = 2 * (gradMC - initialMC) * sold / curveSupply²
 *   + initialMC / curveSupply   (baseline price at zero supply)
 *
 * For the custodial MVP we use the simpler integral-based approach:
 * cost to buy from sold_0 to sold_1 = integral of price(x) dx
 */

function marketCapAt(sold: bigint, coin: Pick<CoinState, 'curveSupply' | 'initialMarketCap' | 'graduationMarketCap'>): bigint {
  if (coin.curveSupply === 0n) return coin.initialMarketCap;
  // progress² in fixed-point (scale by 1e12 to avoid integer underflow)
  const SCALE = 1_000_000_000_000n; // 1e12
  const progress = (sold * SCALE) / coin.curveSupply;
  const progressSq = (progress * progress) / SCALE;
  const range = coin.graduationMarketCap - coin.initialMarketCap;
  return coin.initialMarketCap + (range * progressSq) / SCALE;
}

/**
 * Cost in micro-BEZY to buy `amount` coins starting from `currentSold`.
 * Uses midpoint approximation (average of start and end price).
 */
function bondingCurveBuyCost(
  currentSold: bigint,
  amount: bigint,
  coin: Pick<CoinState, 'curveSupply' | 'initialMarketCap' | 'graduationMarketCap'>
): bigint {
  const mcStart = marketCapAt(currentSold, coin);
  const mcEnd   = marketCapAt(currentSold + amount, coin);
  // Average price per coin over the interval × amount
  const avgMC = (mcStart + mcEnd) / 2n;
  // price per coin at average mc = avgMC / curveSupply
  return (avgMC * amount) / coin.curveSupply;
}

/**
 * Coins received in micro-BEZY for selling `amount` coins back.
 * Same midpoint approach in reverse.
 */
function bondingCurveSellReturn(
  currentSold: bigint,
  amount: bigint,
  coin: Pick<CoinState, 'curveSupply' | 'initialMarketCap' | 'graduationMarketCap'>
): bigint {
  const mcEnd   = marketCapAt(currentSold, coin);
  const mcStart = marketCapAt(currentSold - amount, coin);
  const avgMC = (mcStart + mcEnd) / 2n;
  return (avgMC * amount) / coin.curveSupply;
}

// ─── AMM Math (x*y=k constant product) ───────────────────────────────────────

/**
 * Given bezIn, how many coins come out?
 * Applies fee before swap.
 */
function ammCoinsOut(bezIn: bigint, bezReserve: bigint, coinReserve: bigint, feeBps: bigint): bigint {
  const bezAfterFee = bezIn * (10_000n - feeBps) / 10_000n;
  return (coinReserve * bezAfterFee) / (bezReserve + bezAfterFee);
}

/**
 * Given coinsIn, how much BEZY comes out?
 */
function ammBezOut(coinsIn: bigint, bezReserve: bigint, coinReserve: bigint, feeBps: bigint): bigint {
  const coinsAfterFee = coinsIn * (10_000n - feeBps) / 10_000n;
  return (bezReserve * coinsAfterFee) / (coinReserve + coinsAfterFee);
}

function ammSpotPrice(bezReserve: bigint, coinReserve: bigint): bigint {
  if (coinReserve === 0n) return 0n;
  return bezReserve / coinReserve;
}

function ammPriceImpactBps(
  amountIn: bigint,
  reserveIn: bigint,
): bigint {
  // Impact ≈ amountIn / (reserveIn + amountIn) * 10000
  return (amountIn * 10_000n) / (reserveIn + amountIn);
}

// ─── Fee Math ─────────────────────────────────────────────────────────────────

function splitFees(grossBez: bigint, feeBps: bigint, artistShare: number): {
  fee: bigint;
  artistFee: bigint;
  treasuryFee: bigint;
  net: bigint;
} {
  const fee = (grossBez * feeBps) / 10_000n;
  const artistFee = BigInt(Math.floor(Number(fee) * artistShare));
  const treasuryFee = fee - artistFee;
  return { fee, artistFee, treasuryFee, net: grossBez - fee };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export const bondingCurveService = {

  /**
   * Current price in micro-BEZY per coin.
   */
  getCurrentPrice(coin: CoinState): bigint {
    if (coin.status === 'graduated') {
      return ammSpotPrice(coin.ammBezReserve, coin.ammCoinReserve);
    }
    // Instantaneous price at current sold level
    const mc = marketCapAt(coin.curveSupplySold, coin);
    return coin.curveSupply > 0n ? mc / coin.curveSupply : 0n;
  },

  /**
   * Progress toward graduation (0–1 as a percentage, 0–100).
   */
  graduationProgress(coin: CoinState): number {
    if (coin.status === 'graduated') return 100;
    return Number((coin.bezRaised * 100n) / coin.graduationMarketCap);
  },

  /**
   * Quote a BUY: spend `bezAmount` micro-BEZY, how many coins do you get?
   */
  quoteBuy(coin: CoinState, bezAmount: bigint): TradeQuote {
    if (coin.status === 'graduated') {
      // AMM buy
      const coinsOut = ammCoinsOut(bezAmount, coin.ammBezReserve, coin.ammCoinReserve, coin.tradingFeeBps);
      const { fee, artistFee, treasuryFee } = splitFees(bezAmount, coin.tradingFeeBps, COIN_DEFAULTS.ARTIST_FEE_SHARE);
      const spotPrice = ammSpotPrice(coin.ammBezReserve, coin.ammCoinReserve);
      const impact = ammPriceImpactBps(bezAmount, coin.ammBezReserve);

      return {
        phase: 'graduated',
        coinAmount: coinsOut,
        bezAmount,
        fee,
        artistFee,
        treasuryFee,
        pricePerCoin: coinsOut > 0n ? bezAmount / coinsOut : spotPrice,
        priceImpactBps: impact,
        willGraduate: false,
      };
    }

    // Bonding curve buy
    const available = coin.curveSupply - coin.curveSupplySold;
    const { fee, artistFee, treasuryFee, net: bezNet } = splitFees(bezAmount, coin.tradingFeeBps, COIN_DEFAULTS.ARTIST_FEE_SHARE);

    // Binary search: find how many coins bezNet buys
    let lo = 0n;
    let hi = available;
    while (hi - lo > 1n) {
      const mid = (lo + hi) / 2n;
      const cost = bondingCurveBuyCost(coin.curveSupplySold, mid, coin);
      if (cost <= bezNet) lo = mid;
      else hi = mid;
    }
    const coinAmount = lo;
    const actualCost = bondingCurveBuyCost(coin.curveSupplySold, coinAmount, coin);
    const willGraduate = coin.bezRaised + actualCost >= coin.graduationMarketCap;

    return {
      phase: 'bonding',
      coinAmount,
      bezAmount: actualCost + fee,
      fee,
      artistFee,
      treasuryFee,
      pricePerCoin: coinAmount > 0n ? (actualCost + fee) / coinAmount : 0n,
      priceImpactBps: 0n,
      willGraduate,
    };
  },

  /**
   * Quote a SELL: sell `coinAmount` coins, how much BEZY do you get?
   */
  quoteSell(coin: CoinState, coinAmount: bigint): TradeQuote {
    if (coin.status === 'graduated') {
      const grossBez = ammBezOut(coinAmount, coin.ammBezReserve, coin.ammCoinReserve, coin.tradingFeeBps);
      const { fee, artistFee, treasuryFee, net } = splitFees(grossBez, coin.tradingFeeBps, COIN_DEFAULTS.ARTIST_FEE_SHARE);
      const spotPrice = ammSpotPrice(coin.ammBezReserve, coin.ammCoinReserve);
      const impact = ammPriceImpactBps(coinAmount, coin.ammCoinReserve);

      return {
        phase: 'graduated',
        coinAmount,
        bezAmount: net,
        fee,
        artistFee,
        treasuryFee,
        pricePerCoin: coinAmount > 0n ? grossBez / coinAmount : spotPrice,
        priceImpactBps: impact,
        willGraduate: false,
      };
    }

    // Bonding curve sell
    if (coinAmount > coin.curveSupplySold) {
      throw new Error('Cannot sell more than curve supply sold');
    }
    const grossBez = bondingCurveSellReturn(coin.curveSupplySold, coinAmount, coin);
    const { fee, artistFee, treasuryFee, net } = splitFees(grossBez, coin.tradingFeeBps, COIN_DEFAULTS.ARTIST_FEE_SHARE);

    return {
      phase: 'bonding',
      coinAmount,
      bezAmount: net,
      fee,
      artistFee,
      treasuryFee,
      pricePerCoin: coinAmount > 0n ? grossBez / coinAmount : 0n,
      priceImpactBps: 0n,
      willGraduate: false,
    };
  },

  /**
   * Compute the AMM state when a coin graduates.
   * 80% of raised BEZY + LP supply coins are seeded into the pool.
   */
  computeGraduationPool(bezRaised: bigint, lpSupply: bigint): GraduationResult {
    return {
      ammBezReserve: (bezRaised * 8n) / 10n,  // 80% of raised BEZY
      ammCoinReserve: lpSupply,                 // 200M coins
    };
  },

  /**
   * Claimable vesting amount for an artist at a given timestamp.
   * Linear vesting after cliff.
   */
  claimableVesting(
    totalLocked: bigint,
    amountClaimed: bigint,
    startDate: Date,
    cliffDate: Date,
    vestEndDate: Date,
    now: Date = new Date()
  ): bigint {
    if (now < cliffDate) return 0n;

    const totalMs = vestEndDate.getTime() - startDate.getTime();
    const elapsedMs = Math.min(now.getTime() - startDate.getTime(), totalMs);
    const vestedFraction = elapsedMs / totalMs;
    const totalVested = BigInt(Math.floor(Number(totalLocked) * vestedFraction));
    const claimable = totalVested - amountClaimed;
    return claimable > 0n ? claimable : 0n;
  },

  // ─── Formatting helpers ───────────────────────────────────────────────────

  /** Convert micro-BEZY bigint to display string (e.g. "1,234.56 BEZY") */
  formatBezy(microBezy: bigint): string {
    const whole = microBezy / MICRO;
    const frac = microBezy % MICRO;
    const fracStr = frac.toString().padStart(6, '0').replace(/0+$/, '');
    const display = fracStr ? `${whole}.${fracStr}` : `${whole}`;
    return `${Number(display).toLocaleString()} BEZY`;
  },

  /** Convert micro-BEZY to number (for charting/display only) */
  toBezy(microBezy: bigint): number {
    return Number(microBezy) / 1_000_000;
  },

  /** Convert BEZY float to micro-BEZY bigint */
  fromBezy(bezy: number): bigint {
    return BigInt(Math.round(bezy * 1_000_000));
  },

  /** Coin amount display (coins have 6 decimals too) */
  formatCoins(microCoins: bigint, ticker: string): string {
    const whole = microCoins / MICRO;
    return `${Number(whole).toLocaleString()} ${ticker}`;
  },
};
