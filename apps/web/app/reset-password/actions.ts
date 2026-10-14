'use server';
import {redirect} from 'next/navigation';
import {client} from '../../lib/supabase';
import {recoveryToken,newPassword} from '../../lib/recovery';
export async function resetPassword(form:FormData){
 const token=recoveryToken(form.get('token_hash'));
 const password=newPassword(form.get('password'),form.get('confirmation'));
 if(!token || !password)redirect('/forgot-password?notice=retry');
 const db=await client();
 const {data,error}=await db.auth.verifyOtp({token_hash:token,type:'recovery'});
 if(error || !data.user)redirect('/forgot-password?notice=expired');
 const {data:{user},error:userError}=await db.auth.getUser();
 if(userError || user?.id!==data.user.id)redirect('/forgot-password?notice=expired');
 const factors=user.factors?.filter(f=>f.status==='verified') || [];
 if(factors.length){
   const factor=factors.find(f=>f.factor_type==='totp');
   const code=String(form.get('mfaCode') || '').trim();
   if(!factor || !/^[0-9]{6}$/.test(code))redirect('/forgot-password?notice=mfa');
   const verified=await db.auth.mfa.challengeAndVerify({factorId:factor.id,code});
   const assurance=await db.auth.mfa.getAuthenticatorAssuranceLevel();
   if(verified.error || assurance.error || assurance.data.currentLevel!=='aal2')redirect('/forgot-password?notice=mfa');
 }
 const {error:updateError}=await db.auth.updateUser({password});
 if(updateError)redirect('/forgot-password?notice=retry');
 await db.auth.signOut({scope:'local'});
 redirect('/login?notice=password_reset');
}
