ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS same_slot_cooldown_hours INTEGER DEFAULT 24;

COMMENT ON COLUMN user_preferences.same_slot_cooldown_hours IS 'Same slot reminder cooldown in hours';
