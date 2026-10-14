'use server';
import { redirect } from 'next/navigation';
import { client, origin } from '../lib/supabase';
function credentials(form: FormData) {
  const email = String(form.get('email') || '').trim();
  const password = String(form.get('password') || '');
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || password.length < 12 || password.length > 128) redirect('/login?notice=invalid');
  return {email,password};
}
export async function login(form: FormData) {
  const supabase = await client();
  const {error} = await supabase.auth.signInWithPassword(credentials(form));
  if(error) redirect('/login?notice=failed');
  redirect('/account');
}
export async function signup(form: FormData) {
  const supabase = await client();
  const {error} = await supabase.auth.signUp({...credentials(form),options:{emailRedirectTo:origin()+'/auth/confirm'}});
  if(error) redirect('/signup?notice=failed');
  redirect('/login?notice=confirm');
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
