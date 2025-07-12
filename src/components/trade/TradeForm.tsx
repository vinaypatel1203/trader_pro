import React, { useState } from 'react';
import { X, Upload, Calendar, DollarSign, Target, AlertTriangle } from 'lucide-react';
import { Trade } from '../../types';
import { useTrades } from '../../hooks/useTrades';

interface TradeFormProps {
  trade?: Trade;
  onSubmit: (tradeData: Omit<Trade, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export const TradeForm: React.FC<TradeFormProps> = ({ trade, onSubmit, onCancel }) => {
  const { strategies } = useTrades();
  const [formData, setFormData] = useState({
    symbol: trade?.symbol || '',
    type: trade?.type || 'BUY' as 'BUY' | 'SELL',
    status: trade?.status || 'RUNNING' as Trade['status'],
    strategy: trade?.strategy || '',
    entryPrice: trade?.entryPrice || 0,
    exitPrice: trade?.exitPrice || 0,
    quantity: trade?.quantity || 0,
    stopLoss: trade?.stopLoss || 0,
    target: trade?.target || 0,
    entryTime: trade?.entryTime ? new Date(trade.entryTime).toISOString().slice(0, 16) : '',
    exitTime: trade?.exitTime ? new Date(trade.exitTime).toISOString().slice(0, 16) : '',
    notes: trade?.notes || '',
    setupScreenshot: trade?.setupScreenshot || '',
    tags: trade?.tags.join(', ') || '',
    isShared: trade?.isShared || false,
    visibility: trade?.visibility || 'PRIVATE' as Trade['visibility'],
    sharedWith: trade?.sharedWith || []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.symbol.trim()) newErrors.symbol = 'Symbol is required';
    if (!formData.strategy.trim()) newErrors.strategy = 'Strategy is required';
    if (formData.entryPrice <= 0) newErrors.entryPrice = 'Entry price must be greater than 0';
    if (formData.quantity <= 0) newErrors.quantity = 'Quantity must be greater than 0';
    if (formData.stopLoss <= 0) newErrors.stopLoss = 'Stop loss must be greater than 0';
    if (formData.target <= 0) newErrors.target = 'Target must be greater than 0';
    if (!formData.entryTime) newErrors.entryTime = 'Entry time is required';

    // Validate risk-reward logic
    if (formData.type === 'BUY') {
      if (formData.stopLoss >= formData.entryPrice) {
        newErrors.stopLoss = 'Stop loss should be below entry price for BUY trades';
      }
      if (formData.target <= formData.entryPrice) {
        newErrors.target = 'Target should be above entry price for BUY trades';
      }
    } else {
      if (formData.stopLoss <= formData.entryPrice) {
        newErrors.stopLoss = 'Stop loss should be above entry price for SELL trades';
      }
      if (formData.target <= formData.entryPrice) {
        newErrors.target = 'Target should be below entry price for SELL trades';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const tradeData = {
      ...formData,
      entryPrice: Number(formData.entryPrice),
      exitPrice: formData.exitPrice ? Number(formData.exitPrice) : undefined,
      quantity: Number(formData.quantity),
      stopLoss: Number(formData.stopLoss),
      target: Number(formData.target),
      tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      pnl: formData.exitPrice ? 
        (formData.type === 'BUY' ? 
          (Number(formData.exitPrice) - formData.entryPrice) * formData.quantity :
          (formData.entryPrice - Number(formData.exitPrice)) * formData.quantity
        ) : undefined
    };

    onSubmit(tradeData);
  };

  const calculateRiskReward = () => {
    const risk = Math.abs(formData.entryPrice - formData.stopLoss);
    const reward = Math.abs(formData.target - formData.entryPrice);
    return risk > 0 ? (reward / risk).toFixed(2) : '0';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {trade ? 'Edit Trade' : 'Add New Trade'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Symbol *
              </label>
              <input
                type="text"
                name="symbol"
                value={formData.symbol}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.symbol ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="e.g., NIFTY, BANKNIFTY, RELIANCE"
              />
              {errors.symbol && <p className="text-red-600 text-sm mt-1">{errors.symbol}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trade Type *
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="BUY">BUY</option>
                <option value="SELL">SELL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Strategy *
              </label>
              <select
                name="strategy"
                value={formData.strategy}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.strategy ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Select Strategy</option>
                {strategies.map(strategy => (
                  <option key={strategy.id} value={strategy.name}>{strategy.name}</option>
                ))}
              </select>
              {errors.strategy && <p className="text-red-600 text-sm mt-1">{errors.strategy}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="RUNNING">Running</option>
                <option value="TARGET_HIT">Target Hit</option>
                <option value="STOP_LOSS_HIT">Stop Loss Hit</option>
                <option value="CLOSED">Closed</option>
                <option value="PARTIAL">Partial</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Price *
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="number"
                  name="entryPrice"
                  value={formData.entryPrice}
                  onChange={handleChange}
                  step="0.01"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.entryPrice ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.entryPrice && <p className="text-red-600 text-sm mt-1">{errors.entryPrice}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantity *
              </label>
              <input
                type="number"
                name="quantity"
                value={formData.quantity}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.quantity ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
              />
              {errors.quantity && <p className="text-red-600 text-sm mt-1">{errors.quantity}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Stop Loss *
              </label>
              <div className="relative">
                <AlertTriangle className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-400 w-4 h-4" />
                <input
                  type="number"
                  name="stopLoss"
                  value={formData.stopLoss}
                  onChange={handleChange}
                  step="0.01"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.stopLoss ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.stopLoss && <p className="text-red-600 text-sm mt-1">{errors.stopLoss}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target *
              </label>
              <div className="relative">
                <Target className="absolute left-3 top-1/2 transform -translate-y-1/2 text-green-400 w-4 h-4" />
                <input
                  type="number"
                  name="target"
                  value={formData.target}
                  onChange={handleChange}
                  step="0.01"
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.target ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
              </div>
              {errors.target && <p className="text-red-600 text-sm mt-1">{errors.target}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Time *
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="datetime-local"
                  name="entryTime"
                  value={formData.entryTime}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.entryTime ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.entryTime && <p className="text-red-600 text-sm mt-1">{errors.entryTime}</p>}
            </div>

            {(formData.status === 'CLOSED' || formData.status === 'TARGET_HIT' || formData.status === 'STOP_LOSS_HIT') && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exit Price
                  </label>
                  <input
                    type="number"
                    name="exitPrice"
                    value={formData.exitPrice}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Exit Time
                  </label>
                  <input
                    type="datetime-local"
                    name="exitTime"
                    value={formData.exitTime}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </>
            )}
          </div>

          {formData.entryPrice > 0 && formData.stopLoss > 0 && formData.target > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Risk-Reward Analysis</h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-blue-700">Risk: </span>
                  <span className="font-medium">₹{Math.abs(formData.entryPrice - formData.stopLoss).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-blue-700">Reward: </span>
                  <span className="font-medium">₹{Math.abs(formData.target - formData.entryPrice).toFixed(2)}</span>
                </div>
                <div>
                  <span className="text-blue-700">R:R Ratio: </span>
                  <span className="font-medium">1:{calculateRiskReward()}</span>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Setup Screenshot URL
            </label>
            <div className="relative">
              <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="url"
                name="setupScreenshot"
                value={formData.setupScreenshot}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://example.com/screenshot.jpg"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <input
              type="text"
              name="tags"
              value={formData.tags}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="intraday, breakout, nifty (comma separated)"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Trade rationale, analysis, and lessons learned..."
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isShared"
                name="isShared"
                checked={formData.isShared}
                onChange={handleChange}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isShared" className="text-sm font-medium text-gray-700">
                Share this trade
              </label>
            </div>

            {formData.isShared && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Visibility
                </label>
                <select
                  name="visibility"
                  value={formData.visibility}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="PUBLIC">Public</option>
                  <option value="PRIVATE">Private</option>
                  <option value="SPECIFIC">Specific Users</option>
                </select>
              </div>
            )}
          </div>

          <div className="flex space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
            >
              {trade ? 'Update Trade' : 'Add Trade'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};