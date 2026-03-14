DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Users can view own profile') THEN
    DROP POLICY "Users can view own profile" ON user_profiles;
  END IF;
  CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Users can insert own profile') THEN
    DROP POLICY "Users can insert own profile" ON user_profiles;
  END IF;
  CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_profiles' AND policyname = 'Users can update own profile') THEN
    DROP POLICY "Users can update own profile" ON user_profiles;
  END IF;
  CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_preferences' AND policyname = 'Users can view own preferences') THEN
    DROP POLICY "Users can view own preferences" ON user_preferences;
  END IF;
  CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_preferences' AND policyname = 'Users can insert own preferences') THEN
    DROP POLICY "Users can insert own preferences" ON user_preferences;
  END IF;
  CREATE POLICY "Users can insert own preferences" ON user_preferences
    FOR INSERT WITH CHECK (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'user_preferences' AND policyname = 'Users can update own preferences') THEN
    DROP POLICY "Users can update own preferences" ON user_preferences;
  END IF;
  CREATE POLICY "Users can update own preferences" ON user_preferences
    FOR UPDATE USING (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'Users can view own appointments') THEN
    DROP POLICY "Users can view own appointments" ON appointments;
  END IF;
  CREATE POLICY "Users can view own appointments" ON appointments
    FOR SELECT USING (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'appointments' AND policyname = 'Users can insert own appointments') THEN
    DROP POLICY "Users can insert own appointments" ON appointments;
  END IF;
  CREATE POLICY "Users can insert own appointments" ON appointments
    FOR INSERT WITH CHECK (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_history' AND policyname = 'Users can view own notifications') THEN
    DROP POLICY "Users can view own notifications" ON notification_history;
  END IF;
  CREATE POLICY "Users can view own notifications" ON notification_history
    FOR SELECT USING (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'notification_history' AND policyname = 'Users can insert own notifications') THEN
    DROP POLICY "Users can insert own notifications" ON notification_history;
  END IF;
  CREATE POLICY "Users can insert own notifications" ON notification_history
    FOR INSERT WITH CHECK (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'push_subscriptions' AND policyname = 'Users can view own push subscriptions') THEN
    DROP POLICY "Users can view own push subscriptions" ON push_subscriptions;
  END IF;
  CREATE POLICY "Users can view own push subscriptions" ON push_subscriptions
    FOR SELECT USING (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'push_subscriptions' AND policyname = 'Users can insert own push subscriptions') THEN
    DROP POLICY "Users can insert own push subscriptions" ON push_subscriptions;
  END IF;
  CREATE POLICY "Users can insert own push subscriptions" ON push_subscriptions
    FOR INSERT WITH CHECK (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'push_subscriptions' AND policyname = 'Users can update own push subscriptions') THEN
    DROP POLICY "Users can update own push subscriptions" ON push_subscriptions;
  END IF;
  CREATE POLICY "Users can update own push subscriptions" ON push_subscriptions
    FOR UPDATE USING (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'check_history' AND policyname = 'Users can view own check history') THEN
    DROP POLICY "Users can view own check history" ON check_history;
  END IF;
  CREATE POLICY "Users can view own check history" ON check_history
    FOR SELECT USING (false);

  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'check_history' AND policyname = 'Users can insert own check history') THEN
    DROP POLICY "Users can insert own check history" ON check_history;
  END IF;
  CREATE POLICY "Users can insert own check history" ON check_history
    FOR INSERT WITH CHECK (false);
END $$;
