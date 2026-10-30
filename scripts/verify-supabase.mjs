import assert from 'node:assert/strict';
import nextEnv from '@next/env';
import { insertRegistration } from '../lib/supabase-request.mjs';
import { handleRegistration } from '../lib/registration-handler.mjs';

nextEnv.loadEnvConfig(process.cwd());
const config = {
  url: process.env.SUPABASE_URL,
  key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
};
const email = 'oasis-connection-test@example.invalid';
const fullName = 'Oasis Connection Test';
const phone = '+2348012345678';

function submission(data) {
  return new Request('https://oasis.example/api/early-access', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
}

try {
  assert.ok(config.url && config.key?.trim(), 'Set SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.');
  assert.ok(!config.key.startsWith('sb_publishable_'), 'SUPABASE_SECRET_KEY contains a publishable key. Replace it with a secret key (sb_secret_...) from the Oasis project API Keys page.');
  assert.equal(new URL(config.url).hostname, 'nzuwqfqxprtvuyskjhyk.supabase.co', 'The URL must point to the Oasis project.');
  // Probe authentication before the handler, which intentionally hides storage
  // errors from public visitors. Diagnostics here never print keys or headers.
  const headers = { apikey: config.key };
  if (!config.key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${config.key}`;
  const probeUrl = new URL('/rest/v1/early_access_registrations', config.url);
  probeUrl.searchParams.set('select', 'id');
  probeUrl.searchParams.set('limit', '0');
  const probe = await fetch(probeUrl, { headers, redirect: 'error', signal: AbortSignal.timeout(12000) });
  assert.ok(probe.ok, `Supabase authentication/table access failed (HTTP ${probe.status}). Check that the secret belongs to the Oasis project.`);
  console.log('Supabase authentication and table access: passed.');

  const save = data => insertRegistration(config, data);
  const invalid = await handleRegistration(submission({}), save);
  assert.equal(invalid.status, 400, 'Invalid input should be rejected.');

  const first = await handleRegistration(submission({ fullName, phone, email }), save);
  assert.equal(first.status, 201, 'Registration failed. Check the key and database configuration.');
  const duplicate = await handleRegistration(submission({
    fullName: 'Duplicate Test', phone: '+2348099999999', email: `  ${email.toUpperCase()}  `,
  }), save);
  assert.equal(duplicate.status, 201, 'Duplicate submission should return success.');

  const url = new URL('/rest/v1/early_access_registrations', config.url);
  url.searchParams.set('email', `eq.${email}`);
  url.searchParams.set('select', 'full_name,phone,email,registered_at');
  const stored = await fetch(url, { headers, redirect: 'error', signal: AbortSignal.timeout(12000) });
  assert.ok(stored.ok, 'Could not verify the stored registration.');
  const rows = await stored.json();
  assert.equal(rows.length, 1, 'There should be exactly one normalized email record.');
  assert.equal(rows[0].full_name, fullName, 'A duplicate must not overwrite the original registration.');
  assert.equal(rows[0].phone, phone);
  assert.ok(!Number.isNaN(Date.parse(rows[0].registered_at)), 'Registration date should be generated.');
  console.log('PASS: live registration, stored details/date, normalized-email duplicate prevention and validation.');
  console.log('A synthetic oasis-connection-test@example.invalid record is retained for review; remove it in Supabase Table Editor after verification.');
  console.log('No secret values were displayed.');
} catch (error) {
  // Never print raw fetch errors, headers or credentials.
  const networkCode = error.cause?.code;
  console.error(networkCode ? `Connection failed (${networkCode}). Check network access and retry.` : error.name === 'AssertionError' ? error.message : 'Verification failed. Check the Supabase configuration and try again.');
  process.exitCode = 1;
}
