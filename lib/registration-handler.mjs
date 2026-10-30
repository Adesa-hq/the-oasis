import { validateRegistration } from './validation.mjs';
const reply = (body, status) => Response.json(body, {
  status,
  headers: {
    'Cache-Control': 'no-store',
    'X-Content-Type-Options': 'nosniff'
  }
});
export async function handleRegistration(request, save) {
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) return reply({
    message: 'Please submit the registration form as JSON.'
  }, 415);
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) return reply({
    message: 'Please submit the form from this website.'
  }, 403);
  if (Number(request.headers.get('content-length')) > 4096) return reply({
    message: 'Your submission is too large.'
  }, 413);
  let input;
  try {
    const reader = request.body?.getReader();
    if (!reader) return reply({
      message: 'Please complete the registration form.'
    }, 400);
    const chunks = [];
    let size = 0;
    while (true) {
      const {
        done,
        value
      } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > 4096) {
        await reader.cancel();
        return reply({
          message: 'Your submission is too large.'
        }, 413);
      }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) {
      bytes.set(chunk, offset);
      offset += chunk.byteLength;
    }
    input = JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    return reply({
      message: 'Please submit a valid registration form.'
    }, 400);
  }
  const validation = validateRegistration(input);
  if (!validation.valid) return reply({
    message: 'Please check the highlighted fields.',
    errors: validation.errors
  }, 400);
  if (input.website) return reply({
    success: true
  }, 201);
  try {
    const result = await save(validation.data);
    // Identical response prevents leaking who has registered; unique constraint preserves the first record.
    if (result.error && result.error.code !== '23505') throw new Error('storage_failed');
    return reply({
      success: true
    }, 201);
  } catch {
    return reply({
      message: 'Registration is temporarily unavailable. Please try again shortly.'
    }, 503);
  }
}
