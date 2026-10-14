import Link from 'next/link';
import {recoveryToken} from '../../lib/recovery';
import {resetPassword} from './actions';
export const dynamic='force-dynamic';
export const metadata={title:'Ny adgangskode · Funktion360 ID',robots:{index:false,follow:false},referrer:'no-referrer' as const};
export default async function ResetPassword({searchParams}:{searchParams:Promise<{token_hash?:string|string[],type?:string|string[]}>}){
 const params=await searchParams;const token=params.type==='recovery'?recoveryToken(params.token_hash):undefined;
 if(!token)return <section className="card"><h1>Et nyt link er nødvendigt</h1><p>Åbn linket i din mail, eller bed om et nyt.</p><Link href="/forgot-password">Send et nyt link</Link></section>;
 return <section className="card"><span className="eyebrow">FUNKTION360 ID</span><h1>Vælg en ny adgangskode</h1><p>Adgangskoden gælder dit Funktion360 ID.</p><form action={resetPassword}><input type="hidden" name="token_hash" value={token}/><label htmlFor="new-password">Ny adgangskode</label><input id="new-password" type="password" name="password" autoComplete="new-password" minLength={12} maxLength={128} required/><label htmlFor="confirmation">Gentag adgangskoden</label><input id="confirmation" type="password" name="confirmation" autoComplete="new-password" minLength={12} maxLength={128} required/><label htmlFor="reset-mfa">Authenticator-kode, hvis du har MFA</label><input id="reset-mfa" type="text" inputMode="numeric" autoComplete="one-time-code" name="mfaCode" pattern="[0-9]{6}" maxLength={6}/><p className="hint">Har din ID-konto totrinsbekræftelse, skal du indtaste en frisk 6-cifret kode. MFA på din Vores Kok-konto er separat.</p><button>Gem ny adgangskode</button></form></section>;
}
