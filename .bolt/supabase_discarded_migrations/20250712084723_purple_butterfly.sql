/*
  # Create trades and related tables

  1. New Tables
    - `profiles`
      - `id` (uuid, references auth.users)
      - `username` (text, unique)
      - `bio` (text)
      - `avatar_url` (text)
      - `is_public` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `strategies`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `created_at` (timestamp)
    - `trades`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `symbol` (text)
      - `type` (text)
      - `status` (text)
      - `strategy_id` (uuid, references strategies)
      - `entry_price` (decimal)
      - `exit_price` (decimal)
      - `quantity` (integer)
      - `stop_loss` (decimal)
      - `target` (decimal)
      - `entry_time` (timestamp)
      - `exit_time` (timestamp)
      - `notes` (text)
      - `setup_screenshot` (text)
      - `tags` (text array)
      - `is_shared` (boolean)
      - `visibility` (text)
      - `pnl` (decimal)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `trade_shares`
      - `id` (uuid, primary key)
      - `trade_id` (uuid, references trades)
      - `shared_with_user_id` (uuid, references profiles)
      - `created_at` (timestamp)
    - `comments`
      - `id` (uuid, primary key)
      - `trade_id` (uuid, references trades)
      - `user_id` (uuid, references profiles)
      - `content` (text)
      - `parent_id` (uuid, references comments)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    - `follows`
      - `id` (uuid, primary key)
      - `follower_id` (uuid, references profiles)
      - `following_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
    - Add policies for public/shared content visibility
*/

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
  type text NOT NULL CHECK (type IN ('BUY', 'SELL')),
  status text NOT NULL CHECK (status IN ('RUNNING', 'TARGET_HIT', 'STOP_LOSS_HIT', 'CLOSED', 'PARTIAL')),
  strategy_id uuid REFERENCES strategies(id),
  entry_price decimal(10,2) NOT NULL,
  exit_price decimal(10,2),
  quantity integer NOT NULL,
  stop_loss decimal(10,2) NOT NULL,
  target decimal(10,2) NOT NULL,
  entry_time timestamptz NOT NULL,
  exit_time timestamptz,
  notes text DEFAULT '',
  setup_screenshot text,
  tags text[] DEFAULT '{}',
  is_shared boolean DEFAULT false,
  visibility text DEFAULT 'PRIVATE' CHECK (visibility IN ('PUBLIC', 'PRIVATE', 'SPECIFIC')),
  pnl decimal(10,2),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create trade_shares table
CREATE TABLE IF NOT EXISTS trade_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  trade_id uuid REFERENCES trades(id) ON DELETE CASCADE NOT NULL,
  shared_with_user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(trade_id, shared_with_user_id)
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
ALTER TABLE trade_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE follows ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read public profiles"
  ON profiles FOR SELECT
  TO authenticated
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
CREATE POLICY "Users can manage own strategies"
  ON strategies FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Trades policies
CREATE POLICY "Users can manage own trades"
  ON trades FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read public trades"
  ON trades FOR SELECT
  TO authenticated
  USING (
    visibility = 'PUBLIC' AND is_shared = true
    OR auth.uid() = user_id
    OR (visibility = 'SPECIFIC' AND EXISTS (
      SELECT 1 FROM trade_shares 
      WHERE trade_id = trades.id AND shared_with_user_id = auth.uid()
    ))
  );

-- Trade shares policies
CREATE POLICY "Users can manage shares for own trades"
  ON trade_shares FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trades 
    WHERE trades.id = trade_id AND trades.user_id = auth.uid()
  ));

CREATE POLICY "Users can read shares for shared trades"
  ON trade_shares FOR SELECT
  TO authenticated
  USING (shared_with_user_id = auth.uid());

-- Comments policies
CREATE POLICY "Users can read comments on accessible trades"
  ON comments FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM trades 
    WHERE trades.id = trade_id 
    AND (
      trades.user_id = auth.uid()
      OR (trades.visibility = 'PUBLIC' AND trades.is_shared = true)
      OR (trades.visibility = 'SPECIFIC' AND EXISTS (
        SELECT 1 FROM trade_shares 
        WHERE trade_shares.trade_id = trades.id AND trade_shares.shared_with_user_id = auth.uid()
      ))
    )
  ));

CREATE POLICY "Users can manage own comments"
  ON comments FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

-- Follows policies
CREATE POLICY "Users can read all follows"
  ON follows FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage own follows"
  ON follows FOR ALL
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

-- Insert default strategies
INSERT INTO strategies (user_id, name, description) 
SELECT 
  id,
  strategy_name,
  strategy_desc
FROM auth.users,
UNNEST(
  ARRAY['Breakout', 'Reversal', 'Support Bounce', 'Resistance Rejection', 'Momentum', 'Scalping', 'Swing Trading', 'Day Trading', 'Position Trading'],
  ARRAY[
    'Trading breakouts above key resistance levels',
    'Trading reversals at key support/resistance levels', 
    'Trading bounces from strong support levels',
    'Trading rejections at strong resistance levels',
    'Trading with strong momentum moves',
    'Quick in-and-out trades for small profits',
    'Medium-term trades lasting days to weeks',
    'Intraday trades closed within the same day',
    'Long-term trades lasting weeks to months'
  ]
) AS t(strategy_name, strategy_desc)
ON CONFLICT DO NOTHING;