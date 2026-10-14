'use server';
import {redirect} from 'next/navigation';
import {client} from '../../../lib/supabase';
import {authorizationId,authPath,providerRedirect} from '../../../lib/authorization';
export async function decide(form:FormData) {
  const id=authorizationId(form.get('authorization_id'));
  const decision=form.get('decision');
  if(!id || !['approve','deny'].includes(String(decision))) redirect('/oauth/consent?notice=invalid');
  const supabase=await client();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError || !user) redirect(authPath('login',id));
  const {data:details,error:detailsError}=await supabase.auth.oauth.getAuthorizationDetails(id);
  if(detailsError || !details) redirect('/oauth/consent?notice=invalid');
  if(!('authorization_id' in details)) redirect(providerRedirect(details.redirect_url));
  const {data,error}=decision==='approve'
    ? await supabase.auth.oauth.approveAuthorization(id,{skipBrowserRedirect:true})
    : await supabase.auth.oauth.denyAuthorization(id,{skipBrowserRedirect:true});
  if(error || !data) redirect('/oauth/consent?notice=invalid');
  redirect(providerRedirect(data.redirect_url));
}
