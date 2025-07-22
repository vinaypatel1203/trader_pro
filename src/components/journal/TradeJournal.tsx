import React, { useState } from 'react';
import { Plus, Filter, Search, Calendar } from 'lucide-react';
import { useTrades } from '../../hooks/useTrades';
import { TradeCard } from '../trade/TradeCard';
import { TradeFilters } from '../../types';

interface TradeJournalProps {
  onAddTrade: () => void;
  onEditTrade: (trade: any) => void;
}

export const TradeJournal: React.FC<TradeJournalProps> = ({ onAddTrade, onEditTrade }) => {
  const { trades, loading, filters, setFilters, deleteTrade } = useTrades();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const handleFilterChange = (key: keyof TradeFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredTrades = trades.filter(trade =>
    trade.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trade.strategy.toLowerCase().includes(searchQuery.toLowerCase()) ||
    trade.notes.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
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
          <h1 className="text-2xl font-bold text-gray-900">Trade Journal</h1>
          <p className="text-gray-600 mt-1">Track and analyze your trading performance</p>
        </div>
        <button
          onClick={onAddTrade}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Add Trade</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl p-4 border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search trades by symbol, strategy, or notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2"
          >
            <Filter className="w-4 h-4" />
            <span>Filters</span>
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status || ''}
                  onChange={(e) => handleFilterChange('status', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Statuses</option>
                  <option value="OPEN">Open</option>
                  <option value="RUNNING">Running</option>
                  <option value="TARGET_HIT">Target Hit</option>
                  <option value="STOP_LOSS_HIT">Stop Loss Hit</option>
                  <option value="CLOSED">Closed</option>
                  <option value="PARTIAL">Partial</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Strategy</label>
                <select
                  value={filters.strategy || ''}
                  onChange={(e) => handleFilterChange('strategy', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">All Strategies</option>
                  <option value="Breakout">Breakout</option>
                  <option value="Reversal">Reversal</option>
                  <option value="Support Bounce">Support Bounce</option>
                  <option value="Momentum">Momentum</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                <input
                  type="text"
                  placeholder="e.g., NIFTY"
                  value={filters.symbol || ''}
                  onChange={(e) => handleFilterChange('symbol', e.target.value || undefined)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full px-3 py-2 text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900">{filteredTrades.length}</p>
            <p className="text-sm text-gray-600">Total Trades</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {filteredTrades.filter(t => t.status === 'OPEN').length}
            </p>
            <p className="text-sm text-gray-600">Open Setups</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-purple-600">
              {filteredTrades.filter(t => t.status === 'RUNNING').length}
            </p>
            <p className="text-sm text-gray-600">Running</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {filteredTrades.filter(t => t.status === 'TARGET_HIT').length}
            </p>
            <p className="text-sm text-gray-600">Winners</p>
          </div>
        </div>
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="text-center">
            <p className="text-2xl font-bold text-red-600">
              {filteredTrades.filter(t => t.status === 'STOP_LOSS_HIT').length}
            </p>
            <p className="text-sm text-gray-600">Losers</p>
          </div>
        </div>
      </div>

      {/* Trades List */}
      <div>
        {filteredTrades.length > 0 ? (
          <div className="space-y-4">
            {filteredTrades.map(trade => (
              <TradeCard
                key={trade.id}
                trade={trade}
                onEdit={onEditTrade}
                onDelete={deleteTrade}
                showActions={true}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No trades found</h3>
            <p className="text-gray-600 mb-4">
              {searchQuery || Object.keys(filters).length > 0 
                ? 'Try adjusting your search or filters to find trades.'
                : 'Start building your trade journal by adding your first trade.'
              }
            </p>
            {(!searchQuery && Object.keys(filters).length === 0) && (
              <button
                onClick={onAddTrade}
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Add Your First Trade
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};