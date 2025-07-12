import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, AuthState } from '../types';

// Mock JWT operations for demonstration
const mockJWT = {
  sign: (payload: any) => btoa(JSON.stringify(payload)),
  verify: (token: string) => {
    try {
      return JSON.parse(atob(token));
    } catch {
      return null;
    }
  }
};

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: Partial<User> & { password: string }) => Promise<boolean>;
  updateProfile: (userData: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true
  });

  useEffect(() => {
    // Check for stored auth on mount
    const token = localStorage.getItem('tradejournal_token');
    if (token) {
      const payload = mockJWT.verify(token);
      if (payload && payload.exp > Date.now()) {
        setAuthState({
          user: payload.user,
          token,
          isAuthenticated: true,
          loading: false
        });
      } else {
        localStorage.removeItem('tradejournal_token');
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Mock login - in real app, this would call your API
      const mockUser: User = {
        id: '1',
        username: 'trader_pro',
        email,
        bio: 'Professional trader with 5+ years experience',
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const token = mockJWT.sign({
        user: mockUser,
        exp: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      });

      localStorage.setItem('tradejournal_token', token);
      setAuthState({
        user: mockUser,
        token,
        isAuthenticated: true,
        loading: false
      });

      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('tradejournal_token');
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      // Mock registration
      const newUser: User = {
        id: Date.now().toString(),
        username: userData.username!,
        email: userData.email!,
        phone: userData.phone,
        bio: userData.bio || '',
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      const token = mockJWT.sign({
        user: newUser,
        exp: Date.now() + (24 * 60 * 60 * 1000)
      });

      localStorage.setItem('tradejournal_token', token);
      setAuthState({
        user: newUser,
        token,
        isAuthenticated: true,
        loading: false
      });

      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!authState.user) return false;

      const updatedUser = {
        ...authState.user,
        ...userData,
        updatedAt: new Date().toISOString()
      };

      const token = mockJWT.sign({
        user: updatedUser,
        exp: Date.now() + (24 * 60 * 60 * 1000)
      });

      localStorage.setItem('tradejournal_token', token);
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
        token
      }));

      return true;
    } catch (error) {
      console.error('Profile update error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      logout,
      register,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};