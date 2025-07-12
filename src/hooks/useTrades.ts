import { useState, useEffect } from 'react';
import { Trade, TradeFilters, TradeAnalytics } from '../types';
import { useAuth } from './useAuth.tsx';

// Mock data for demonstration
const mockTrades: Trade[] = [
  {
    id: '1',
    userId: '1',
    symbol: 'NIFTY',
    type: 'BUY',
    status: 'TARGET_HIT',
    strategy: 'Breakout',
    entryPrice: 19800,
    exitPrice: 19950,
    quantity: 50,
    stopLoss: 19750,
    target: 19950,
    entryTime: '2024-01-15T09:30:00Z',
    exitTime: '2024-01-15T14:30:00Z',
    notes: 'Clean breakout above resistance with good volume',
    setupScreenshot: 'https://images.pexels.com/photos/6801648/pexels-photo-6801648.jpeg',
    tags: ['nifty', 'breakout', 'intraday'],
    isShared: true,
    sharedWith: [],
    visibility: 'PUBLIC',
    pnl: 7500,
    createdAt: '2024-01-15T09:30:00Z',
    updatedAt: '2024-01-15T14:30:00Z'
  },
  {
    id: '2',
    userId: '1',
    symbol: 'BANKNIFTY',
    type: 'SELL',
    status: 'RUNNING',
    strategy: 'Reversal',
    entryPrice: 45200,
    quantity: 25,
    stopLoss: 45350,
    target: 44900,
    entryTime: '2024-01-16T10:15:00Z',
    notes: 'Rejection at key resistance level with bearish divergence',
    setupScreenshot: 'https://images.pexels.com/photos/6802042/pexels-photo-6802042.jpeg',
    tags: ['banknifty', 'reversal', 'swing'],
    isShared: false,
    sharedWith: [],
    visibility: 'PRIVATE',
    createdAt: '2024-01-16T10:15:00Z',
    updatedAt: '2024-01-16T10:15:00Z'
  },
  {
    id: '3',
    userId: '1',
    symbol: 'RELIANCE',
    type: 'BUY',
    status: 'STOP_LOSS_HIT',
    strategy: 'Support Bounce',
    entryPrice: 2450,
    exitPrice: 2420,
    quantity: 100,
    stopLoss: 2420,
    target: 2520,
    entryTime: '2024-01-14T11:00:00Z',
    exitTime: '2024-01-14T13:45:00Z',
    notes: 'Support failed to hold, quick exit taken',
    tags: ['stocks', 'support', 'swing'],
    isShared: true,
    sharedWith: ['user2', 'user3'],
    visibility: 'SPECIFIC',
    pnl: -3000,
    createdAt: '2024-01-14T11:00:00Z',
    updatedAt: '2024-01-14T13:45:00Z'
  }
];

export const useTrades = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TradeFilters>({});

  useEffect(() => {
    // Simulate API call
    const fetchTrades = async () => {
      setLoading(true);
      await new Promise(resolve => setTimeout(resolve, 500));
      setTrades(mockTrades);
      setLoading(false);
    };

    if (user) {
      fetchTrades();
    }
  }, [user]);

  const createTrade = async (tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Trade> => {
    const newTrade: Trade = {
      ...tradeData,
      id: Date.now().toString(),
      userId: user!.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setTrades(prev => [newTrade, ...prev]);
    return newTrade;
  };

  const updateTrade = async (id: string, updates: Partial<Trade>): Promise<Trade | null> => {
    const tradeIndex = trades.findIndex(t => t.id === id);
    if (tradeIndex === -1) return null;

    const updatedTrade = {
      ...trades[tradeIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    setTrades(prev => prev.map(t => t.id === id ? updatedTrade : t));
    return updatedTrade;
  };

  const deleteTrade = async (id: string): Promise<boolean> => {
    setTrades(prev => prev.filter(t => t.id !== id));
    return true;
  };

  const getTradeAnalytics = (): TradeAnalytics => {
    const completedTrades = trades.filter(t => ['TARGET_HIT', 'STOP_LOSS_HIT', 'CLOSED'].includes(t.status));
    const winningTrades = completedTrades.filter(t => (t.pnl || 0) > 0);
    
    return {
      totalTrades: trades.length,
      winRate: completedTrades.length > 0 ? (winningTrades.length / completedTrades.length) * 100 : 0,
      avgRiskReward: 1.5, // Mock calculation
      totalPnL: trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0),
      bestStrategy: 'Breakout',
      worstStrategy: 'Support Bounce',
      monthlyPerformance: [
        { month: '2024-01', pnl: 4500, trades: 3 },
        { month: '2024-02', pnl: 7200, trades: 5 },
        { month: '2024-03', pnl: 2800, trades: 4 }
      ]
    };
  };

  const filteredTrades = trades.filter(trade => {
    if (filters.status && trade.status !== filters.status) return false;
    if (filters.strategy && trade.strategy !== filters.strategy) return false;
    if (filters.symbol && trade.symbol !== filters.symbol) return false;
    if (filters.tags && !filters.tags.every(tag => trade.tags.includes(tag))) return false;
    return true;
  });

  return {
    trades: filteredTrades,
    loading,
    filters,
    setFilters,
    createTrade,
    updateTrade,
    deleteTrade,
    getTradeAnalytics
  };
};