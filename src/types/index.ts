// Core type definitions for the trade journal application

export interface User {
  id: string;
  username: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  status: 'OPEN' | 'RUNNING' | 'TARGET_HIT' | 'STOP_LOSS_HIT' | 'CLOSED' | 'PARTIAL';
  strategy: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  stopLoss: number;
  target: number;
  entryTime: string;
  exitTime?: string;
  notes: string;
  setupScreenshot?: string;
  tags: string[];
  isShared: boolean;
  sharedWith: string[];
  visibility: 'PUBLIC' | 'PRIVATE' | 'SPECIFIC';
  pnl?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  tradeId: string;
  userId: string;
  content: string;
  parentId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TradeTemplate {
  id: string;
  userId: string;
  name: string;
  description: string;
  entryRules: string;
  stopLossMethod: string;
  targetMethod: string;
  riskRewardRatio: number;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  type: 'TRADE_SHARED' | 'COMMENT' | 'TRADE_UPDATE' | 'FOLLOW';
  title: string;
  message: string;
  isRead: boolean;
  relatedTradeId?: string;
  fromUserId?: string;
  createdAt: string;
}

export interface TradeAnalytics {
  totalTrades: number;
  winRate: number;
  avgRiskReward: number;
  totalPnL: number;
  bestStrategy: string;
  worstStrategy: string;
  monthlyPerformance: Array<{
    month: string;
    pnl: number;
    trades: number;
  }>;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

export interface TradeFilters {
  status?: Trade['status'];
  strategy?: string;
  symbol?: string;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
}