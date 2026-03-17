export const FOREX_PAIRS = [
  // Majors
  'EURUSD','GBPUSD','USDJPY','USDCHF','AUDUSD','USDCAD','NZDUSD',
  // Minors
  'EURGBP','EURJPY','GBPJPY','EURAUD','EURCAD','EURCHF','EURNZD',
  'GBPAUD','GBPCAD','GBPNZD','GBPCHF','AUDJPY','CADJPY','NZDJPY',
  'AUDCAD','AUDNZD','AUDCHF','CADCHF','NZDCAD',
  // Exotics
  'USDZAR','USDMXN','USDTRY','USDSEK','USDNOK',
  // Metals & crypto
  'XAUUSD','XAGUSD','BTCUSD','ETHUSD',
  // Indices
  'US30','US100','US500','UK100','GER40',
] as const

export const SESSIONS   = ['Asian','London','New York'] as const
export const STRATEGIES = ['SMC','ICT','Scalping','Breakout','Other'] as const
export const TAGS       = ['#SMC','#ICT','#Scalp','#PerfectSetup','#Mistake'] as const
export const MISTAKES   = ['None','FOMO','Revenge Trading','Early Exit','No Stop Loss'] as const
export const NEWS_TYPES = ['CPI','NFP','FOMC','GDP','PMI','Other'] as const
export const CURRENCIES = ['USD','EUR','GBP','JPY','AUD','CAD','NZD','CHF','XAU','BTC'] as const

export const SESSION_COLORS: Record<string,string> = {
  'Asian':    '#3b82f6',
  'London':   '#f59e0b',
  'New York': '#10b981',
}
export const STRATEGY_COLORS: Record<string,string> = {
  SMC:      '#f59e0b',
  ICT:      '#3b82f6',
  Scalping: '#10b981',
  Breakout: '#8b5cf6',
  Other:    '#6b7280',
}
export const IMPACT_COLORS: Record<string,string> = {
  Low:    '#10b981',
  Medium: '#f59e0b',
  High:   '#ef4444',
}
