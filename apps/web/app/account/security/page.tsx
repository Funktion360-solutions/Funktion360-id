import Link from 'next/link';
import {redirect} from 'next/navigation';
import {client} from '../../../lib/supabase';
import {requireMfa} from '../../../lib/mfa';
import {EnrollmentForm,DisableForm} from './forms';
import {factorLabel} from '../../../lib/factor-label';
import styles from './security.module.css';
export const dynamic='force-dynamic';
export default async function Security({searchParams}:{searchParams:Promise<{notice?:string}>}){
 const db=await client();const {data:{user},error}=await db.auth.getUser();
 if(error || !user)redirect('/login');
 await requireMfa(db,user);
 const factors=user.factors?.filter(f=>f.status==='verified') || [];const totp=factors.filter(f=>f.factor_type==='totp');
 const {notice}=await searchParams;
 const authenticators=totp.map((f,index)=>({id:f.id,name:factorLabel(f.friendly_name,index)}));
 return <section className={'card wide '+styles.screen}><span className="eyebrow">FUNKTION360 ID · SIKKERHED</span><h1>Beskyt din konto</h1><p>Totrinsbekræftelse kræver både din adgangskode og en kode fra din authenticator-app.</p>{notice==='enabled'?<p role="status" className="notice">Totrinsbekræftelse er aktiveret.</p>:notice==='disabled'?<p role="status" className="notice">Den valgte authenticator er fjernet.</p>:null}<div className={styles.status}><strong>{factors.length?'Totrinsbekræftelse er aktiv':'Totrinsbekræftelse er ikke aktiv'}</strong><p>Gælder dit Funktion360 ID. Dine produkters sikkerhedsindstillinger er separate.</p></div>{factors.length?<>{totp.length?<><ul>{authenticators.map(f=><li key={f.id}>{f.name}</li>)}</ul>{totp.length<2?<><h2>Tilføj en backup-authenticator</h2><p>Gem backupen på en anden enhed eller et separat sikkert sted, så du stadig kan logge ind, hvis din første authenticator mistes.</p><EnrollmentForm existing={authenticators}/></>:null}<DisableForm factors={authenticators}/></>:<p>Din MFA-metode administreres uden for denne side.</p>}</>:<><h2>Tilføj en authenticator</h2><p>Opsætningen aktiveres først, når din første kode er bekræftet.</p><EnrollmentForm/></>}<p className="hint">Gem dine authenticators sikkert og separat. Har du mistet den ene, kan du bruge den anden til login og til at fjerne den mistede. Recovery-koder er endnu ikke aktiveret.</p><Link className={styles.back} href="/account">Tilbage til Min konto</Link></section>;
}
