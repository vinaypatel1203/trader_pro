import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

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
    // Check for existing session
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          const user: User = {
            id: profile.id,
            username: profile.username,
            email: session.user.email!,
            bio: profile.bio,
            avatar: profile.avatar_url,
            isPublic: profile.is_public,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at
          };

          setAuthState({
            user,
            token: session.access_token,
            isAuthenticated: true,
            loading: false
          });
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };

    getSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setAuthState({
          user: null,
          token: null,
          isAuthenticated: false,
          loading: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();

        if (profile) {
          const user: User = {
            id: profile.id,
            username: profile.username,
            email: data.user.email!,
            bio: profile.bio,
            avatar: profile.avatar_url,
            isPublic: profile.is_public,
            createdAt: profile.created_at,
            updatedAt: profile.updated_at
          };

          setAuthState({
            user,
            token: data.session?.access_token || '',
            isAuthenticated: true,
            loading: false
          });

          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    supabase.auth.signOut();
    setAuthState({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false
    });
  };

  const register = async (userData: Partial<User> & { password: string }): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password: userData.password
      });

      if (error) throw error;

      if (data.user) {
        // Create profile
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            username: userData.username!,
            bio: userData.bio || '',
            is_public: true
          });

        if (profileError) throw profileError;

        const newUser: User = {
          id: data.user.id,
          username: userData.username!,
          email: userData.email!,
          phone: userData.phone,
          bio: userData.bio || '',
          isPublic: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        setAuthState({
          user: newUser,
          token: data.session?.access_token || '',
          isAuthenticated: true,
          loading: false
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const updateProfile = async (userData: Partial<User>): Promise<boolean> => {
    try {
      if (!authState.user) return false;

      const { error } = await supabase
        .from('profiles')
        .update({
          username: userData.username,
          bio: userData.bio,
          avatar_url: userData.avatar,
          is_public: userData.isPublic,
          updated_at: new Date().toISOString()
        })
        .eq('id', authState.user.id);

      if (error) throw error;

      const updatedUser = {
        ...authState.user,
        ...userData,
        updatedAt: new Date().toISOString()
      };

      setAuthState(prev => ({
        ...prev,
        user: updatedUser
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