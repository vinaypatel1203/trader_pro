/*
  # Complete Trading Journal Database Schema

  1. New Tables
    - `profiles` - User profile information
      - `id` (uuid, primary key, references auth.users)
      - `username` (text, unique)
      - `bio` (text)
      - `avatar_url` (text, nullable)
      - `is_public` (boolean, default true)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `strategies` - Trading strategies
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    
    - `trades` - Trading records
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `symbol` (text)
      - `type` (enum: BUY/SELL)
      - `status` (enum: RUNNING/TARGET_HIT/STOP_LOSS_HIT/CLOSED/PARTIAL)
      - `strategy_id` (uuid, references strategies, nullable)
      - `entry_price` (numeric)
      - `exit_price` (numeric, nullable)
      - `quantity` (numeric)
      - `stop_loss` (numeric)
      - `target` (numeric)
      - `entry_time` (timestamp)
      - `exit_time` (timestamp, nullable)
      - `notes` (text)
      - `setup_screenshot` (text, nullable)
      - `tags` (text array)
      - `is_shared` (boolean, default false)
      - `visibility` (enum: PUBLIC/PRIVATE/SPECIFIC)
      - `pnl` (numeric, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `comments` - Trade comments
      - `id` (uuid, primary key)
      - `trade_id` (uuid, references trades)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `parent_id` (uuid, references comments, nullable)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `follows` - User follow relationships
      - `id` (uuid, primary key)
      - `follower_id` (uuid, references profiles)
      - `following_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public visibility of shared content
*/

-- Create custom types
CREATE TYPE trade_type AS ENUM ('BUY', 'SELL');
CREATE TYPE trade_status AS ENUM ('RUNNING', 'TARGET_HIT', 'STOP_LOSS_HIT', 'CLOSED', 'PARTIAL');
CREATE TYPE visibility_type AS ENUM ('PUBLIC', 'PRIVATE', 'SPECIFIC');

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username text UNIQUE NOT NULL,
  bio text DEFAULT '',
  avatar_url text,
  is_public boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create strategies table
CREATE TABLE IF NOT EXISTS strategies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create trades table
CREATE TABLE IF NOT EXISTS trades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  symbol text NOT NULL,
  type trade_type NOT NULL,
  status trade_status NOT NULL,
  strategy_id uuid REFERENCES strategies(id) ON DELETE SET NULL,
  entry_price numeric NOT NULL,
  exit_price numeric,
  quantity numeric NOT NULL,
  stop_loss numeric NOT NULL,
  target numeric NOT NULL,
  entry_time timestamptz NOT NULL,
  exit_time timestamptz,
  notes text DEFAULT '',
  setup_screenshot text,
  tags text[] DEFAULT '{}',
  is_shared boolean DEFAULT false,
  visibility visibility_type DEFAULT 'PRIVATE',
  pnl numeric,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create comments table
CREATE TABLE IF NOT EXISTS comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  parent_id uuid REFERENCES comments(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create follows table
CREATE TABLE IF NOT EXISTS follows (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  following_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(follower_id, following_id),
  CHECK (follower_id != following_id)
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategies ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view public profiles"
  ON profiles FOR SELECT
  USING (is_public = true OR auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Strategies policies
CREATE POLICY "Users can view own strategies"
  ON strategies FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own strategies"
  ON strategies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own strategies"
  ON strategies FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own strategies"
  ON strategies FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can view own trades"
  ON trades FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view shared trades"
  ON trades FOR SELECT
  USING (is_shared = true AND visibility = 'PUBLIC');

CREATE POLICY "Users can insert own trades"
  ON trades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trades"
  ON trades FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trades"
  ON trades FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Users can view comments on visible trades"
  ON comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM trades 
      WHERE trades.id = comments.trade_id 
      AND (
        trades.user_id = auth.uid() 
        OR (trades.is_shared = true AND trades.visibility = 'PUBLIC')
      )
    )
  );

CREATE POLICY "Users can insert comments on visible trades"
  ON comments FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (
      SELECT 1 FROM trades 
      WHERE trades.id = comments.trade_id 
      AND (
        trades.user_id = auth.uid() 
        OR (trades.is_shared = true AND trades.visibility = 'PUBLIC')
      )
    )
  );

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Users can view all follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own follows"
  ON follows FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = follower_id);

CREATE POLICY "Users can delete own follows"
  ON follows FOR DELETE
  TO authenticated
  USING (auth.uid() = follower_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_trades_user_id ON trades(user_id);
CREATE INDEX IF NOT EXISTS idx_trades_created_at ON trades(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_trades_shared ON trades(is_shared, visibility) WHERE is_shared = true;
CREATE INDEX IF NOT EXISTS idx_strategies_user_id ON strategies(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_trade_id ON comments(trade_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON follows(following_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at
  BEFORE UPDATE ON trades
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();