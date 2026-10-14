import 'server-only';
import {redirect} from 'next/navigation';
import {client} from './supabase';
import {needsMfa,mfaPath} from './mfa-policy';
export async function requireMfa(db:Awaited<ReturnType<typeof client>>,user:{factors?:Array<{status:string}>},authorization?:string){
 if(!user.factors?.some(f=>f.status==='verified'))return;
 const {data,error}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
 if(error || needsMfa(user.factors,data?.currentLevel))redirect(mfaPath(authorization));
}
