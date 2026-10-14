'use server';
import {redirect} from 'next/navigation';
import {client} from '../../../lib/supabase';
import {requireMfa} from '../../../lib/mfa';
export type Enrollment={error?:string,factorId?:string,qr?:string,secret?:string};
export async function enroll(_previous:Enrollment,form:FormData):Promise<Enrollment>{
 const db=await client();const {data:{user},error}=await db.auth.getUser();
 if(error || !user?.email)redirect('/login');
 await requireMfa(db,user);
 if(user.factors?.some(f=>f.status==='verified'))return {error:'Totrinsbekræftelse er allerede aktiveret.'};
 const password=String(form.get('password') || '');
 if(!password || password.length>128)return {error:'Indtast din nuværende ID-adgangskode.'};
 const {data,error:reauthError}=await db.auth.signInWithPassword({email:user.email,password});
 if(reauthError || data.user?.id!==user.id)return {error:'Adgangskoden kunne ikke bekræftes.'};
 const {data:{user:fresh},error:freshError}=await db.auth.getUser();
 if(freshError || fresh?.id!==user.id || fresh.factors?.some(f=>f.status==='verified'))return {error:'Kontostatus er ændret. Genindlæs siden.'};
 // Remove only abandoned enrollments created by this screen, never verified factors.
 for(const factor of fresh.factors || [])if(factor.status==='unverified' && factor.factor_type==='totp' && factor.friendly_name==='Funktion360 ID'){
   const {error:cleanupError}=await db.auth.mfa.unenroll({factorId:factor.id});
   if(cleanupError)return {error:'Den tidligere opsætning kunne ikke afsluttes. Prøv igen.'};
 }
 const {data:enrollment,error:enrollError}=await db.auth.mfa.enroll({factorType:'totp',friendlyName:'Funktion360 ID',issuer:'Funktion360 ID'});
 if(enrollError || !enrollment)return {error:'Opsætningen kunne ikke startes. Kontrollér, at TOTP er aktiveret i Supabase.'};
 return {factorId:enrollment.id,qr:enrollment.totp.qr_code,secret:enrollment.totp.secret};
}
export async function activate(_previous:{error?:string},form:FormData):Promise<{error?:string}>{
 const db=await client();const {data:{user},error}=await db.auth.getUser();
 if(error || !user)redirect('/login');
 const factorId=String(form.get('factorId') || '');const code=String(form.get('code') || '').trim();
 if(!user.factors?.some(f=>f.id===factorId && f.factor_type==='totp' && f.status==='unverified') || !/^[0-9]{6}$/.test(code))return {error:'Indtast en frisk 6-cifret kode fra den nye authenticator.'};
 const {error:verificationError}=await db.auth.mfa.challengeAndVerify({factorId,code});
 if(verificationError)return {error:'Koden kunne ikke bekræftes. Prøv den næste kode.'};
 const {data:assurance,error:assuranceError}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
 const {data:{user:verified},error:userError}=await db.auth.getUser();
 if(assuranceError || assurance.currentLevel!=='aal2' || userError || verified?.id!==user.id || !verified.factors?.some(f=>f.id===factorId && f.status==='verified'))return {error:'Aktiveringen kunne ikke bekræftes. Genindlæs siden.'};
 redirect('/account/security?notice=enabled');
}
export async function disable(_previous:{error?:string},form:FormData):Promise<{error?:string}>{
 const db=await client();const {data:{user},error}=await db.auth.getUser();
 if(error || !user)redirect('/login');
 await requireMfa(db,user);
 const factorId=String(form.get('factorId') || '');const code=String(form.get('code') || '').trim();
 if(form.get('confirm')!=='yes' || !user.factors?.some(f=>f.id===factorId && f.status==='verified' && f.factor_type==='totp') || !/^[0-9]{6}$/.test(code))return {error:'Bekræft deaktiveringen og indtast en frisk kode.'};
 const {error:verificationError}=await db.auth.mfa.challengeAndVerify({factorId,code});
 if(verificationError)return {error:'Koden kunne ikke bekræftes.'};
 const {data:assurance,error:assuranceError}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
 if(assuranceError || assurance.currentLevel!=='aal2')return {error:'MFA kunne ikke bekræftes.'};
 const {error:removeError}=await db.auth.mfa.unenroll({factorId});
 if(removeError)return {error:'Authenticatoren kunne ikke fjernes.'};
 await db.auth.refreshSession();
 redirect('/account/security?notice=disabled');
}
