import React, { useState } from 'react';
import { User, Plus, Trash2, Edit, Save, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTrades } from '../../hooks/useTrades';

export const Settings: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { strategies, createStrategy, deleteStrategy } = useTrades();
  const [activeTab, setActiveTab] = useState('profile');
  const [profileData, setProfileData] = useState({
    username: user?.username || '',
    bio: user?.bio || '',
    isPublic: user?.isPublic || true
  });
  const [newStrategy, setNewStrategy] = useState({ name: '', description: '' });
  const [editingStrategy, setEditingStrategy] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await updateProfile(profileData);
      alert('Profile updated successfully!');
    } catch (error) {
      alert('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleAddStrategy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStrategy.name.trim()) return;

    const strategy = await createStrategy(newStrategy.name, newStrategy.description);
    if (strategy) {
      setNewStrategy({ name: '', description: '' });
    }
  };

  const handleDeleteStrategy = async (id: string) => {
    if (confirm('Are you sure you want to delete this strategy?')) {
      await deleteStrategy(id);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'strategies', label: 'Trading Strategies', icon: Plus }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage your account and trading preferences</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h3>
          
          <form onSubmit={handleProfileUpdate} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                value={profileData.username}
                onChange={(e) => setProfileData(prev => ({ ...prev, username: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio
              </label>
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Tell others about your trading experience..."
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPublic"
                checked={profileData.isPublic}
                onChange={(e) => setProfileData(prev => ({ ...prev, isPublic: e.target.checked }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="isPublic" className="text-sm font-medium text-gray-700">
                Make my profile public
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Profile'}
            </button>
          </form>
        </div>
      )}

      {/* Strategies Tab */}
      {activeTab === 'strategies' && (
        <div className="space-y-6">
          {/* Add New Strategy */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Add New Strategy</h3>
            
            <form onSubmit={handleAddStrategy} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Strategy Name
                  </label>
                  <input
                    type="text"
                    value={newStrategy.name}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Morning Breakout"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <input
                    type="text"
                    value={newStrategy.description}
                    onChange={(e) => setNewStrategy(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Brief description of the strategy"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:from-green-700 hover:to-blue-700 transition-all flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Add Strategy</span>
              </button>
            </form>
          </div>

          {/* Existing Strategies */}
          <div className="bg-white rounded-xl p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Your Trading Strategies</h3>
            
            {strategies.length > 0 ? (
              <div className="space-y-3">
                {strategies.map((strategy) => (
                  <div key={strategy.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{strategy.name}</h4>
                      {strategy.description && (
                        <p className="text-sm text-gray-600 mt-1">{strategy.description}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => setEditingStrategy(strategy.id)}
                        className="p-2 text-gray-400 hover:text-blue-600 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteStrategy(strategy.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Plus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-900 mb-2">No strategies yet</h4>
                <p className="text-gray-600">Add your first trading strategy to get started.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};