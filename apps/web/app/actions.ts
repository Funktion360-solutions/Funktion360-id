'use server';
import { redirect } from 'next/navigation';
import { client, origin } from '../lib/supabase';
import {authorizationId,authPath,consentPath} from '../lib/authorization';
function credentials(form: FormData) {
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) redirect(authPath('login',authorizationId(form.get('authorization_id')),'invalid'));
  return {email,password};
}
export async function login(form: FormData) {
  const supabase = await client();
  const {error} = await supabase.auth.signInWithPassword(credentials(form));
  if(error) redirect(authPath('login',authorizationId(form.get('authorization_id')),'failed'));
  redirect(consentPath(authorizationId(form.get('authorization_id'))));
}
export async function signup(form: FormData) {
  const supabase = await client();
  const {error} = await supabase.auth.signUp({...credentials(form),options:{emailRedirectTo:origin()+'/auth/confirm'+(authorizationId(form.get('authorization_id'))?'?authorization_id='+encodeURIComponent(authorizationId(form.get('authorization_id'))!):'?flow=signup')}});
  if(error) redirect(authPath('signup',authorizationId(form.get('authorization_id')),'failed'));
  redirect(authPath('login',authorizationId(form.get('authorization_id')),'confirm'));
}
export async function logout() {
  const supabase=await client();
  const {error}=await supabase.auth.signOut({scope:'local'});
  if(error) redirect('/account?notice=failed');
  redirect('/login');
}
export async function saveProfile(form: FormData) {
  const supabase=await client();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError || !user) redirect('/login');
  const name=String(form.get('display_name') || '').trim();
  if(!name || name.length>100) redirect('/account?notice=invalid');
  const {error}=await supabase.from('id_profiles').upsert({user_id:user.id,display_name:name},{onConflict:'user_id'});
  redirect(error ? '/account?notice=database' : '/account?notice=saved');
}
