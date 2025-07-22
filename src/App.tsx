import React, { useState } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth.tsx';
import { useTrades } from './hooks/useTrades';
import { LoginForm } from './components/auth/LoginForm';
import { RegisterForm } from './components/auth/RegisterForm';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Dashboard } from './components/dashboard/Dashboard';
import { TradeJournal } from './components/journal/TradeJournal';
import { AnalyticsDashboard } from './components/analytics/AnalyticsDashboard';
import { TradeForm } from './components/trade/TradeForm';
import { Settings } from './components/settings/Settings';
import { SharedTrades } from './components/shared/SharedTrades';
import { SocialFeed } from './components/social/SocialFeed';
import { Trade } from './types';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();
  const { createTrade, updateTrade } = useTrades();
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [editingTrade, setEditingTrade] = useState<Trade | undefined>();

  const handleAddTrade = () => {
    setEditingTrade(undefined);
    setShowTradeForm(true);
  };

  const handleEditTrade = (trade: Trade) => {
    setEditingTrade(trade);
    setShowTradeForm(true);
  };

  const handleTradeSubmit = async (tradeData: any) => {
    try {
      if (editingTrade) {
        // Update existing trade
        const success = await updateTrade(editingTrade.id, tradeData);
        if (success) {
          console.log('Trade updated successfully');
        } else {
          console.error('Failed to update trade');
        }
      } else {
        // Create new trade
        const newTrade = await createTrade(tradeData);
        if (newTrade) {
          console.log('Trade created successfully');
        } else {
          console.error('Failed to create trade');
        }
      }
      setShowTradeForm(false);
      setEditingTrade(undefined);
    } catch (error) {
      console.error('Error submitting trade:', error);
    }
  };

  const handleTradeFormCancel = () => {
    setShowTradeForm(false);
    setEditingTrade(undefined);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
        {authMode === 'login' ? (
          <LoginForm onSwitchToRegister={() => setAuthMode('register')} />
        ) : (
          <RegisterForm onSwitchToLogin={() => setAuthMode('login')} />
        )}
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'journal':
        return <TradeJournal onAddTrade={handleAddTrade} onEditTrade={handleEditTrade} />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'shared':
        return <SharedTrades />;
      case 'social':
        return <SocialFeed />;
      case 'templates':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Trade Templates</h1>
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <p className="text-gray-600">Templates feature coming soon...</p>
            </div>
          </div>
        );
      case 'goals':
        return (
          <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Goals & Targets</h1>
            <div className="bg-white rounded-xl p-8 text-center border border-gray-200">
              <p className="text-gray-600">Goals feature coming soon...</p>
            </div>
          </div>
        );
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard onAddTrade={handleAddTrade} onEditTrade={handleEditTrade} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOpen={sidebarOpen}
      />
      
      <div className="flex-1 flex flex-col">
        <Header
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          sidebarOpen={sidebarOpen}
        />
        
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {showTradeForm && (
        <TradeForm
          trade={editingTrade}
          onSubmit={handleTradeSubmit}
          onCancel={handleTradeFormCancel}
        />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;