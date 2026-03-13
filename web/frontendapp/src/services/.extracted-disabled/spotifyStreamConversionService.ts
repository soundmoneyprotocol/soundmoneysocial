/**
 * Spotify Stream to BEZY Conversion Service
 * Converts Spotify track popularity and streams to BEZY token value
 */

import { priceConversionService } from './priceConversionService';

export interface StreamConversionConfig {
  // Base stream estimates for different popularity ranges
  minPopularityStreams: number; // Estimated streams for popularity 0
  maxPopularityStreams: number; // Estimated streams for popularity 100

  // BEZY conversion rates
  bezyPerStream: number; // Direct BEZY per stream conversion

  // Bonuses
  energyBonus: number; // Energy level multiplier
  danceabilityBonus: number; // Danceability multiplier
  acousticnessBonus: number; // Acousticness multiplier

  // Caps
  maxEstimatedStreams: number; // Maximum estimated streams
  minEstimatedStreams: number; // Minimum estimated streams
}

/**
 * Default configuration for stream conversion
 * Based on Spotify's popularity distribution
 */
const DEFAULT_CONFIG: StreamConversionConfig = {
  // Popularity 0 = ~1,000 streams, Popularity 100 = ~100M+ streams
  minPopularityStreams: 1000,
  maxPopularityStreams: 50000000,

  // Base BEZY per stream: 0.000001 BEZY per stream
  // This means 1 million streams = 1 BEZY
  bezyPerStream: 0.000001,

  // Audio feature bonuses
  energyBonus: 1.1, // High energy tracks worth 10% more
  danceabilityBonus: 1.15, // Danceable tracks worth 15% more
  acousticnessBonus: 1.05, // Acoustic tracks worth 5% more

  // Caps to prevent extreme values
  maxEstimatedStreams: 100000000, // 100M max streams
  minEstimatedStreams: 1000, // 1K minimum streams
};

class SpotifyStreamConversionService {
  private config: StreamConversionConfig = DEFAULT_CONFIG;

  /**
   * Estimate streams based on Spotify popularity score
   * Uses logarithmic distribution to match real-world stream patterns
   */
  estimateStreamsByPopularity(popularity: number): number {
    if (popularity < 0 || popularity > 100) {
      throw new Error('Popularity must be between 0 and 100');
    }

    // Use logarithmic scale for more realistic stream estimates
    // Maps popularity 0-100 to streams range
    const popularityFraction = popularity / 100;

    // Logarithmic formula: log(x) distribution gives us more realistic spread
    const logStreams =
      Math.log(this.config.maxPopularityStreams / this.config.minPopularityStreams) *
      popularityFraction +
      Math.log(this.config.minPopularityStreams);

    const estimatedStreams = Math.exp(logStreams);

    // Apply caps
    return Math.min(
      this.config.maxEstimatedStreams,
      Math.max(this.config.minEstimatedStreams, estimatedStreams)
    );
  }

  /**
   * Calculate audio feature multiplier for bonus BEZY
   */
  calculateAudioFeatureMultiplier(audioFeatures: {
    energy?: number;
    danceability?: number;
    acousticness?: number;
  }): number {
    let multiplier = 1.0;

    // Energy bonus: tracks with high energy get 10% bonus
    if (audioFeatures.energy && audioFeatures.energy > 0.7) {
      multiplier *= this.config.energyBonus;
    }

    // Danceability bonus: danceable tracks get 15% bonus
    if (audioFeatures.danceability && audioFeatures.danceability > 0.7) {
      multiplier *= this.config.danceabilityBonus;
    }

    // Acousticness bonus: acoustic tracks get 5% bonus
    if (audioFeatures.acousticness && audioFeatures.acousticness > 0.5) {
      multiplier *= this.config.acousticnessBonus;
    }

    return multiplier;
  }

  /**
   * Convert estimated streams to BEZY value
   */
  convertStreamsToBEZY(streams: number, audioFeatureMultiplier: number = 1.0): number {
    const baseBezy = streams * this.config.bezyPerStream;
    const bonusBezy = baseBezy * (audioFeatureMultiplier - 1);
    return baseBezy + bonusBezy;
  }

  /**
   * Get complete BEZY value for a track based on popularity and audio features
   */
  calculateTrackBezyValue(
    popularity: number,
    audioFeatures?: {
      energy?: number;
      danceability?: number;
      acousticness?: number;
    }
  ): {
    estimatedStreams: number;
    audioFeatureMultiplier: number;
    baseBezy: number;
    bonusBezy: number;
    totalBezy: number;
  } {
    const estimatedStreams = this.estimateStreamsByPopularity(popularity);
    const audioFeatureMultiplier = audioFeatures
      ? this.calculateAudioFeatureMultiplier(audioFeatures)
      : 1.0;

    const baseBezy = estimatedStreams * this.config.bezyPerStream;
    const bonusBezy = baseBezy * (audioFeatureMultiplier - 1);
    const totalBezy = baseBezy + bonusBezy;

    return {
      estimatedStreams,
      audioFeatureMultiplier,
      baseBezy,
      bonusBezy,
      totalBezy,
    };
  }

  /**
   * Get USD value of calculated BEZY
   */
  async getBezyUsdValue(bezy: number): Promise<number> {
    return priceConversionService.convertToUSD(bezy, 'BEZY');
  }

  /**
   * Update conversion configuration
   */
  setConfig(config: Partial<StreamConversionConfig>): void {
    this.config = { ...this.config, ...config };
    console.log('💰 Stream conversion config updated:', this.config);
  }

  /**
   * Get current configuration
   */
  getConfig(): StreamConversionConfig {
    return { ...this.config };
  }

  /**
   * Reset to default configuration
   */
  resetConfig(): void {
    this.config = { ...DEFAULT_CONFIG };
    console.log('🔄 Stream conversion config reset to defaults');
  }
}

export const spotifyStreamConversionService = new SpotifyStreamConversionService();
export type { StreamConversionConfig };
