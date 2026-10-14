import {RegisteredProducts} from './registered-products';
import {administrationMemberships} from '../../lib/administration-memberships';
import Link from 'next/link';
import styles from './account.module.css';
import {SaveButton} from './save-button';
import {requireMfa} from '../../lib/mfa';
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
  await requireMfa(supabase,user);
  const {data:{session}}=await supabase.auth.getSession();
  const favnMemberships=await administrationMemberships(session?.access_token,user.id);
  const [profile,memberships]=await Promise.all([supabase.from('id_profiles').select('display_name').eq('user_id',user.id).maybeSingle(),supabase.from('id_memberships').select('organization_id,role,status,id_organizations(name,kind)').eq('user_id',user.id).eq('status','active')]);
  return <section className={styles.account}>
    <header className={styles.heading}><div><span className="eyebrow">MIN PERSONLIGE KONTO</span><h1>Dit Funktion360 ID</h1><p>Et fælles login til dine produkter. Et sted til din profil.</p></div><span className={styles.badge}>Funktion360 ID</span></header>
    <Notice code={(await searchParams).notice}/>
    {profile.error || memberships.error?<p role="status" className="notice">Nogle kontooplysninger kunne ikke hentes. Prøv at genindlæse siden.</p>:null}
    <div className={styles.grid}>
      <section className={styles.panel} aria-labelledby="profile-title"><span className="eyebrow">DIN PROFIL</span><h2 id="profile-title">Godt at se dig{profile.data?.display_name?', '+profile.data.display_name:''}</h2><p className={styles.email}>{user.email}</p><form action={saveProfile}><label htmlFor="name">Visningsnavn</label><input id="name" name="display_name" defaultValue={profile.data?.display_name || ''} required maxLength={100} autoComplete="name"/><p className="hint">Navnet gemmes på dit Funktion360 ID. Produkterne kan have deres egne profiloplysninger.</p><SaveButton/></form></section>
      <section className={styles.panel} aria-labelledby="products-title"><span className="eyebrow">DIT NÆSTE STOP</span><h2 id="products-title">Dine produkter</h2><a className={styles.product} href="https://voreskok.funktion360.dk/recipes"><span className={styles.productIcon} aria-hidden="true">VK</span><span><strong>Vores Kok</strong><small>Opskrifter, madplan og dit køkken</small></span><span aria-hidden="true">↗</span></a><p className="hint">Vores Kok kontrollerer din produktkonto og adgang, når du åbner produktet.</p><a className={styles.textLink} href="https://voreskok.funktion360.dk/auth/funktion360/link">Tilknyt en eksisterende Vores Kok-konto</a></section>
    </div>
    <RegisteredProducts token={session?.access_token} subject={user.id}/>
    <section className={styles.panel} aria-labelledby="favn-organizations-title"><span className="eyebrow">FAVN360</span><h2 id="favn-organizations-title">Dine organisationer</h2>{favnMemberships===null?<p role="status">Organisationerne kunne ikke hentes fra administrationen. Prøv igen senere.</p>:favnMemberships.length?<ul className={styles.memberships}>{favnMemberships.map(m=><li key={m.organization_id}><strong>{m.name}</strong><span>{{owner:'Ejer',admin:'Administrator',member:'Medlem',billing:'Fakturering'}[m.role]}{m.status==='suspended'?' · Suspenderet':''}</span></li>)}</ul>:<p>Du har endnu ingen Favn360-medlemskaber tilknyttet dit ID.</p>}<p className="hint">Funktion360-teamet administrerer medlemskaber og roller. Favn360 kontrollerer abonnement og adgang til sager.</p></section>
    {memberships.data?.length?<>     <section className={styles.panel} aria-labelledby="organizations-title"><span className="eyebrow">DINE FÆLLESSKABER</span><h2 id="organizations-title">Organisationer</h2>{memberships.error?<p>Medlemskaber kunne ikke hentes.</p>:memberships.data?.length?<ul className={styles.memberships}>{memberships.data.map(m=>{const org=Array.isArray(m.id_organizations)?m.id_organizations[0]:m.id_organizations;const roles:Record<string,string>={owner:'Ejer',admin:'Administrator',member:'Medlem',billing:'Fakturering'};return <li key={m.organization_id}><strong>{org?.name || 'Organisation'}</strong><span>{roles[m.role] || m.role}</span></li>;})}</ul>:<p>Du har endnu ingen aktive organisationsmedlemskaber.</p>}<p className="hint">Organisationer og medlemskaber administreres af Funktion360-teamet.</p><p className="hint">Organisationer samler medlemskaber på Funktion360 ID. Familier i Vores Kok administreres inde i produktet.</p></section> </>:null}
    <section className={styles.panel} aria-labelledby="security-title" style={{marginTop:24}}><span className="eyebrow">SIKKERHED</span><h2 id="security-title">Totrinsbekræftelse</h2><p>{user.factors?.some(f=>f.status==='verified')?'Din ID-konto har totrinsbekræftelse.':'Beskyt dit ID med en ekstra kode fra din authenticator-app.'}</p><Link href="/account/security" className={styles.textLink}>Administrér sikkerhed</Link></section>
    <section className={styles.session} aria-labelledby="session-title"><div><h2 id="session-title">Login på denne enhed</h2><p>Logger dig ud af Funktion360 ID i denne browser. Dine produkters egne login-sessioner håndteres i produkterne.</p></div><form action={logout}><button className="secondary">Log ud af Funktion360 ID</button></form></section>
  </section>;
}
