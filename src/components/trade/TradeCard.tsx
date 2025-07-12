import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  AlertTriangle,
  Share2,
  MessageCircle,
  Eye,
  MoreHorizontal,
  Edit,
  Trash2
} from 'lucide-react';
import { Trade } from '../../types';

interface TradeCardProps {
  trade: Trade;
  onEdit?: (trade: Trade) => void;
  onDelete?: (tradeId: string) => void;
  onShare?: (trade: Trade) => void;
  showActions?: boolean;
}

export const TradeCard: React.FC<TradeCardProps> = ({ 
  trade, 
  onEdit, 
  onDelete, 
  onShare,
  showActions = true 
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const getStatusColor = (status: Trade['status']) => {
    switch (status) {
      case 'RUNNING': return 'bg-blue-100 text-blue-800';
      case 'TARGET_HIT': return 'bg-green-100 text-green-800';
      case 'STOP_LOSS_HIT': return 'bg-red-100 text-red-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'PARTIAL': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: Trade['status']) => {
    switch (status) {
      case 'RUNNING': return <Clock className="w-4 h-4" />;
      case 'TARGET_HIT': return <Target className="w-4 h-4" />;
      case 'STOP_LOSS_HIT': return <AlertTriangle className="w-4 h-4" />;
      case 'CLOSED': return <TrendingUp className="w-4 h-4" />;
      case 'PARTIAL': return <TrendingUp className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPnLColor = (pnl?: number) => {
    if (!pnl) return 'text-gray-600';
    return pnl > 0 ? 'text-green-600' : 'text-red-600';
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg ${trade.type === 'BUY' ? 'bg-green-100' : 'bg-red-100'}`}>
            {trade.type === 'BUY' ? 
              <TrendingUp className="w-5 h-5 text-green-600" /> : 
              <TrendingDown className="w-5 h-5 text-red-600" />
            }
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{trade.symbol}</h3>
            <p className="text-sm text-gray-600">{trade.strategy}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium ${getStatusColor(trade.status)}`}>
            {getStatusIcon(trade.status)}
            <span>{trade.status.replace('_', ' ')}</span>
          </span>
          
          {showActions && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showMenu && (
                <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  {onEdit && (
                    <button
                      onClick={() => {
                        onEdit(trade);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Edit</span>
                    </button>
                  )}
                  {onShare && (
                    <button
                      onClick={() => {
                        onShare(trade);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                    >
                      <Share2 className="w-4 h-4" />
                      <span>Share</span>
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        onDelete(trade.id);
                        setShowMenu(false);
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Delete</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Entry Price</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(trade.entryPrice)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Quantity</p>
          <p className="text-lg font-semibold text-gray-900">{trade.quantity}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Stop Loss</p>
          <p className="text-lg font-semibold text-red-600">{formatCurrency(trade.stopLoss)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500 uppercase tracking-wide">Target</p>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(trade.target)}</p>
        </div>
      </div>

      {trade.pnl !== undefined && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">P&L</span>
            <span className={`text-lg font-bold ${getPnLColor(trade.pnl)}`}>
              {trade.pnl > 0 ? '+' : ''}{formatCurrency(trade.pnl)}
            </span>
          </div>
        </div>
      )}

      {trade.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-700 leading-relaxed">{trade.notes}</p>
        </div>
      )}

      {trade.setupScreenshot && (
        <div className="mb-4">
          <img
            src={trade.setupScreenshot}
            alt="Trade setup"
            className="w-full h-40 object-cover rounded-lg border border-gray-200"
          />
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-4">
        {trade.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
          >
            #{tag}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
        <div className="flex items-center space-x-4">
          <span>Entry: {formatDate(trade.entryTime)}</span>
          {trade.exitTime && (
            <span>Exit: {formatDate(trade.exitTime)}</span>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {trade.isShared && (
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>Shared</span>
            </div>
          )}
          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors">
            <MessageCircle className="w-4 h-4" />
            <span>Comment</span>
          </button>
        </div>
      </div>
    </div>
  );
};