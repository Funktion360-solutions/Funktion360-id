'use server';
import {redirect} from 'next/navigation';
import {client} from '../../lib/supabase';
import {authorizationId,authPath,consentPath} from '../../lib/authorization';
import {mfaPath} from '../../lib/mfa-policy';
export async function verifyMfa(form:FormData){
 const id=authorizationId(form.get('authorization_id'));
 const db=await client();const {data:{user},error}=await db.auth.getUser();
 if(error || !user)redirect(authPath('login',id));
 const factorId=String(form.get('factorId') || '');const code=String(form.get('code') || '').trim();
 if(!user.factors?.some(f=>f.id===factorId && f.status==='verified' && f.factor_type==='totp') || !/^[0-9]{6}$/.test(code))redirect(mfaPath(id,'invalid'));
 const {error:verifyError}=await db.auth.mfa.challengeAndVerify({factorId,code});
 if(verifyError)redirect(mfaPath(id,'failed'));
 const {data:assurance,error:assuranceError}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
 const {data:{user:verified},error:verifiedError}=await db.auth.getUser();
 if(assuranceError || assurance.currentLevel!=='aal2' || verifiedError || verified?.id!==user.id)redirect(mfaPath(id,'failed'));
 redirect(consentPath(id));
}
