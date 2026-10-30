import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration } from '../lib/validation.mjs';
import { handleRegistration } from '../lib/registration-handler.mjs';
const valid = {
  fullName: '  Adé   Okafor ',
  phone: '+234 (801) 234-5678',
  email: '  ADE@EXAMPLE.COM  '
};
function request(body, headers = {}) {
  return new Request('https://oasis.example/api/early-access', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...headers
    },
    body: typeof body === 'string' ? body : JSON.stringify(body)
  });
}
test('normalizes names, email and phone before saving', async () => {
  const result = validateRegistration(valid);
  assert.equal(result.valid, true);
  assert.deepEqual(result.data, {
    fullName: 'Adé Okafor',
    phone: '+2348012345678',
    email: 'ade@example.com'
  });
  let saved;
  const response = await handleRegistration(request(valid), async data => {
    saved = data;
    return {
      error: null
    };
  });
  assert.equal(response.status, 201);
  assert.deepEqual(saved, result.data);
});
test('rejects missing, malformed, oversized and non-object fields', () => {
  for (const input of [null, [], {}, {
    ...valid,
    email: 'bad@'
  }, {
    ...valid,
    phone: 'abc123456789'
  }, {
    ...valid,
    phone: '+123'
  }, {
    ...valid,
    fullName: 'a'
  }, {
    ...valid,
    fullName: 'a'.repeat(121)
  }, {
    ...valid,
    fullName: '<script>'
  }]) assert.equal(validateRegistration(input).valid, false);
});
test('invalid submissions never reach storage', async () => {
  let called = false;
  const response = await handleRegistration(request({}), async () => {
    called = true;
  });
  assert.equal(response.status, 400);
  assert.equal(called, false);
  assert.equal(Object.keys((await response.json()).errors).length, 3);
});
test('duplicate email is idempotent without revealing existing registrations', async () => {
  const response = await handleRegistration(request(valid), async () => ({
    error: {
      code: '23505'
    }
  }));
  assert.equal(response.status, 201);
  assert.deepEqual(await response.json(), {
    success: true
  });
});
test('storage errors and unavailable configuration produce a helpful failure', async () => {
  for (const save of [async () => ({
    error: {
      code: '42P01'
    }
  }), async () => {
    throw Error('secret configuration');
  }]) {
    const response = await handleRegistration(request(valid), save);
    assert.equal(response.status, 503);
    assert.doesNotMatch(await response.text(), /secret/);
  }
});
test('rejects cross-origin, malformed JSON, oversized bodies and unsupported content types', async () => {
  for (const [req, status] of [[request(valid, {
    Origin: 'https://evil.example'
  }), 403], [request('{'), 400], [request('x'.repeat(5000)), 413], [request(valid, {
    'Content-Type': 'text/plain'
  }), 415]]) {
    const response = await handleRegistration(req, async () => {
      assert.fail('must not save');
    });
    assert.equal(response.status, status);
  }
});
test('honeypot submissions do not create registrations', async () => {
  const response = await handleRegistration(request({
    ...valid,
    website: 'spam.example'
  }), async () => {
    assert.fail('must not save');
  });
  assert.equal(response.status, 201);
});
test('same-origin submissions work and responses are not cached', async () => {
  const response = await handleRegistration(request(valid, {
    Origin: 'https://oasis.example'
  }), async () => ({
    error: null
  }));
  assert.equal(response.status, 201);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

// Check the persistence adapter, including modern secret-key authentication.
const { insertRegistration } = await import('../lib/supabase-request.mjs');
test('Supabase insert sends normalized fields with a server secret and no returned records', async () => {
  const data = validateRegistration(valid).data;
  const result = await insertRegistration({url:'https://example.supabase.co',key:'sb_secret_test'}, data, async (url, options) => {
    assert.equal(url.href,'https://example.supabase.co/rest/v1/early_access_registrations');
    assert.equal(options.headers.apikey,'sb_secret_test');
    assert.equal(options.headers.Authorization,undefined);
    assert.equal(options.headers.Prefer,'return=minimal');
    assert.equal(options.method,'POST');
    assert.equal(options.cache,'no-store');
    assert.equal(options.redirect,'error');
    assert.deepEqual(JSON.parse(options.body),{full_name:'Adé Okafor',phone:'+2348012345678',email:'ade@example.com'});
    return new Response(null,{status:201});
  });
  assert.deepEqual(result,{error:null});
});
test('legacy service-role keys use the bearer header', async () => {
  await insertRegistration({url:'https://example.supabase.co',key:'legacy-test-jwt'}, validateRegistration(valid).data, async (_,options) => {
    assert.equal(options.headers.Authorization,'Bearer legacy-test-jwt');
    return new Response(null,{status:201});
  });
});
test('Supabase unique-constraint errors pass through to idempotent handler', async () => {
  const response = await handleRegistration(request(valid), data => insertRegistration({url:'https://example.supabase.co',key:'sb_secret_test'},data,async()=>Response.json({code:'23505'},{status:409})));
  assert.equal(response.status,201);
});
test('missing configuration and insecure connections cannot send credentials', async () => {
  for (const config of [{},{url:'http://example.supabase.co',key:'sb_secret_test'}]) {
    await assert.rejects(insertRegistration(config,validateRegistration(valid).data,async()=>assert.fail('must not send')));
  }
});


test('publishable keys are rejected before sending a registration', async () => {
  await assert.rejects(
    insertRegistration({url:'https://example.supabase.co',key:'sb_publishable_test'},validateRegistration(valid).data,async()=>assert.fail('must not send')),
    /server secret key is required/
  );
});
