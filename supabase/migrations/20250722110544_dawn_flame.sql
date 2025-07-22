/*
  # Add OPEN status to trade_status enum

  1. Database Changes
    - Add 'OPEN' to the trade_status enum type
    - This allows trades to be tracked before entry is achieved

  2. Purpose
    - OPEN: Trade setup identified but entry not yet achieved
    - RUNNING: Trade entered and position is active
    - Other statuses remain the same for completed trades
*/

-- Add OPEN status to the existing trade_status enum
ALTER TYPE trade_status ADD VALUE IF NOT EXISTS 'OPEN';