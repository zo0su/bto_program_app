const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

// 서버 사이드용 클라이언트 (service role key 사용)
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// 클라이언트 사이드용 클라이언트 (anon key 사용)
const supabaseAnon = createClient(
  supabaseUrl,
  process.env.SUPABASE_ANON_KEY || supabaseServiceKey
);

module.exports = {
  supabase,
  supabaseAnon
};

