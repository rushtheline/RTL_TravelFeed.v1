import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nifmkwvzkijysrriyars.supabase.co';
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5pZm1rd3Z6a2lqeXNycml5YXJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjExMzkxNTAsImV4cCI6MjA3NjcxNTE1MH0.V22lPNS2XtmCI89PVGuVNIpWi6_m9fsySdeAQn8mntQ";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
