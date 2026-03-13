/**
 * Coin Trading Service
 *
 * Executes buy/sell trades against Supabase (custodial MVP).
 * Calls bondingCurveService for price math, then atomically
 * updates coin state, user holdings, trade log, and artist earnings.
 *
 * In production (Phase 2), the on-chain Meteora DBC program handles
 * this atomically. This service will then submit the Solana tx and
 * record the result.
 */

import { supabase } from './supabaseService';
import { bondingCurveService, CoinState, TradeQuote, COIN_DEFAULTS } from './bondingCurveService';

// ─── DB row types ─────────────────────────────────────────────────────────────

export interface ArtistCoinRow {
  id: string;
  artist_id: string;
  name: string;
  ticker: string;
  description: string | null;
  image_url: string | null;
  total_supply: string;
  curve_supply: string;
  curve_supply_sold: string;
  artist_supply: string;
  lp_supply: string;
  reward_supply: string;
  bezy_raised: string;
  initial_market_cap: string;
  graduation_market_cap: string;
  status: 'bonding' | 'graduating' | 'graduated' | 'paused';
  graduated_at: string | null;
  amm_bezy_reserve: string;
  amm_coin_reserve: string;
  trading_fee_bps: number;
  artist_fee_share: number;
  holder_count: number;
  volume_24h: string;
  price_change_24h: number;
  mint_address: string | null;
  on_chain: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateCoinParams {
  artistId: string;
  name: string;
  ticker: string;
  description?: string;
  imageUrl?: string;
}

export interface ExecuteTradeResult {
  trade: {
    id: string;
    coinAmount: bigint;
    bezAmount: bigint;
    fee: bigint;
    pricePerCoin: bigint;
  };
  newPrice: bigint;
  graduated: boolean;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function rowToCoinState(row: ArtistCoinRow): CoinState {
  return {
    status: row.status === 'graduated' ? 'graduated' : 'bonding',
    curveSupply:         BigInt(row.curve_supply),
    curveSupplySold:     BigInt(row.curve_supply_sold),
    bezRaised:           BigInt(row.bezy_raised),
    initialMarketCap:    BigInt(row.initial_market_cap),
    graduationMarketCap: BigInt(row.graduation_market_cap),
    tradingFeeBps:       BigInt(row.trading_fee_bps),
    ammBezReserve:       BigInt(row.amm_bezy_reserve),
    ammCoinReserve:      BigInt(row.amm_coin_reserve),
  };
}

// ─── Service ──────────────────────────────────────────────────────────────────

export const coinTradingService = {

  // ── Coin Management ─────────────────────────────────────────────────────────

  async createCoin(params: CreateCoinParams): Promise<ArtistCoinRow> {
    const ticker = params.ticker.toUpperCase();

    // Enforce one coin per artist
    const { data: existing } = await supabase
      .from('artist_coins')
      .select('id')
      .eq('artist_id', params.artistId)
      .single();

    if (existing) {
      throw new Error('Artist already has a coin');
    }

    const { data, error } = await supabase
      .from('artist_coins')
      .insert({
        artist_id:             params.artistId,
        name:                  params.name,
        ticker,
        description:           params.description ?? null,
        image_url:             params.imageUrl ?? null,
        total_supply:          COIN_DEFAULTS.TOTAL_SUPPLY.toString(),
        curve_supply:          COIN_DEFAULTS.CURVE_SUPPLY.toString(),
        artist_supply:         COIN_DEFAULTS.ARTIST_SUPPLY.toString(),
        lp_supply:             COIN_DEFAULTS.LP_SUPPLY.toString(),
        reward_supply:         COIN_DEFAULTS.REWARD_SUPPLY.toString(),
        initial_market_cap:    COIN_DEFAULTS.INITIAL_MARKET_CAP.toString(),
        graduation_market_cap: COIN_DEFAULTS.GRADUATION_MARKET_CAP.toString(),
        trading_fee_bps:       Number(COIN_DEFAULTS.TRADING_FEE_BPS),
        artist_fee_share:      COIN_DEFAULTS.ARTIST_FEE_SHARE,
      })
      .select()
      .single();

    if (error) throw new Error(`Failed to create coin: ${error.message}`);

    // Seed vesting record for artist
    const now = new Date();
    const cliff = new Date(now); cliff.setMonth(cliff.getMonth() + 6);
    const end   = new Date(now); end.setFullYear(end.getFullYear() + 5);

    await supabase.from('coin_vesting').insert({
      coin_id:       data.id,
      artist_id:     params.artistId,
      total_locked:  COIN_DEFAULTS.ARTIST_SUPPLY.toString(),
      start_date:    now.toISOString(),
      cliff_date:    cliff.toISOString(),
      vest_end_date: end.toISOString(),
    });

    return data as ArtistCoinRow;
  },

  async getCoin(coinId: string): Promise<ArtistCoinRow | null> {
    const { data, error } = await supabase
      .from('artist_coins')
      .select('*')
      .eq('id', coinId)
      .single();

    if (error) return null;
    return data as ArtistCoinRow;
  },

  async getCoinByTicker(ticker: string): Promise<ArtistCoinRow | null> {
    const { data, error } = await supabase
      .from('artist_coins')
      .select('*')
      .ilike('ticker', ticker)
      .single();

    if (error) return null;
    return data as ArtistCoinRow;
  },

  async getArtistCoin(artistId: string): Promise<ArtistCoinRow | null> {
    const { data } = await supabase
      .from('artist_coins')
      .select('*')
      .eq('artist_id', artistId)
      .single();
    return data as ArtistCoinRow | null;
  },

  // ── Market Data ─────────────────────────────────────────────────────────────

  async getMarketList(options: {
    sortBy?: 'volume_24h' | 'bezy_raised' | 'created_at' | 'holder_count';
    status?: 'bonding' | 'graduated';
    limit?: number;
    offset?: number;
  } = {}): Promise<ArtistCoinRow[]> {
    const { sortBy = 'volume_24h', status, limit = 50, offset = 0 } = options;

    let query = supabase
      .from('artist_coins')
      .select('*')
      .order(sortBy, { ascending: false })
      .range(offset, offset + limit - 1);

    if (status) query = query.eq('status', status);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to fetch market list: ${error.message}`);
    return (data ?? []) as ArtistCoinRow[];
  },

  getCurrentPrice(row: ArtistCoinRow): bigint {
    return bondingCurveService.getCurrentPrice(rowToCoinState(row));
  },

  getGraduationProgress(row: ArtistCoinRow): number {
    return bondingCurveService.graduationProgress(rowToCoinState(row));
  },

  // ── Quote ───────────────────────────────────────────────────────────────────

  async quoteBuy(coinId: string, bezAmount: bigint): Promise<TradeQuote> {
    const row = await this.getCoin(coinId);
    if (!row) throw new Error('Coin not found');
    return bondingCurveService.quoteBuy(rowToCoinState(row), bezAmount);
  },

  async quoteSell(coinId: string, coinAmount: bigint): Promise<TradeQuote> {
    const row = await this.getCoin(coinId);
    if (!row) throw new Error('Coin not found');
    return bondingCurveService.quoteSell(rowToCoinState(row), coinAmount);
  },

  // ── Execute Buy ─────────────────────────────────────────────────────────────

  async executeBuy(
    userId: string,
    coinId: string,
    bezAmount: bigint,
    minCoinsOut: bigint = 0n,
  ): Promise<ExecuteTradeResult> {
    const row = await this.getCoin(coinId);
    if (!row) throw new Error('Coin not found');
    if (row.status === 'paused') throw new Error('Trading is paused for this coin');

    const state = rowToCoinState(row);
    const quote = bondingCurveService.quoteBuy(state, bezAmount);

    if (quote.coinAmount < minCoinsOut) {
      throw new Error(`Slippage exceeded: expected ${minCoinsOut}, got ${quote.coinAmount}`);
    }
    if (quote.coinAmount === 0n) {
      throw new Error('Trade too small');
    }

    // 1. Insert trade record
    const { data: trade, error: tradeErr } = await supabase
      .from('coin_trades')
      .insert({
        user_id:           userId,
        coin_id:           coinId,
        trade_type:        'buy',
        phase:             quote.phase,
        coin_amount:       quote.coinAmount.toString(),
        bezy_amount:       quote.bezAmount.toString(),
        price_per_coin:    quote.pricePerCoin.toString(),
        fee_bezy:          quote.fee.toString(),
        artist_fee_bezy:   quote.artistFee.toString(),
        treasury_fee_bezy: quote.treasuryFee.toString(),
        status:            'confirmed',
      })
      .select('id')
      .single();

    if (tradeErr) throw new Error(`Failed to record trade: ${tradeErr.message}`);

    // 2. Upsert user holding
    const { data: holding } = await supabase
      .from('coin_holdings')
      .select('balance, avg_buy_price, total_invested')
      .eq('user_id', userId)
      .eq('coin_id', coinId)
      .single();

    if (holding) {
      const oldBal = BigInt(holding.balance);
      const oldAvg = BigInt(holding.avg_buy_price);
      const newBal = oldBal + quote.coinAmount;
      const newAvg = newBal > 0n
        ? (oldBal * oldAvg + quote.coinAmount * quote.pricePerCoin) / newBal
        : 0n;

      await supabase
        .from('coin_holdings')
        .update({
          balance:        newBal.toString(),
          avg_buy_price:  newAvg.toString(),
          total_invested: (BigInt(holding.total_invested) + quote.bezAmount).toString(),
        })
        .eq('user_id', userId)
        .eq('coin_id', coinId);
    } else {
      await supabase.from('coin_holdings').insert({
        user_id:        userId,
        coin_id:        coinId,
        balance:        quote.coinAmount.toString(),
        avg_buy_price:  quote.pricePerCoin.toString(),
        total_invested: quote.bezAmount.toString(),
      });
    }

    // 3. Update coin state
    let coinUpdate: Record<string, unknown>;

    if (quote.phase === 'bonding') {
      const newSold   = state.curveSupplySold + quote.coinAmount;
      const newRaised = state.bezRaised + quote.bezAmount;

      if (quote.willGraduate) {
        const pool = bondingCurveService.computeGraduationPool(
          newRaised,
          BigInt(row.lp_supply),
        );
        coinUpdate = {
          curve_supply_sold: newSold.toString(),
          bezy_raised:       newRaised.toString(),
          status:            'graduated',
          graduated_at:      new Date().toISOString(),
          amm_bezy_reserve:  pool.ammBezReserve.toString(),
          amm_coin_reserve:  pool.ammCoinReserve.toString(),
        };
      } else {
        coinUpdate = {
          curve_supply_sold: newSold.toString(),
          bezy_raised:       newRaised.toString(),
        };
      }
    } else {
      // AMM phase: update reserves
      coinUpdate = {
        amm_bezy_reserve: (state.ammBezReserve + quote.bezAmount).toString(),
        amm_coin_reserve: (state.ammCoinReserve - quote.coinAmount).toString(),
      };
    }

    await supabase.from('artist_coins').update(coinUpdate).eq('id', coinId);

    // 4. Record artist earnings
    await supabase.from('artist_coin_earnings').insert({
      artist_id:      row.artist_id,
      coin_id:        coinId,
      trade_id:       trade.id,
      bezy_earned:    quote.artistFee.toString(),
    });

    // 5. Increment holder count if new holder
    if (!holding) {
      await supabase.rpc('increment_holder_count', { p_coin_id: coinId });
    }

    const updatedRow = await this.getCoin(coinId);
    const newPrice = updatedRow ? this.getCurrentPrice(updatedRow) : quote.pricePerCoin;

    return {
      trade: {
        id:           trade.id,
        coinAmount:   quote.coinAmount,
        bezAmount:    quote.bezAmount,
        fee:          quote.fee,
        pricePerCoin: quote.pricePerCoin,
      },
      newPrice,
      graduated: quote.willGraduate,
    };
  },

  // ── Execute Sell ────────────────────────────────────────────────────────────

  async executeSell(
    userId: string,
    coinId: string,
    coinAmount: bigint,
    minBezOut: bigint = 0n,
  ): Promise<ExecuteTradeResult> {
    const row = await this.getCoin(coinId);
    if (!row) throw new Error('Coin not found');
    if (row.status === 'paused') throw new Error('Trading is paused for this coin');

    // Check user has enough balance
    const { data: holding } = await supabase
      .from('coin_holdings')
      .select('balance, total_returned')
      .eq('user_id', userId)
      .eq('coin_id', coinId)
      .single();

    if (!holding || BigInt(holding.balance) < coinAmount) {
      throw new Error('Insufficient coin balance');
    }

    const state = rowToCoinState(row);
    const quote = bondingCurveService.quoteSell(state, coinAmount);

    if (quote.bezAmount < minBezOut) {
      throw new Error(`Slippage exceeded: expected ${minBezOut} BEZY, got ${quote.bezAmount}`);
    }

    // 1. Insert trade
    const { data: trade, error: tradeErr } = await supabase
      .from('coin_trades')
      .insert({
        user_id:           userId,
        coin_id:           coinId,
        trade_type:        'sell',
        phase:             quote.phase,
        coin_amount:       quote.coinAmount.toString(),
        bezy_amount:       quote.bezAmount.toString(),
        price_per_coin:    quote.pricePerCoin.toString(),
        fee_bezy:          quote.fee.toString(),
        artist_fee_bezy:   quote.artistFee.toString(),
        treasury_fee_bezy: quote.treasuryFee.toString(),
        status:            'confirmed',
      })
      .select('id')
      .single();

    if (tradeErr) throw new Error(`Failed to record trade: ${tradeErr.message}`);

    // 2. Update holding
    const newBal = BigInt(holding.balance) - coinAmount;
    await supabase
      .from('coin_holdings')
      .update({
        balance:        newBal.toString(),
        total_returned: (BigInt(holding.total_returned) + quote.bezAmount).toString(),
      })
      .eq('user_id', userId)
      .eq('coin_id', coinId);

    // 3. Update coin state
    let coinUpdate: Record<string, unknown>;
    if (quote.phase === 'bonding') {
      coinUpdate = {
        curve_supply_sold: (state.curveSupplySold - coinAmount).toString(),
        bezy_raised:       (state.bezRaised - quote.bezAmount).toString(),
      };
    } else {
      coinUpdate = {
        amm_bezy_reserve: (state.ammBezReserve - quote.bezAmount).toString(),
        amm_coin_reserve: (state.ammCoinReserve + coinAmount).toString(),
      };
    }
    await supabase.from('artist_coins').update(coinUpdate).eq('id', coinId);

    // 4. Artist earnings
    await supabase.from('artist_coin_earnings').insert({
      artist_id:   row.artist_id,
      coin_id:     coinId,
      trade_id:    trade.id,
      bezy_earned: quote.artistFee.toString(),
    });

    // 5. Decrement holder count if balance now zero
    if (newBal === 0n) {
      await supabase.rpc('decrement_holder_count', { p_coin_id: coinId });
    }

    const updatedRow = await this.getCoin(coinId);
    const newPrice = updatedRow ? this.getCurrentPrice(updatedRow) : quote.pricePerCoin;

    return {
      trade: {
        id:           trade.id,
        coinAmount:   quote.coinAmount,
        bezAmount:    quote.bezAmount,
        fee:          quote.fee,
        pricePerCoin: quote.pricePerCoin,
      },
      newPrice,
      graduated: false,
    };
  },

  // ── Holdings & History ──────────────────────────────────────────────────────

  async getUserHoldings(userId: string): Promise<Array<{
    holding: { balance: bigint; avgBuyPrice: bigint; totalInvested: bigint; totalReturned: bigint };
    coin: ArtistCoinRow;
    currentValue: bigint;
    unrealizedPnl: bigint;
  }>> {
    const { data, error } = await supabase
      .from('coin_holdings')
      .select('*, artist_coins(*)')
      .eq('user_id', userId)
      .gt('balance', '0')
      .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to fetch holdings: ${error.message}`);

    return (data ?? []).map((row: any) => {
      const coin = row.artist_coins as ArtistCoinRow;
      const balance = BigInt(row.balance);
      const avgBuyPrice = BigInt(row.avg_buy_price);
      const price = this.getCurrentPrice(coin);
      const currentValue = (balance * price) / COIN_DEFAULTS.TOTAL_SUPPLY; // scale down

      return {
        holding: {
          balance,
          avgBuyPrice,
          totalInvested: BigInt(row.total_invested),
          totalReturned: BigInt(row.total_returned),
        },
        coin,
        currentValue,
        unrealizedPnl: currentValue - (balance * avgBuyPrice) / COIN_DEFAULTS.TOTAL_SUPPLY,
      };
    });
  },

