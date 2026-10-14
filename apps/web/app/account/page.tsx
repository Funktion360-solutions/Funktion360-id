import {redirect} from 'next/navigation';
import {client,configured} from '../../lib/supabase';
import {saveProfile,logout} from '../actions';
import {Notice} from '../auth-form';
export const dynamic='force-dynamic';
export default async function Account({searchParams}:{searchParams:Promise<{notice?:string}>}) {
  if(!configured()) return <section className="card"><h1>Min Funktion360-konto</h1><p>Tilslut først det dedikerede Identity Supabase-projekt. Eksisterende produktkonti bliver ikke ændret.</p></section>;
  const supabase=await client();
  const {data:{user},error}=await supabase.auth.getUser();
  if(error || !user) redirect('/login');
  const [profile,memberships]=await Promise.all([supabase.from('id_profiles').select('display_name').eq('user_id',user.id).maybeSingle(),supabase.from('id_memberships').select('organization_id,role,status,id_organizations(name,kind)').eq('user_id',user.id).eq('status','active')]);
  return <section className="card wide"><span className="eyebrow">MIN KONTO</span><h1>Dit Funktion360 ID</h1><p>{user.email}</p><Notice code={(await searchParams).notice}/>{profile.error || memberships.error?<p role="status" className="notice">Kontodata kunne ikke hentes. Kontrollér databaseopsætningen.</p>:null}<form action={saveProfile}><label htmlFor="name">Visningsnavn</label><input id="name" name="display_name" defaultValue={profile.data?.display_name || ''} required maxLength={100}/><button>Gem profil</button></form><h2>Organisationer</h2>{memberships.data?.length?<ul>{memberships.data.map(m=>{ const org=Array.isArray(m.id_organizations)?m.id_organizations[0]:m.id_organizations; return <li key={m.organization_id}>{org?.name || 'Organisation'} · {m.role}</li>; })}</ul>:<p>Ingen aktive medlemskaber.</p>}<p className="hint">Oprettelse, invitationer og ændring af roller kommer i næste pakke.</p><form action={logout}><button className="secondary">Log ud på denne enhed</button></form></section>;
}
