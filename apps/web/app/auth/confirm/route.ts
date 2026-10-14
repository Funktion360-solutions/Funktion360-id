import { NextResponse, type NextRequest } from 'next/server';
import {authorizationId,consentPath} from '../../../lib/authorization';
import { client, origin } from '../../../lib/supabase';
export async function GET(request: NextRequest) {
  const token_hash=request.nextUrl.searchParams.get('token_hash');
  const type=request.nextUrl.searchParams.get('type');
  if(token_hash && type==='email') {
    const supabase=await client();
    const {error}=await supabase.auth.verifyOtp({token_hash,type:'email'});
    if(!error) return NextResponse.redirect(origin()+consentPath(authorizationId(request.nextUrl.searchParams.get('authorization_id'))));
  }
  return NextResponse.redirect(origin()+'/login?notice=failed');
}
