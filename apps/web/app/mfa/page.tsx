import {redirect} from 'next/navigation';
import {client} from '../../lib/supabase';
import {authorizationId,authPath,consentPath} from '../../lib/authorization';
import {needsMfa} from '../../lib/mfa-policy';
import {verifyMfa} from './actions';
import {logout} from '../actions';
export const dynamic='force-dynamic';
export default async function Mfa({searchParams}:{searchParams:Promise<{authorization_id?:string,notice?:string}>}){
 const params=await searchParams;const id=authorizationId(params.authorization_id);
 const db=await client();const {data:{user},error}=await db.auth.getUser();
 if(error || !user)redirect(authPath('login',id));
 const {data:assurance,error:assuranceError}=await db.auth.mfa.getAuthenticatorAssuranceLevel();
 if(!assuranceError && !needsMfa(user.factors,assurance?.currentLevel))redirect(consentPath(id));
 const factors=user.factors?.filter(f=>f.status==='verified' && f.factor_type==='totp') || [];
 return <section className="card"><span className="eyebrow">FUNKTION360 ID · SIKKERHED</span><h1>Bekræft, at det er dig</h1><p>Indtast koden fra din authenticator-app for {user.email}.</p>{params.notice?<p role="status" className="notice">Koden kunne ikke bekræftes. Prøv med en frisk 6-cifret kode.</p>:null}{factors.length && !assuranceError?<form action={verifyMfa}><input type="hidden" name="authorization_id" value={id || ''}/><label htmlFor="factor">Authenticator</label><select id="factor" name="factorId" className="secondary">{factors.map((f,index)=><option key={f.id} value={f.id}>Authenticator {index+1}</option>)}</select><label htmlFor="mfa-code">6-cifret kode</label><input id="mfa-code" type="text" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" minLength={6} maxLength={6} required/><button>Bekræft og fortsæt</button></form>:<p role="status" className="notice">MFA kan ikke bekræftes her lige nu. Kontakt support, hvis du ikke kan bruge din authenticator.</p>}<p className="hint">MFA på Funktion360 ID og MFA i dine produkter administreres separat.</p><form action={logout}><button className="secondary">Log ud og brug en anden konto</button></form></section>;
}
