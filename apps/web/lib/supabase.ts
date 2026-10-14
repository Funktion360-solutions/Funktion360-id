import 'server-only';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
export function configured() { return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_PUBLISHABLE_KEY); }
export function origin() {
  const url = new URL(process.env.APP_ORIGIN || 'http://localhost:3000');
  if (url.protocol !== 'https:' && !(url.hostname === 'localhost' && url.protocol === 'http:')) throw new Error('APP_ORIGIN skal være HTTPS');
  return url.origin;
}
export async function client() {
  if (!configured()) throw new Error('Identity Supabase er ikke konfigureret');
  const jar = await cookies();
  return createServerClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    cookieOptions: { httpOnly: true, secure: origin().startsWith('https:'), sameSite: 'lax', path: '/' },
    cookies: { getAll: () => jar.getAll(), setAll: (items) => {
      try { items.forEach(({ name, value, options }) => jar.set(name, value, options)); }
      catch { /* Server components cannot write; proxy refreshes cookies. */ }
    } },
  });
}
