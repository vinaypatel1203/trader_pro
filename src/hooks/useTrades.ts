import { useState, useEffect } from 'react';
import { Trade, TradeFilters, TradeAnalytics } from '../types';
import { useAuth } from './useAuth.tsx';
import { supabase } from '../lib/supabase';

interface Strategy {
  id: string;
  name: string;
  description: string;
}

export const useTrades = () => {
  const { user } = useAuth();
  const [trades, setTrades] = useState<Trade[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<TradeFilters>({});

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      
      setLoading(true);
      
      try {
        // First, fetch strategies separately
        const { data: strategiesData, error: strategiesError } = await supabase
          .from('strategies')
          .select('*')
          .eq('user_id', user.id)
          .order('name');

        if (strategiesError) throw strategiesError;
        const strategiesMap = new Map(strategiesData?.map(s => [s.id, s.name]) || []);
        setStrategies(strategiesData || []);

        // Then fetch trades without joining strategies
        const { data: tradesData, error: tradesError } = await supabase
          .from('trades')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (tradesError) throw tradesError;

        // Transform data to match Trade interface, looking up strategy names
        const transformedTrades: Trade[] = (tradesData || []).map(trade => ({
          id: trade.id,
          userId: trade.user_id,
          symbol: trade.symbol,
          type: trade.type,
          status: trade.status,
          strategy: strategiesMap.get(trade.strategy_id) || 'Unknown',
          entryPrice: Number(trade.entry_price),
          exitPrice: trade.exit_price ? Number(trade.exit_price) : undefined,
          quantity: trade.quantity,
          stopLoss: Number(trade.stop_loss),
          target: Number(trade.target),
          entryTime: trade.entry_time,
          exitTime: trade.exit_time,
          notes: trade.notes,
          setupScreenshot: trade.setup_screenshot,
          tags: trade.tags || [],
          isShared: trade.is_shared,
          sharedWith: [], // Will be populated separately if needed
          visibility: trade.visibility,
          pnl: trade.pnl ? Number(trade.pnl) : undefined,
          createdAt: trade.created_at,
          updatedAt: trade.updated_at
        }));

        setTrades(transformedTrades);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
      setLoading(false);
    };

    fetchData();
  }, [user]);

  const createTrade = async (tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>): Promise<Trade | null> => {
    if (!user) return null;

    try {
      // Find strategy ID
      const strategy = strategies.find(s => s.name === tradeData.strategy);
      
      const { data, error } = await supabase
        .from('trades')
        .insert({
          user_id: user.id,
          symbol: tradeData.symbol,
          type: tradeData.type,
          status: tradeData.status,
          strategy_id: strategy?.id || null,
          entry_price: tradeData.entryPrice,
          exit_price: tradeData.exitPrice,
          quantity: tradeData.quantity,
          stop_loss: tradeData.stopLoss,
          target: tradeData.target,
          entry_time: tradeData.entryTime,
          exit_time: tradeData.exitTime,
          notes: tradeData.notes,
          setup_screenshot: tradeData.setupScreenshot,
          tags: tradeData.tags,
          is_shared: tradeData.isShared,
          visibility: tradeData.visibility,
          pnl: tradeData.pnl
        })
        .select()
        .single();

      if (error) throw error;

      const newTrade: Trade = {
        id: data.id,
        userId: data.user_id,
        symbol: data.symbol,
        type: data.type,
        status: data.status,
        strategy: tradeData.strategy,
        entryPrice: Number(data.entry_price),
        exitPrice: data.exit_price ? Number(data.exit_price) : undefined,
        quantity: data.quantity,
        stopLoss: Number(data.stop_loss),
        target: Number(data.target),
        entryTime: data.entry_time,
        exitTime: data.exit_time,
        notes: data.notes,
        setupScreenshot: data.setup_screenshot,
        tags: data.tags || [],
        isShared: data.is_shared,
        sharedWith: [],
        visibility: data.visibility,
        pnl: data.pnl ? Number(data.pnl) : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setTrades(prev => [newTrade, ...prev]);
      return newTrade;
    } catch (error) {
      console.error('Error creating trade:', error);
      return null;
    }
  };

  const updateTrade = async (id: string, updates: Partial<Trade>): Promise<Trade | null> => {
    try {
      const strategy = strategies.find(s => s.name === updates.strategy);
      
      const { data, error } = await supabase
        .from('trades')
        .update({
          symbol: updates.symbol,
          type: updates.type,
          status: updates.status,
          strategy_id: strategy?.id,
          entry_price: updates.entryPrice,
          exit_price: updates.exitPrice,
          quantity: updates.quantity,
          stop_loss: updates.stopLoss,
          target: updates.target,
          entry_time: updates.entryTime,
          exit_time: updates.exitTime,
          notes: updates.notes,
          setup_screenshot: updates.setupScreenshot,
          tags: updates.tags,
          is_shared: updates.isShared,
          visibility: updates.visibility,
          pnl: updates.pnl,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedTrade: Trade = {
        id: data.id,
        userId: data.user_id,
        symbol: data.symbol,
        type: data.type,
        status: data.status,
        strategy: updates.strategy || 'Unknown',
        entryPrice: Number(data.entry_price),
        exitPrice: data.exit_price ? Number(data.exit_price) : undefined,
        quantity: data.quantity,
        stopLoss: Number(data.stop_loss),
        target: Number(data.target),
        entryTime: data.entry_time,
        exitTime: data.exit_time,
        notes: data.notes,
        setupScreenshot: data.setup_screenshot,
        tags: data.tags || [],
        isShared: data.is_shared,
        sharedWith: [],
        visibility: data.visibility,
        pnl: data.pnl ? Number(data.pnl) : undefined,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setTrades(prev => prev.map(t => t.id === id ? updatedTrade : t));
      return updatedTrade;
    } catch (error) {
      console.error('Error updating trade:', error);
      return null;
    }
  };

  const deleteTrade = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('trades')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setTrades(prev => prev.filter(t => t.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting trade:', error);
      return false;
    }
  };

  const createStrategy = async (name: string, description: string): Promise<Strategy | null> => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('strategies')
        .insert({
          user_id: user.id,
          name,
          description
        })
        .select()
        .single();

      if (error) throw error;

      const newStrategy: Strategy = {
        id: data.id,
        name: data.name,
        description: data.description
      };

      setStrategies(prev => [...prev, newStrategy]);
      return newStrategy;
    } catch (error) {
      console.error('Error creating strategy:', error);
      return null;
    }
  };

  const deleteStrategy = async (id: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('strategies')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setStrategies(prev => prev.filter(s => s.id !== id));
      return true;
    } catch (error) {
      console.error('Error deleting strategy:', error);
      return false;
    }
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
    strategies,
    loading,
    filters,
    setFilters,
    createTrade,
    updateTrade,
    deleteTrade,
    createStrategy,
    deleteStrategy,
    getTradeAnalytics
  };
};