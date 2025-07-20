import React, { useState, useEffect } from 'react';
import { 
  Users, 
  UserPlus, 
  MessageCircle, 
  Heart, 
  Share2, 
  TrendingUp,
  Award,
  Target,
  Calendar
} from 'lucide-react';
import { TradeCard } from '../trade/TradeCard';
import { Trade } from '../../types';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../hooks/useAuth';

interface SocialUser {
  id: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  isFollowing: boolean;
  followerCount: number;
  tradeCount: number;
  winRate: number;
}

export const SocialFeed: React.FC = () => {
  const { user } = useAuth();
  const [feedTrades, setFeedTrades] = useState<Trade[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SocialUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'feed' | 'discover'>('feed');

  useEffect(() => {
    fetchFeedData();
    fetchSuggestedUsers();
  }, [user]);

  const fetchFeedData = async () => {
    if (!user) return;
    
    try {
      // Get trades from users we follow
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      if (following && following.length > 0) {
        const followingIds = following.map(f => f.following_id);
        
        const { data: trades, error } = await supabase
          .from('trades')
          .select(`
            *,
            strategies(name),
            profiles(username, avatar_url)
          `)
          .in('user_id', followingIds)
          .eq('is_shared', true)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) throw error;

        const transformedTrades: Trade[] = (trades || []).map(trade => ({
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

        setFeedTrades(transformedTrades);
      }
    } catch (error) {
      console.error('Error fetching feed:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestedUsers = async () => {
    if (!user) return;

    try {
      // Get users we're not following
      const { data: following } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id);

      const followingIds = following?.map(f => f.following_id) || [];
      followingIds.push(user.id); // Exclude self

      const { data: users, error } = await supabase
        .from('profiles')
        .select('*')
        .not('id', 'in', `(${followingIds.join(',')})`)
        .eq('is_public', true)
        .limit(5);

      if (error) throw error;

      // Get additional stats for each user
      const usersWithStats = await Promise.all(
        (users || []).map(async (profile) => {
          // Get follower count
          const { count: followerCount } = await supabase
            .from('follows')
            .select('*', { count: 'exact' })
            .eq('following_id', profile.id);

          // Get trade stats
          const { data: trades } = await supabase
            .from('trades')
            .select('status, pnl')
            .eq('user_id', profile.id);

          const tradeCount = trades?.length || 0;
          const winningTrades = trades?.filter(t => 
            ['TARGET_HIT', 'CLOSED'].includes(t.status) && (t.pnl || 0) > 0
          ).length || 0;
          const winRate = tradeCount > 0 ? (winningTrades / tradeCount) * 100 : 0;

          return {
            id: profile.id,
            username: profile.username,
            bio: profile.bio,
            avatar_url: profile.avatar_url,
            isFollowing: false,
            followerCount: followerCount || 0,
            tradeCount,
            winRate
          };
        })
      );

      setSuggestedUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: userId
        });

      if (error) throw error;

      setSuggestedUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, isFollowing: true, followerCount: u.followerCount + 1 } : u)
      );
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleUnfollow = async (userId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);

      if (error) throw error;

      setSuggestedUsers(prev => 
        prev.map(u => u.id === userId ? { ...u, isFollowing: false, followerCount: u.followerCount - 1 } : u)
      );
    } catch (error) {
      console.error('Error unfollowing user:', error);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">Social Feed</h1>
          <p className="text-gray-600 mt-1">Connect with traders and learn from the community</p>
        </div>
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">Trading Community</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('feed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'feed'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            My Feed
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'discover'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Discover Traders
          </button>
        </nav>
      </div>

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-2 space-y-6">
            {feedTrades.length > 0 ? (
              feedTrades.map(trade => (
                <div key={trade.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <div className="p-4 border-b border-gray-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-medium text-sm">
                          {trade.userId.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">@{trade.userId}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(trade.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <TradeCard trade={trade} showActions={false} />
                  
                  <div className="px-6 py-4 border-t border-gray-100 bg-gray-50">
                    <div className="flex items-center space-x-6">
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-red-600 transition-colors">
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">Like</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">Comment</span>
                      </button>
                      <button className="flex items-center space-x-2 text-gray-600 hover:text-green-600 transition-colors">
                        <Share2 className="w-4 h-4" />
                        <span className="text-sm">Share</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Your feed is empty</h3>
                <p className="text-gray-600 mb-4">
                  Follow other traders to see their shared trades and updates in your feed.
                </p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
                >
                  Discover Traders
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Strategies */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Trending Strategies
              </h3>
              <div className="space-y-3">
                {['Breakout', 'Reversal', 'Momentum'].map((strategy, index) => (
                  <div key={strategy} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{strategy}</span>
                    <span className="text-xs text-green-600">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Performers */}
            <div className="bg-white rounded-xl p-6 border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Award className="w-5 h-5 mr-2 text-yellow-600" />
                Top Performers
              </h3>
              <div className="space-y-3">
                {suggestedUsers.slice(0, 3).map((user, index) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-xs">
                        {user.username.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">@{user.username}</p>
                      <p className="text-xs text-green-600">{user.winRate.toFixed(1)}% win rate</p>
                    </div>
                    <span className="text-xs text-gray-500">#{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Discover Tab */}
      {activeTab === 'discover' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {suggestedUsers.map(user => (
            <div key={user.id} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-white font-bold text-xl">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">@{user.username}</h3>
                <p className="text-sm text-gray-600 mt-1 mb-4">{user.bio || 'Trader'}</p>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{user.followerCount}</p>
                    <p className="text-xs text-gray-600">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-gray-900">{user.tradeCount}</p>
                    <p className="text-xs text-gray-600">Trades</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-green-600">{user.winRate.toFixed(1)}%</p>
                    <p className="text-xs text-gray-600">Win Rate</p>
                  </div>
                </div>
                
                <button
                  onClick={() => user.isFollowing ? handleUnfollow(user.id) : handleFollow(user.id)}
                  className={`w-full px-4 py-2 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 ${
                    user.isFollowing
                      ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{user.isFollowing ? 'Following' : 'Follow'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};