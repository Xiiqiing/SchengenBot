ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE appointments
ADD COLUMN IF NOT EXISTS last_notified_at TIMESTAMP WITH TIME ZONE;

UPDATE appointments
SET last_seen_at = COALESCE(last_seen_at, created_at)
WHERE last_seen_at IS NULL;

UPDATE appointments
SET last_notified_at = created_at
WHERE notified = true
  AND last_notified_at IS NULL;

WITH ranked_appointments AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, country, city, appointment_date
      ORDER BY COALESCE(last_seen_at, created_at) DESC, created_at DESC, id DESC
    ) AS row_num
  FROM appointments
)
DELETE FROM appointments
WHERE id IN (
  SELECT id
  FROM ranked_appointments
  WHERE row_num > 1
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'appointments_user_id_country_city_appointment_date_key'
  ) THEN
    ALTER TABLE appointments
    ADD CONSTRAINT appointments_user_id_country_city_appointment_date_key
    UNIQUE (user_id, country, city, appointment_date);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_last_notified_at
ON appointments(last_notified_at DESC);

CREATE INDEX IF NOT EXISTS idx_debounce_check
ON appointments(user_id, country, city, last_notified_at DESC);
