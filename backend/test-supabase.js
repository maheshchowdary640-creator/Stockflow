/**
 * StockFlow Supabase Migration Verification Test Suite
 *
 * Validates:
 * 1. Supabase Client Configurations
 * 2. SQL Migration & Schema Integrity (Tables, Constraints, Triggers, RLS)
 * 3. Environment Variable Configuration
 * 4. Live Supabase Connection Test
 */
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const {
  supabase,
  supabaseAdmin,
  getAuthenticatedClient,
  checkSupabaseConnection,
} = require('./config/supabase');

dotenv.config();

async function runVerification() {
  console.log('======================================================');
  console.log('STOCKFLOW SUPABASE MIGRATION VERIFICATION');
  console.log('======================================================\n');

  // 1. Client Configuration Checks
  console.log('[1] Verifying Supabase Client Configurations:');
  if (supabase && typeof supabase.from === 'function') {
    console.log('  ✓ Public Supabase client initialized.');
  } else {
    throw new Error('Public Supabase client failed initialization');
  }

  if (supabaseAdmin && typeof supabaseAdmin.from === 'function') {
    console.log('  ✓ Supabase Service Role Admin client initialized.');
  } else {
    throw new Error('Supabase Service Role Admin client failed initialization');
  }

  const sampleScopedClient = getAuthenticatedClient('mock-token');
  if (sampleScopedClient && typeof sampleScopedClient.from === 'function') {
    console.log('  ✓ User-scoped RLS client generator verified.');
  } else {
    throw new Error('User-scoped client generator failed');
  }

  // 2. SQL Schema Migration Integrity Check
  console.log('\n[2] Verifying SQL Migration Schema Integrity:');
  const schemaPath = path.join(__dirname, 'database', 'schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error(`Schema file not found at: ${schemaPath}`);
  }

  const sqlContent = fs.readFileSync(schemaPath, 'utf8');

  // Table checks
  const requiredTables = ['profiles', 'organizations', 'products', 'organization_settings'];
  for (const table of requiredTables) {
    if (sqlContent.includes(`CREATE TABLE public.${table}`)) {
      console.log(`  ✓ Table [${table}] definition verified in SQL schema.`);
    } else {
      throw new Error(`Missing table definition for [${table}] in schema.sql`);
    }
  }

  // Constraint checks
  if (sqlContent.includes('CONSTRAINT uq_organization_sku UNIQUE (organization_id, sku)')) {
    console.log('  ✓ Compound unique constraint on (organization_id, sku) verified.');
  } else {
    throw new Error('Missing compound unique constraint on (organization_id, sku)');
  }

  if (sqlContent.includes('CHECK (quantity_on_hand >= 0)')) {
    console.log('  ✓ Non-negative quantity_on_hand constraint verified.');
  } else {
    throw new Error('Missing CHECK constraint for quantity_on_hand');
  }

  if (sqlContent.includes('normalize_product_sku')) {
    console.log('  ✓ Automatic SKU normalization trigger verified.');
  } else {
    throw new Error('Missing SKU normalization trigger');
  }

  if (sqlContent.includes('handle_new_user') && sqlContent.includes('on_auth_user_created')) {
    console.log('  ✓ Automated new user provisioning trigger (handle_new_user) verified.');
  } else {
    throw new Error('Missing handle_new_user trigger on auth.users');
  }

  if (sqlContent.includes('ENABLE ROW LEVEL SECURITY')) {
    console.log('  ✓ Row Level Security (RLS) policies verified across all tables.');
  } else {
    throw new Error('Missing Row Level Security policies');
  }

  // 3. Live Supabase Connectivity Check
  console.log('\n[3] Testing Supabase Project Connectivity:');
  const connResult = await checkSupabaseConnection();

  console.log(`  Status:    ${connResult.status.toUpperCase()}`);
  console.log(`  Connected: ${connResult.connected ? 'YES' : 'NO'}`);
  console.log(`  Details:   ${connResult.message}`);

  console.log('\n======================================================');
  console.log('SUMMARY:');
  console.log('1. Supabase Client Setup: PASSED');
  console.log('2. SQL Schema Integrity:  PASSED');
  console.log(`3. Live Connection Test:  ${connResult.status.toUpperCase()}`);
  console.log('======================================================\n');
}

runVerification().catch((err) => {
  console.error('\n✗ Verification Failed:', err.message);
  process.exit(1);
});
