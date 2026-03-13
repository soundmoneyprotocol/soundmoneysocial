/**
 * Format BZY values to avoid cluttered decimal displays
 * Removes trailing zeros and limits decimal places
 */
export const formatBZY = (value: number, maxDecimalPlaces: number = 6): string => {
  if (value === 0) return '0';

  // Format with max decimal places
  const formatted = value.toFixed(maxDecimalPlaces);

  // Remove trailing zeros
  const trimmed = formatted.replace(/\.?0+$/, '');

  return trimmed || '0';
};

/**
 * Format BZY for compact display (shorter decimals)
 */
export const formatBZYCompact = (value: number): string => {
  return formatBZY(value, 4);
};
