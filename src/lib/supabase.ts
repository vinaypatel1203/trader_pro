import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Check if Supabase is properly configured
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey && 
  supabaseUrl !== 'https://your-project.supabase.co' && 
  supabaseAnonKey !== 'your-anon-key');

if (!isSupabaseConfigured) {
  console.warn('⚠️  Supabase is not configured properly.');
  console.warn('Please update your .env file with your actual Supabase credentials:');
  console.warn('VITE_SUPABASE_URL=https://your-project.supabase.co');
  console.warn('VITE_SUPABASE_ANON_KEY=your-anon-key');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co', 
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
    global: {
      headers: {
        'X-Client-Info': 'trading-journal'
      }
    }
  }
);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          bio: string;
          avatar_url: string | null;
          is_public: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          bio?: string;
          avatar_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          bio?: string;
          avatar_url?: string | null;
          is_public?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      strategies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string;
          created_at?: string;
        };
      };
      trades: {
        Row: {
          id: string;
          user_id: string;
          symbol: string;
          type: 'BUY' | 'SELL';
          status: 'OPEN' | 'RUNNING' | 'TARGET_HIT' | 'STOP_LOSS_HIT' | 'CLOSED' | 'PARTIAL';
          strategy_id: string | null;
          entry_price: number;
          exit_price: number | null;
          quantity: number;
          stop_loss: number;
          target: number;
          entry_time: string;
          exit_time: string | null;
          notes: string;
          setup_screenshot: string | null;
          tags: string[];
          is_shared: boolean;
          visibility: 'PUBLIC' | 'PRIVATE' | 'SPECIFIC';
          pnl: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          symbol: string;
          type: 'BUY' | 'SELL';
          status: 'OPEN' | 'RUNNING' | 'TARGET_HIT' | 'STOP_LOSS_HIT' | 'CLOSED' | 'PARTIAL';
          strategy_id?: string | null;
          entry_price: number;
          exit_price?: number | null;
          quantity: number;
          stop_loss: number;
          target: number;
          entry_time: string;
          exit_time?: string | null;
          notes?: string;
          setup_screenshot?: string | null;
          tags?: string[];
          is_shared?: boolean;
          visibility?: 'PUBLIC' | 'PRIVATE' | 'SPECIFIC';
          pnl?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          symbol?: string;
          type?: 'BUY' | 'SELL';
          status?: 'OPEN' | 'RUNNING' | 'TARGET_HIT' | 'STOP_LOSS_HIT' | 'CLOSED' | 'PARTIAL';
          strategy_id?: string | null;
          entry_price?: number;
          exit_price?: number | null;
          quantity?: number;
          stop_loss?: number;
          target?: number;
          entry_time?: string;
          exit_time?: string | null;
          notes?: string;
          setup_screenshot?: string | null;
          tags?: string[];
          is_shared?: boolean;
          visibility?: 'PUBLIC' | 'PRIVATE' | 'SPECIFIC';
          pnl?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      comments: {
        Row: {
          id: string;
          trade_id: string;
          user_id: string;
          content: string;
          parent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          trade_id: string;
          user_id: string;
          content: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          trade_id?: string;
          user_id?: string;
          content?: string;
          parent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      follows: {
        Row: {
          id: string;
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
      };
    };
  };
}