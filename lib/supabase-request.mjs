// Used only by the server wrapper. The injectable request function lets tests
// verify the actual Supabase HTTP contract without contacting a real project.
export async function insertRegistration({ url, key }, { fullName, phone, email }, request = fetch) {
  if (!url || !key) throw new Error('Supabase is not configured');
  if (key.startsWith('sb_publishable_')) {
    throw new Error('A server secret key is required; a publishable key cannot register visitors.');
  }
  const endpoint = new URL('/rest/v1/early_access_registrations', url);
  if (endpoint.protocol !== 'https:') throw new Error('Supabase requires HTTPS');

  const headers = {
    apikey: key,
    'Content-Type': 'application/json',
    Prefer: 'return=minimal',
  };
  // New secret keys belong only in apikey. Legacy service-role keys are JWTs.
  if (!key.startsWith('sb_secret_')) headers.Authorization = `Bearer ${key}`;

  const response = await request(endpoint, {
    method: 'POST',
    headers,
    cache: 'no-store',
    redirect: 'error',
    body: JSON.stringify({ full_name: fullName, phone, email }),
    signal: AbortSignal.timeout(12000),
  });
  if (response.ok) return { error: null };
  const error = await response.json().catch(() => ({}));
  return { error: { code: error.code || 'storage_failed' } };
}