  async getTradeHistory(coinId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('coin_trades')
      .select('*, users(username, avatar_url)')
      .eq('coin_id', coinId)
      .eq('status', 'confirmed')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch trades: ${error.message}`);
    return data ?? [];
  },

  async getUserTradeHistory(userId: string, limit = 50): Promise<any[]> {
    const { data, error } = await supabase
      .from('coin_trades')
      .select('*, artist_coins(name, ticker, image_url)')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Failed to fetch user trades: ${error.message}`);
    return data ?? [];
  },

  // ── Perks ───────────────────────────────────────────────────────────────────

  async getUnlockedPerks(userId: string, coinId: string): Promise<any[]> {
    const { data: holding } = await supabase
      .from('coin_holdings')
      .select('balance')
      .eq('user_id', userId)
      .eq('coin_id', coinId)
      .single();

    if (!holding || BigInt(holding.balance) === 0n) return [];

    const { data: perks } = await supabase
      .from('coin_perks')
      .select('*')
      .eq('coin_id', coinId)
      .eq('active', true)
      .lte('min_balance', holding.balance)
      .order('min_balance', { ascending: true });

    return perks ?? [];
  },

  // ── Artist Earnings ─────────────────────────────────────────────────────────

  async getArtistEarnings(artistId: string): Promise<{
    totalBezyEarned: bigint;
    byCoins: Array<{ coinId: string; ticker: string; earned: bigint }>;
  }> {
    const { data, error } = await supabase
      .from('artist_coin_earnings')
      .select('bezy_earned, coin_id, artist_coins(ticker)')
      .eq('artist_id', artistId);

    if (error) throw new Error(`Failed to fetch earnings: ${error.message}`);

    const byCoins = new Map<string, { ticker: string; earned: bigint }>();
    let total = 0n;

    for (const row of data ?? []) {
      const earned = BigInt(row.bezy_earned);
      total += earned;
      const existing = byCoins.get(row.coin_id);
      if (existing) {
        existing.earned += earned;
      } else {
        byCoins.set(row.coin_id, {
          ticker: (row.artist_coins as any)?.ticker ?? '???',
          earned,
        });
      }
    }

    return {
      totalBezyEarned: total,
      byCoins: Array.from(byCoins.entries()).map(([coinId, v]) => ({
        coinId,
        ...v,
      })),
    };
  },
};
