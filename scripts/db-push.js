#!/usr/bin/env node

/**
 * Database Migration Runner
 * 
 * Pushes local SQL migrations to your Supabase database.
 * 
 * Usage:
 *   npm run db:push           # Run all pending migrations
 *   npm run db:push -- --file 001_add_highlights.sql  # Run specific migration
 *   npm run db:reset          # Reset and run master schema + all migrations
 * 
 * Environment Variables Required:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  (for running migrations)
 *   DATABASE_URL               (optional, for direct connection)
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env.local (without requiring dotenv)
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const env = {};
  
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        env[key] = value;
      }
    });
  }
  
  return env;
}

const envVars = loadEnv();
const SUPABASE_URL = envVars.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logError(message) {
  console.error(`${colors.red}❌ ${message}${colors.reset}`);
}

function logSuccess(message) {
  console.log(`${colors.green}✅ ${message}${colors.reset}`);
}

function logInfo(message) {
  console.log(`${colors.blue}ℹ️  ${message}${colors.reset}`);
}

function logWarning(message) {
  console.log(`${colors.yellow}⚠️  ${message}${colors.reset}`);
}

/**
 * Execute SQL against Supabase using the REST API
 */
async function executeSQL(sql, description = 'SQL query') {
  return new Promise((resolve, reject) => {
    if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
      reject(new Error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY'));
      return;
    }

    const url = new URL(SUPABASE_URL);
    
    const options = {
      hostname: url.hostname,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Prefer': 'return=representation',
      },
    };

    // Try using the SQL endpoint directly
    options.path = '/rest/v1/';

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ query: sql }));
    req.end();
  });
}

/**
 * Get list of migration files
 */
function getMigrationFiles() {
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    logError(`Migrations directory not found: ${migrationsDir}`);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  return files.map(filename => ({
    filename,
    path: path.join(migrationsDir, filename),
    content: fs.readFileSync(path.join(migrationsDir, filename), 'utf-8'),
  }));
}

/**
 * Print migration file contents for manual execution
 */
function printMigration(migration) {
  console.log('\n' + '='.repeat(80));
  console.log(`📄 ${migration.filename}`);
  console.log('='.repeat(80));
  console.log(migration.content);
  console.log('='.repeat(80) + '\n');
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const specificFile = args.find(a => a.startsWith('--file='))?.split('=')[1];
  const printOnly = args.includes('--print');
  const masterOnly = args.includes('--master');
  
  log('\n🚀 Balearic Charter Database Migration Tool', 'cyan');
  log('=' .repeat(50), 'cyan');

  // Check environment (optional - we can still print migrations without it)
  if (SUPABASE_URL) {
    logInfo(`Supabase URL: ${SUPABASE_URL}`);
  } else {
    logWarning('NEXT_PUBLIC_SUPABASE_URL not set. Printing SQL for manual execution.');
  }

  if (!SERVICE_ROLE_KEY && SUPABASE_URL) {
    logWarning('SUPABASE_SERVICE_ROLE_KEY is not set. Cannot auto-push migrations.');
  }

  // Get migrations
  const migrations = getMigrationFiles();
  
  if (migrations.length === 0) {
    logWarning('No migration files found in supabase/migrations/');
    process.exit(0);
  }

  log(`\n📋 Found ${migrations.length} migration files:`, 'blue');
  migrations.forEach(m => console.log(`   - ${m.filename}`));

  // Filter migrations
  let toRun = migrations;
  
  if (specificFile) {
    toRun = migrations.filter(m => m.filename.includes(specificFile));
    if (toRun.length === 0) {
      logError(`No migration file matching: ${specificFile}`);
      process.exit(1);
    }
  }

  if (masterOnly) {
    toRun = migrations.filter(m => m.filename.includes('000_master'));
  }

  // Execute or print migrations
  console.log('');
  
  if (printOnly || !SERVICE_ROLE_KEY) {
    log('📝 Printing migrations for manual execution in Supabase SQL Editor:\n', 'yellow');
    
    for (const migration of toRun) {
      printMigration(migration);
    }

    log('\n💡 How to apply these migrations:', 'cyan');
    log('   1. Go to Supabase Dashboard → SQL Editor', 'reset');
    log('   2. Copy each migration SQL above', 'reset');
    log('   3. Paste and click "Run"', 'reset');
    log('   4. Run migrations in order (000, 001, 002, ...)\n', 'reset');
    
  } else {
    // Note: Direct SQL execution via REST API requires custom RPC function
    // For now, we print instructions
    logWarning('Direct SQL execution requires Supabase CLI or custom RPC function.');
    log('\n📝 Printing migrations for manual execution:\n', 'yellow');
    
    for (const migration of toRun) {
      printMigration(migration);
    }

    log('\n💡 Recommended: Use Supabase CLI for automated migrations:', 'cyan');
    log('   npm install -g supabase', 'reset');
    log('   supabase login', 'reset');
    log('   supabase link --project-ref YOUR_PROJECT_REF', 'reset');
    log('   supabase db push\n', 'reset');
  }

  logSuccess('Migration preparation complete!');
}

main().catch(err => {
  logError(err.message);
  process.exit(1);
});
