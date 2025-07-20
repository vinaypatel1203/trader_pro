import React, { useState, useEffect } from 'react';
import { Share2, Eye, MessageCircle, Heart, Filter, Search, Users } from 'lucide-react';
import { TradeCard } from '../trade/TradeCard';
import { Trade } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

export const SharedTrades: React.FC = () => {
  const { user } = useAuth();
  const [sharedTrades, setSharedTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'following' | 'public'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchSharedTrades();
  }, [filter, user]);

  const fetchSharedTrades = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('trades')
        .select(`
          *,
          strategies(name),
          profiles(username, avatar_url)
        `)
        .eq('is_shared', true)
        .order('created_at', { ascending: false });

      if (filter === 'public') {
        query = query.eq('visibility', 'PUBLIC');
      } else if (filter === 'following') {
        // Get trades from users we follow
        const { data: following } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id);
        
        if (following && following.length > 0) {
          const followingIds = following.map(f => f.following_id);
          query = query.in('user_id', followingIds);
        } else {
          setSharedTrades([]);
          setLoading(false);
          return;
        }
      }

      const { data, error } = await query;
      
      if (error) throw error;

      const transformedTrades: Trade[] = (data || []).map(trade => ({
        id: trade.id,
        userId: trade.user_id,
        symbol: trade.symbol,
        type: trade.type,
        status: trade.status,
        strategy: trade.strategies?.name || 'Unknown',
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
        sharedWith: [],
        visibility: trade.visibility,
        pnl: trade.pnl ? Number(trade.pnl) : undefined,
        createdAt: trade.created_at,
        updatedAt: trade.updated_at
      }));

      setSharedTrades(transformedTrades);
    } catch (error) {
      console.error('Error fetching shared trades:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrades = sharedTrades.filter(trade =>
    trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trade.strategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trade.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleLikeTrade = async (tradeId: string) => {
    // Implementation for liking trades would go here
    console.log('Like trade:', tradeId);
  };

  const handleCommentTrade = async (tradeId: string) => {
    // Implementation for commenting on trades would go here
    console.log('Comment on trade:', tradeId);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shared Trades</h1>
          <p className="text-gray-600 mt-1">Discover and learn from community trades</p>
        </div>
        <div className="flex items-center space-x-2">
          <Share2 className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">{filteredTrades.length} shared trades</span>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search shared trades..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex space-x-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'all'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Trades
            </button>
            <button
              onClick={() => setFilter('public')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'public'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setFilter('following')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === 'following'
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Following
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{filteredTrades.length}</p>
          <p className="text-sm text-gray-600">Shared Trades</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {new Set(filteredTrades.map(t => t.userId)).size}
          </p>
          <p className="text-sm text-gray-600">Active Traders</p>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <MessageCircle className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {filteredTrades.filter(t => t.status === 'RUNNING').length}
          </p>
          <p className="text-sm text-gray-600">Live Trades</p>
        </div>
      </div>

      {/* Trades List */}
      <div>
        {filteredTrades.length > 0 ? (
          <div className="space-y-6">
            {filteredTrades.map(trade => (
              <div key={trade.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <TradeCard
                  trade={trade}
                  showActions={false}
                />
                
                {/* Social Actions */}
                <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleLikeTrade(trade.id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors"
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">Like</span>
                      </button>
                      <button
                        onClick={() => handleCommentTrade(trade.id)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Comment</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                    <div className="text-sm text-gray-500">
                      Shared by @{trade.userId}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <Share2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No shared trades found</h3>
            <p className="text-gray-600 mb-4">
              {filter === 'following' 
                ? 'Follow other traders to see their shared trades here.'
                : 'Be the first to share your trades with the community!'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};