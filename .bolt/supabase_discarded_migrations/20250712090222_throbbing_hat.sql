/*
  # Fix RLS Policy Infinite Recursion

  1. Security Updates
    - Remove problematic RLS policies that cause infinite recursion
    - Create simpler, non-recursive policies for trades and related tables
    - Ensure proper access control without circular dependencies

  2. Policy Changes
    - Simplify trades policies to avoid joins in policy conditions
    - Update trade_shares and comments policies to be non-recursive
    - Maintain security while preventing infinite recursion
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can read public trades" ON trades;
DROP POLICY IF EXISTS "Users can manage shares for own trades" ON trade_shares;
DROP POLICY IF EXISTS "Users can read comments on accessible trades" ON comments;

-- Create simplified, non-recursive policies for trades
CREATE POLICY "Users can manage own trades"
  ON trades
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read shared trades"
  ON trades
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR 
    (is_shared = true AND visibility = 'PUBLIC')
  );

-- Create simplified policies for trade_shares
CREATE POLICY "Users can manage own trade shares"
  ON trade_shares
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades 
      WHERE trades.id = trade_shares.trade_id 
      AND trades.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can read their shared trades"
  ON trade_shares
  FOR SELECT
  TO authenticated
  USING (shared_with_user_id = auth.uid());

-- Create simplified policies for comments
CREATE POLICY "Users can manage own comments"
  ON comments
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read comments on own or shared trades"
  ON comments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM trades 
      WHERE trades.id = comments.trade_id 
      AND (
        trades.user_id = auth.uid() OR 
        (trades.is_shared = true AND trades.visibility = 'PUBLIC')
      )
    )
  );