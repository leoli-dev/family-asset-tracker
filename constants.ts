
import { AssetCategory, Currency } from './types';

export const CATEGORY_COLORS: Record<AssetCategory, string> = {
  [AssetCategory.STOCK]: '#3b82f6', // Blue 500
  [AssetCategory.CRYPTO]: '#8b5cf6', // Violet 500
  [AssetCategory.CASH]: '#10b981', // Emerald 500
  [AssetCategory.REAL_ESTATE]: '#f59e0b', // Amber 500
  [AssetCategory.INSURANCE]: '#06b6d4', // Cyan 500
  [AssetCategory.LIABILITY]: '#ef4444', // Red 500
  [AssetCategory.OTHER]: '#64748b', // Slate 500
};

export const CURRENCY_FLAGS: Record<Currency, string> = {
  [Currency.USD]: '🇺🇸',
  [Currency.EUR]: '🇪🇺',
  [Currency.JPY]: '🇯🇵',
  [Currency.GBP]: '🇬🇧',
  [Currency.CNY]: '🇨🇳',
  [Currency.AUD]: '🇦🇺',
  [Currency.CAD]: '🇨🇦',
  [Currency.CHF]: '🇨🇭',
  [Currency.HKD]: '🇭🇰',
  [Currency.SGD]: '🇸🇬',
  [Currency.SEK]: '🇸🇪',
  [Currency.KRW]: '🇰🇷',
  [Currency.NOK]: '🇳🇴',
  [Currency.NZD]: '🇳🇿',
  [Currency.INR]: '🇮🇳',
  [Currency.MXN]: '🇲🇽',
  [Currency.TWD]: '🇹🇼',
  [Currency.ZAR]: '🇿🇦',
  [Currency.BRL]: '🇧🇷',
  [Currency.DKK]: '🇩🇰',
  [Currency.PLN]: '🇵🇱',
  [Currency.THB]: '🇹🇭',
  [Currency.IDR]: '🇮🇩',
  [Currency.MYR]: '🇲🇾',
  [Currency.VND]: '🇻🇳'
};
