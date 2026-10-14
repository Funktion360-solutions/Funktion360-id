'use server';
import {redirect} from 'next/navigation';
import {client,origin} from '../../lib/supabase';
export async function requestReset(form:FormData){
 const email=String(form.get('email') || '').trim();
 if(email.length>254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))redirect('/forgot-password?notice=invalid');
 const db=await client();
 const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:origin()+'/reset-password?flow=recovery'});
 if(error)console.error('[Funktion360 password recovery]',error.code || 'request_failed');
 // Same public response regardless of account existence or provider response.
 redirect('/forgot-password?notice=sent');
}
