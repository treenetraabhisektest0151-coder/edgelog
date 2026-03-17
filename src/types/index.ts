// ── Enums ──────────────────────────────────────────────────────
export type TradeDirection = 'BUY' | 'SELL'
export type TradeSession   = 'Asian' | 'London' | 'New York'
export type TradeStrategy  = 'SMC' | 'ICT' | 'Scalping' | 'Breakout' | 'Other'
export type TradeStatus    = 'WIN' | 'LOSS' | 'BREAKEVEN' | 'OPEN'
export type MistakeType    = 'None' | 'FOMO' | 'Revenge Trading' | 'Early Exit' | 'No Stop Loss'
export type NewsImpact     = 'Low' | 'Medium' | 'High'
export type NewsEventType  = 'CPI' | 'NFP' | 'FOMC' | 'GDP' | 'PMI' | 'Other'
export type TradeTag       = '#SMC' | '#ICT' | '#Scalp' | '#PerfectSetup' | '#Mistake'

// ── Core models ────────────────────────────────────────────────
export interface Trade {
  id: string
  userId: string
  createdAt: string

  date: string
  time: string
  pair: string
  session: TradeSession
  direction: TradeDirection
  strategy: TradeStrategy
  status: TradeStatus
  tags: TradeTag[]

  entryPrice: number
  stopLoss: number
  takeProfit: number
  exitPrice: number

  lotSize: number
  riskPercent: number
  accountBalance: number

  profitLoss: number
  riskReward: number
  pips: number

  mood: number
  confidence: number
  fear: number
  discipline: boolean
  mistakeType: MistakeType
  notes: string

  tradedDuringNews: boolean
  newsEventId?: string

  beforeImage?: string
  afterImage?: string
  markupImage?: string
}

export interface NewsEvent {
  id: string
  userId: string
  date: string
  time: string
  currency: string
  title: string
  impact: NewsImpact
  type: NewsEventType
  notes?: string
}

export interface UserProfile {
  uid: string
  email: string
  displayName: string
  startingBalance: number
  currency: string
  riskPerTrade: number
  broker?: string
  createdAt: string
}

// ── Derived stats ──────────────────────────────────────────────
export interface AccountStats {
  balance: number
  totalPnL: number
  todayPnL: number
  weekPnL: number
  monthPnL: number
  totalTrades: number
  wins: number
  losses: number
  winRate: number
  avgRR: number
  profitFactor: number
  maxDrawdown: number
  bestTrade: number
  worstTrade: number
  currentStreak: number
}

export interface EquityPoint {
  label: string
  equity: number
  drawdown: number
}

export interface DayStats {
  date: string
  pnl: number
  trades: number
  wins: number
  losses: number
}

// ── Filter types ───────────────────────────────────────────────
export interface TradeFilters {
  dateFrom: string
  dateTo: string
  pair: string
  strategy: string
  status: string
  tags: TradeTag[]
}