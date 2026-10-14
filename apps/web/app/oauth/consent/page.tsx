import Link from 'next/link';
import {redirect} from 'next/navigation';
import {client,configured} from '../../../lib/supabase';
import {authorizationId,authPath,providerRedirect} from '../../../lib/authorization';
import {decide} from './actions';
export const dynamic='force-dynamic';
const labels:Record<string,string>={openid:'Din brugeridentitet',email:'Din e-mailadresse',profile:'Grundlæggende profiloplysninger'};
export default async function Consent({searchParams}:{searchParams:Promise<{authorization_id?:string}>}) {
  const id=authorizationId((await searchParams).authorization_id);
  if(!id) return <section className="card"><h1>Loginforsøget er ugyldigt</h1><p>Start login igen fra det produkt, du vil bruge.</p><Link href="/">Til Funktion360 ID</Link></section>;
  if(!configured()) return <section className="card"><h1>SSO mangler opsætning</h1><p>Tilslut Identity-projektet og aktivér Supabases OAuth-server for at teste produktlogin.</p></section>;
  const supabase=await client();
  const {data:{user},error:authError}=await supabase.auth.getUser();
  if(authError || !user) redirect(authPath('login',id));
  const {data,error}=await supabase.auth.oauth.getAuthorizationDetails(id);
  if(error || !data) return <section className="card"><h1>Loginforsøget er udløbet</h1><p>Start login igen fra produktet.</p></section>;
  if(!('authorization_id' in data)) redirect(providerRedirect(data.redirect_url));
  const scopeItems=[...new Set((data.scope || '').split(/\s+/).filter(Boolean))];
  return <section className="card"><span className="eyebrow">FORTSÆT TIL DIT PRODUKT</span><h1>{data.client.name}</h1><p>Du er logget ind som {user.email}.</p><p>Produktet beder om adgang til:</p><ul>{scopeItems.map(scope=><li key={scope}>{labels[scope] || scope}</li>)}</ul><p className="hint">Modtager: {new URL(data.redirect_uri).hostname}. Produktets egne adgangsregler gælder stadig.</p><form action={decide}><input type="hidden" name="authorization_id" value={id}/><button name="decision" value="approve">Fortsæt til {data.client.name}</button><button className="secondary" name="decision" value="deny">Annullér</button></form></section>;
}
