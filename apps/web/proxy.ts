import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  response.headers.set('Cache-Control', 'private, no-store');
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_PUBLISHABLE_KEY) return response;
  const supabase = createServerClient(process.env.SUPABASE_URL, process.env.SUPABASE_PUBLISHABLE_KEY, {
    cookieOptions: { httpOnly: true, secure: process.env.APP_ORIGIN?.startsWith('https:') ?? false, sameSite: 'lax', path: '/' },
    cookies: { getAll: () => request.cookies.getAll(), setAll: (items) => {
      items.forEach(({name,value}) => request.cookies.set(name,value));
      response = NextResponse.next({request});
      response.headers.set('Cache-Control','private, no-store');
      items.forEach(({name,value,options}) => response.cookies.set(name,value,options));
    } },
  });
  await supabase.auth.getClaims();
  return response;
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'] };
