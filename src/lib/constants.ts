import { TradeStrategy, TradeSession, TradeTag, NewsImpact, NewsEventType } from '@/types'

export const FOREX_PAIRS = [
  'XAUUSD','EURUSD','GBPUSD','USDJPY','GBPJPY',
  'AUDUSD','USDCAD','USDCHF','NZDUSD','EURGBP',
  'NAS100','US30','SPX500',
]

export const STRATEGIES: TradeStrategy[] = [
  'SMC','ICT','Scalping','Breakout','Other',
]

export const SESSIONS: TradeSession[] = [
  'Asian','London','New York',
]

export const TAGS: TradeTag[] = [
  '#SMC','#ICT','#Scalp','#PerfectSetup','#Mistake',
]

export const CURRENCIES = ['USD','EUR','GBP','JPY','AUD','CAD','CHF','NZD']

export const NEWS_TYPES: NewsEventType[] = [
  'CPI','NFP','FOMC','GDP','PMI','Other',
]

export const IMPACT_COLORS: Record<NewsImpact, string> = {
  Low:    'text-emerald-400',
  Medium: 'text-yellow-400',
  High:   'text-red-400',
}

export const MISTAKE_TYPES = [
  'None','FOMO','Revenge Trading','Early Exit','No Stop Loss',
]
