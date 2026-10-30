import { handleRegistration } from '../../../lib/registration-handler.mjs';
import { saveRegistration } from '../../../lib/supabase';
export const runtime = 'nodejs';
export async function POST(request) {
  return handleRegistration(request, saveRegistration);
}
