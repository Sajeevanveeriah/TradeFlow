#!/usr/bin/env node

/**
 * Environment Variable Validation Script
 * Run this to verify your .env file is configured correctly
 *
 * Usage: node scripts/validate-env.js
 */

const fs = require('fs');
const path = require('path');

// ANSI color codes for terminal output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkEnvFile() {
  const envPath = path.join(process.cwd(), '.env');

  if (!fs.existsSync(envPath)) {
    log('\n❌ Error: .env file not found!', 'red');
    log('\n📝 Solution:', 'cyan');
    log('   1. Copy the example file: cp .env.example .env', 'yellow');
    log('   2. Fill in your credentials', 'yellow');
    log('   3. Run this script again\n', 'yellow');
    process.exit(1);
  }

  log('✅ .env file found', 'green');
  return envPath;
}

function loadEnvFile(envPath) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  const envVars = {};

  envContent.split('\n').forEach(line => {
    // Skip comments and empty lines
    if (line.startsWith('#') || !line.trim()) return;

    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
    }
  });

  return envVars;
}

function validateRequired(envVars) {
  log('\n📋 Checking Required Variables...', 'cyan');

  const required = [
    {
      key: 'DATABASE_URL',
      description: 'PostgreSQL connection string from Supabase',
      example: 'postgresql://postgres:password@db.xxx.supabase.co:5432/postgres',
      validate: (val) => val.startsWith('postgresql://') && val.includes('supabase.co'),
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_URL',
      description: 'Supabase project URL',
      example: 'https://xxxxx.supabase.co',
      validate: (val) => val.startsWith('https://') && val.includes('supabase.co'),
    },
    {
      key: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      description: 'Supabase anon/public key',
      example: 'eyJ...',
      validate: (val) => val.startsWith('eyJ') && val.length > 100,
    },
    {
      key: 'JWT_SECRET',
      description: 'Secret key for JWT tokens (min 32 characters)',
      example: 'your-random-64-character-string',
      validate: (val) => val.length >= 32,
    },
    {
      key: 'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      description: 'Stripe publishable key',
      example: 'pk_test_...',
      validate: (val) => val.startsWith('pk_test_') || val.startsWith('pk_live_'),
    },
    {
      key: 'STRIPE_SECRET_KEY',
      description: 'Stripe secret key',
      example: 'sk_test_...',
      validate: (val) => val.startsWith('sk_test_') || val.startsWith('sk_live_'),
    },
  ];

  let hasErrors = false;

  required.forEach(({ key, description, example, validate }) => {
    const value = envVars[key];

    if (!value || value === '' || value.includes('your-') || value.includes('xxxxx')) {
      log(`   ❌ ${key}: Missing or placeholder value`, 'red');
      log(`      ${description}`, 'yellow');
      log(`      Example: ${example}`, 'yellow');
      hasErrors = true;
    } else if (validate && !validate(value)) {
      log(`   ⚠️  ${key}: Invalid format`, 'yellow');
      log(`      ${description}`, 'yellow');
      log(`      Example: ${example}`, 'yellow');
      hasErrors = true;
    } else {
      log(`   ✅ ${key}`, 'green');
    }
  });

  return !hasErrors;
}

