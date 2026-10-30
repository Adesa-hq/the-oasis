import 'server-only';
import { insertRegistration } from './supabase-request.mjs';

export async function saveRegistration(data) {
  return insertRegistration({
    url: process.env.SUPABASE_URL,
    key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY,
  }, data);
}
