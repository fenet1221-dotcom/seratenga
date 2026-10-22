

import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://ajtttvxflqdcvgpidhsh.supabase.co';
const supabasePublishableKey = 'sb_publishable_jPCLdDh9DJYV465FqEzvqA_evVLfNsE';

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);
