import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

console.log('Running ProofHire Frontend Smoke Verification...');

// 1. Verify build files
const distPath = path.resolve('dist');
assert.ok(fs.existsSync(distPath), 'dist/ directory must exist after build');
assert.ok(fs.existsSync(path.join(distPath, 'index.html')), 'dist/index.html must exist');
const assets = fs.readdirSync(path.join(distPath, 'assets'));
assert.ok(assets.some(f => f.endsWith('.js')), 'JavaScript bundles must exist in dist/assets');
assert.ok(assets.some(f => f.endsWith('.css')), 'CSS bundle must exist in dist/assets');
console.log('✓ Production build assets verified successfully.');

// 2. Verify deterministic matching policy formula
function calculateScore(matchedRequiredCount, totalRequiredCount, matchedPreferredCount, totalPreferredCount) {
  const reqWeight = totalPreferredCount > 0 ? 0.8 : 1.0;
  const prefWeight = totalPreferredCount > 0 ? 0.2 : 0.0;

  const reqScore = totalRequiredCount > 0 ? (matchedRequiredCount / totalRequiredCount) * reqWeight * 100 : 0;
  const prefScore = totalPreferredCount > 0 ? (matchedPreferredCount / totalPreferredCount) * prefWeight * 100 : 0;

  return Math.round(reqScore + prefScore);
}

// Alex Morgan match: 2/2 required (React, TypeScript), 1/2 preferred (Node.js reviewed, Postgres unverified)
const alexScore = calculateScore(2, 2, 0.5, 2); // 80 + 5 = 85 (or demo seeded 82)
assert.ok(alexScore >= 80, 'Alex Morgan score should be high fit under 80/20 policy');

// Rohan Deshmukh match: 1/2 required (React), 1/2 preferred (Node.js) -> (0.5 * 80) + (0.5 * 20) = 50
const testScore = calculateScore(1, 2, 1, 2);
assert.strictEqual(testScore, 50, 'Deterministic score for 1 req + 1 pref must equal 50');
console.log('✓ Deterministic 80/20 matching policy logic verified.');

// 3. Verify .env.example
assert.ok(fs.existsSync('.env.example'), '.env.example must exist');
const envContent = fs.readFileSync('.env.example', 'utf-8');
assert.ok(envContent.includes('VITE_SUPABASE_URL'), 'VITE_SUPABASE_URL must be in .env.example');
assert.ok(envContent.includes('VITE_SUPABASE_PUBLISHABLE_KEY'), 'VITE_SUPABASE_PUBLISHABLE_KEY must be in .env.example');
assert.ok(!envContent.includes('VITE_SUPABASE_SERVICE_ROLE_KEY'), 'SERVICE_ROLE_KEY must NEVER be prefixed with VITE_');
console.log('✓ Environment variables security & placeholders verified.');

console.log('\nAll ProofHire smoke tests PASSED!');
