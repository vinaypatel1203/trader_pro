import React from 'react';
import { Plus, TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { useTrades } from '../../hooks/useTrades';
import { TradeCard } from '../trade/TradeCard';
import { useAuth } from '../../hooks/useAuth';

interface DashboardProps {
  onAddTrade: () => void;
  onEditTrade: (trade: any) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onAddTrade, onEditTrade }) => {
  const { user } = useAuth();
  const { trades, loading, getTradeAnalytics } = useTrades();
  const analytics = getTradeAnalytics();

  const recentTrades = trades.slice(0, 3);
  const activeTrades = trades.filter(trade => ['OPEN', 'RUNNING'].includes(trade.status));
  const openTrades = trades.filter(trade => trade.status === 'OPEN');

  const quickStats = [
    {
      title: 'Active Trades',
      value: activeTrades.length,
      icon: Clock,
      color: 'blue'
    },
    {
      title: 'Win Rate',
      value: `${analytics.winRate.toFixed(1)}%`,
      icon: Target,
      color: 'green'
    },
    {
      title: 'Total P&L',
      value: `₹${analytics.totalPnL.toLocaleString()}`,
      icon: analytics.totalPnL >= 0 ? TrendingUp : TrendingDown,
      color: analytics.totalPnL >= 0 ? 'green' : 'red'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Welcome back, {user?.username}!</h1>
            <p className="text-blue-100 mt-1">Ready to track your next trade?</p>
          </div>
          <button
            onClick={onAddTrade}
            className="bg-white text-blue-600 px-4 py-2 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Trade</span>
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {quickStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="bg-white rounded-xl p-6 border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg ${
                  stat.color === 'blue' ? 'bg-blue-100' :
                  stat.color === 'green' ? 'bg-green-100' : 'bg-red-100'
                }`}>
                  <Icon className={`w-6 h-6 ${
                    stat.color === 'blue' ? 'text-blue-600' :
                    stat.color === 'green' ? 'text-green-600' : 'text-red-600'
                  }`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Running Trades */}
      {activeTrades.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Active Trades</h2>
            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm font-medium">
              {activeTrades.length} active
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeTrades.map(trade => (
              <TradeCard
                key={trade.id}
                trade={trade}
                onEdit={onEditTrade}
                showActions={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Recent Trades */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Recent Trades</h2>
          <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
            View All Trades
          </button>
        </div>
        
        {recentTrades.length > 0 ? (
          <div className="space-y-4">
            {recentTrades.map(trade => (
              <TradeCard
                key={trade.id}
                trade={trade}
                onEdit={onEditTrade}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trades yet</h3>
            <p className="text-gray-600 mb-4">Start your trading journey by adding your first trade.</p>
            <button
              onClick={onAddTrade}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              Add Your First Trade
            </button>
          </div>
        )}
      </div>

      {/* AI Insights Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
        <div className="flex items-start space-x-4">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Trading Insight</h3>
            <p className="text-gray-700 mb-3">
              Based on your trading patterns, you perform 23% better with breakout strategies during the first hour of market opening.
            </p>
            <button className="text-purple-600 hover:text-purple-700 font-medium text-sm">
              View More Insights →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};