function validateOptional(envVars) {
  log('\n📋 Checking Optional Variables...', 'cyan');

  const optional = [
    {
      key: 'TWILIO_ACCOUNT_SID',
      description: 'Twilio Account SID (for SMS)',
      example: 'ACxxxxx',
      validate: (val) => val.startsWith('AC'),
    },
    {
      key: 'TWILIO_AUTH_TOKEN',
      description: 'Twilio Auth Token',
      example: 'your-auth-token',
    },
    {
      key: 'TWILIO_PHONE_NUMBER',
      description: 'Twilio phone number (Australian)',
      example: '+61412345678',
      validate: (val) => val.startsWith('+61'),
    },
    {
      key: 'SENDGRID_API_KEY',
      description: 'SendGrid API key (for email)',
      example: 'SG.xxxxx',
      validate: (val) => val.startsWith('SG.'),
    },
    {
      key: 'SENDGRID_FROM_EMAIL',
      description: 'SendGrid verified sender email',
      example: 'hello@yourdomain.com',
      validate: (val) => val.includes('@'),
    },
  ];

  let warnings = 0;

  optional.forEach(({ key, description, example, validate }) => {
    const value = envVars[key];

    if (!value || value === '') {
      log(`   ⚠️  ${key}: Not configured`, 'yellow');
      log(`      ${description} (optional)`, 'yellow');
      warnings++;
    } else if (validate && !validate(value)) {
      log(`   ⚠️  ${key}: Invalid format`, 'yellow');
      log(`      ${description}`, 'yellow');
      log(`      Example: ${example}`, 'yellow');
      warnings++;
    } else {
      log(`   ✅ ${key}`, 'green');
    }
  });

  if (warnings > 0) {
    log(`\n   ℹ️  ${warnings} optional variable(s) not configured`, 'cyan');
    log('   SMS and email features will be disabled', 'cyan');
  }
}

function validateStripe(envVars) {
  log('\n💳 Checking Stripe Configuration...', 'cyan');

  const testMode = envVars.STRIPE_SECRET_KEY?.startsWith('sk_test_');

  if (testMode) {
    log('   ℹ️  Stripe is in TEST MODE', 'cyan');
    log('   You can test with card: 4242 4242 4242 4242', 'cyan');
  } else {
    log('   ⚠️  Stripe is in LIVE MODE', 'yellow');
    log('   Real payments will be processed!', 'yellow');
  }

  // Check price IDs
  const priceIds = [
    'STRIPE_PRICE_STARTER_MONTHLY',
    'STRIPE_PRICE_PROFESSIONAL_MONTHLY',
    'STRIPE_PRICE_PREMIUM_MONTHLY',
  ];

  let missingPrices = 0;
  priceIds.forEach(key => {
    const value = envVars[key];
    if (!value || !value.startsWith('price_')) {
      log(`   ⚠️  ${key}: Not configured or invalid`, 'yellow');
      missingPrices++;
    } else {
      log(`   ✅ ${key}`, 'green');
    }
  });

  if (missingPrices > 0) {
    log('\n   ⚠️  Subscription pricing not fully configured', 'yellow');
    log('   Create products in Stripe Dashboard and add Price IDs', 'yellow');
  }
}

function validateDatabase(envVars) {
  log('\n🗄️  Database Configuration...', 'cyan');

  const dbUrl = envVars.DATABASE_URL;

  if (dbUrl?.includes('localhost') || dbUrl?.includes('127.0.0.1')) {
    log('   ⚠️  Using local database', 'yellow');
    log('   For production, use Supabase or hosted PostgreSQL', 'yellow');
  } else if (dbUrl?.includes('supabase.co')) {
    log('   ✅ Using Supabase PostgreSQL', 'green');
  }
}

function generateReport(requiredValid) {
  log('\n' + '='.repeat(60), 'cyan');
  log('VALIDATION SUMMARY', 'cyan');
  log('='.repeat(60), 'cyan');

  if (requiredValid) {
    log('\n✅ All required variables are configured!', 'green');
    log('\nNext steps:', 'cyan');
    log('   1. Run: npm run prisma:generate', 'yellow');
    log('   2. Run: npm run prisma:push', 'yellow');
    log('   3. Run: npm run dev', 'yellow');
    log('   4. Open: http://localhost:3000\n', 'yellow');
  } else {
    log('\n❌ Some required variables are missing or invalid', 'red');
    log('\nPlease fix the errors above and run this script again.\n', 'yellow');
    process.exit(1);
  }
}

function main() {
  log('\n' + '='.repeat(60), 'cyan');
  log('TradeFlow Environment Variable Validator', 'cyan');
  log('='.repeat(60) + '\n', 'cyan');

  const envPath = checkEnvFile();
  const envVars = loadEnvFile(envPath);

  const requiredValid = validateRequired(envVars);
  validateOptional(envVars);
  validateStripe(envVars);
  validateDatabase(envVars);

  generateReport(requiredValid);
}

// Run the validator
main();
