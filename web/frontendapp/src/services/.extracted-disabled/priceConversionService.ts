/**
 * Price Conversion Service
 * Handles currency conversions for SOL, BEZY, and USDC
 */

export interface PriceData {
  SOL: number; // Price in USD
  BEZY: number; // Price in USD
  USDC: number; // Always 1.0
}

class PriceConversionService {
  private prices: PriceData = {
    SOL: 150, // Default SOL price (will be fetched)
    BEZY: 0.02, // BEZY price in USD
    USDC: 1.0, // USDC is always $1
  };

  private lastUpdate = 0;
  private updateInterval = 5 * 60 * 1000; // Update every 5 minutes

  /**
   * Fetch current prices from price feeds
   */
  async fetchPrices(): Promise<PriceData> {
    const now = Date.now();

    // Only fetch if cache expired or prices never fetched
    if (now - this.lastUpdate < this.updateInterval && this.lastUpdate > 0) {
      return this.prices;
    }

    try {
      // Fetch SOL price from CoinGecko (free API, no auth needed)
      const solPrice = await this.fetchSOLPrice();
      if (solPrice > 0) {
        this.prices.SOL = solPrice;
      }

      this.lastUpdate = now;
      console.log('💰 Price update:', this.prices);
      return this.prices;
    } catch (error) {
      console.warn('⚠️ Failed to fetch prices, using defaults:', error);
      return this.prices;
    }
  }

  /**
   * Fetch SOL price from CoinGecko
   */
  private async fetchSOLPrice(): Promise<number> {
    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana&vs_currencies=usd'
      );

      if (!response.ok) throw new Error('Failed to fetch SOL price');

      const data = await response.json();
      const solPrice = data.solana?.usd;

      if (solPrice && typeof solPrice === 'number') {
        console.log(`📊 SOL price: $${solPrice.toFixed(2)}`);
        return solPrice;
      }
      return this.prices.SOL;
    } catch (error) {
      console.warn('⚠️ Could not fetch SOL price from CoinGecko:', error);
      return this.prices.SOL;
    }
  }

  /**
   * Convert USD amount to different currencies
   */
  convertFromUSD(usdAmount: number): {
    SOL: number;
    BEZY: number;
    USDC: number;
  } {
    return {
      SOL: usdAmount / this.prices.SOL,
      BEZY: usdAmount / this.prices.BEZY,
      USDC: usdAmount, // 1:1 with USD
    };
  }

  /**
   * Convert from a currency to USD
   */
  convertToUSD(amount: number, fromCurrency: 'SOL' | 'BEZY' | 'USDC'): number {
    return amount * this.prices[fromCurrency];
  }

  /**
   * Get current prices
   */
  getPrices(): PriceData {
    return { ...this.prices };
  }

  /**
   * Set BEZY price (from streaming dashboard)
   */
  setBEZYPrice(price: number): void {
    this.prices.BEZY = price;
    console.log(`💰 BEZY price updated: $${price.toFixed(4)}`);
  }

  /**
   * Set SOL price manually (fallback)
   */
  setSOLPrice(price: number): void {
    this.prices.SOL = price;
    console.log(`💰 SOL price updated: $${price.toFixed(2)}`);
  }
}

export const priceConversionService = new PriceConversionService();
