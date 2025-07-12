import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Target, 
  DollarSign, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';
import { useTrades } from '../../hooks/useTrades';

export const AnalyticsDashboard: React.FC = () => {
  const { getTradeAnalytics } = useTrades();
  const analytics = getTradeAnalytics();

  const statCards = [
    {
      title: 'Total Trades',
      value: analytics.totalTrades,
      icon: Activity,
      color: 'blue',
      change: '+12%'
    },
    {
      title: 'Win Rate',
      value: `${analytics.winRate.toFixed(1)}%`,
      icon: Target,
      color: 'green',
      change: '+5.2%'
    },
    {
      title: 'Total P&L',
      value: `₹${analytics.totalPnL.toLocaleString()}`,
      icon: DollarSign,
      color: analytics.totalPnL >= 0 ? 'green' : 'red',
      change: analytics.totalPnL >= 0 ? '+15.3%' : '-8.1%'
    },
    {
      title: 'Avg R:R Ratio',
      value: `1:${analytics.avgRiskReward}`,
      icon: BarChart3,
      color: 'purple',
      change: '+0.2'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-500 text-blue-600 bg-blue-50';
      case 'green': return 'bg-green-500 text-green-600 bg-green-50';
      case 'red': return 'bg-red-500 text-red-600 bg-red-50';
      case 'purple': return 'bg-purple-500 text-purple-600 bg-purple-50';
      default: return 'bg-gray-500 text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Track your trading performance and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
            <option>Last 30 Days</option>
            <option>Last 3 Months</option>
            <option>Last 6 Months</option>
            <option>This Year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          const colorClasses = getColorClasses(stat.color);
          const [bgColor, textColor, cardBg] = colorClasses.split(' ');

          return (
            <div key={stat.title} className={`${cardBg} rounded-xl p-6 border border-gray-200`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className={`text-sm ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'} mt-1`}>
                    {stat.change} from last period
                  </p>
                </div>
                <div className={`${bgColor} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Performance</h3>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {analytics.monthlyPerformance.map((month) => (
              <div key={month.month} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">{month.month}</p>
                  <p className="text-sm text-gray-600">{month.trades} trades</p>
                </div>
                <div className={`text-lg font-bold ${month.pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {month.pnl >= 0 ? '+' : ''}₹{month.pnl.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Strategy Performance */}
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Strategy Performance</h3>
            <PieChart className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="font-medium text-gray-900">Best Strategy</p>
                <p className="text-sm text-gray-600">{analytics.bestStrategy}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
              <div>
                <p className="font-medium text-gray-900">Needs Improvement</p>
                <p className="text-sm text-gray-600">{analytics.worstStrategy}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">AI Trading Insights</h3>
            <div className="space-y-2 text-sm text-gray-700">
              <p>• Your win rate has improved by 5.2% this month compared to last month.</p>
              <p>• Breakout strategy shows the highest success rate (75%) in your portfolio.</p>
              <p>• Consider reducing position size on Support Bounce trades - showing 60% loss rate.</p>
              <p>• Your best performing time is between 10:00 AM - 11:30 AM for intraday trades.</p>
            </div>
            <button className="mt-4 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
              Get Detailed Analysis
            </button>
          </div>
        </div>
      </div>

      {/* Risk Analysis */}
      <div className="bg-white rounded-xl p-6 border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Risk Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Target className="w-8 h-8 text-yellow-600" />
            </div>
            <h4 className="font-medium text-gray-900">Average Risk per Trade</h4>
            <p className="text-2xl font-bold text-gray-900 mt-1">₹2,450</p>
            <p className="text-sm text-gray-600 mt-1">2.1% of capital</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Activity className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900">Maximum Drawdown</h4>
            <p className="text-2xl font-bold text-red-600 mt-1">-8.5%</p>
            <p className="text-sm text-gray-600 mt-1">Within acceptable limits</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
            </div>
            <h4 className="font-medium text-gray-900">Sharpe Ratio</h4>
            <p className="text-2xl font-bold text-green-600 mt-1">1.85</p>
            <p className="text-sm text-gray-600 mt-1">Good risk-adjusted returns</p>
          </div>
        </div>
      </div>
    </div>
  );
};