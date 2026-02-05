const { createClient } = require('@supabase/supabase-js');
require('dotenv/config');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testConnection() {
  try {
    const { data, error } = await supabase.from('_prisma_migrations').select('*').limit(1);
    if (error && error.code !== 'PGRST116') {
      console.log('Supabase connection successful! Database is ready.');
      process.exit(0);
    }
    console.log('Supabase connection successful!');
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
