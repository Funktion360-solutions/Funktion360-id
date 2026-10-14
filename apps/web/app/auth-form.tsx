import Link from 'next/link';
import {configured} from '../lib/supabase';
import {authorizationId,authPath} from '../lib/authorization';
import {login,signup} from './actions';
export function Notice({code}:{code?:string}) {
  const messages:Record<string,string>={invalid:'Kontrollér felterne. Adgangskoden skal være 12–128 tegn.',failed:'Handlingen kunne ikke gennemføres. Prøv igen.',confirm:'Hvis oprettelsen kan gennemføres, får du en mail. Bekræft din e-mail før login.',saved:'Din profil er gemt.',database:'Profilen kunne ikke gemmes. Databasefundamentet skal være installeret.'};
  return code && messages[code] ? <p role="status" className="notice">{messages[code]}</p> : null;
}
export function AuthForm({register,notice,authorization}:{register?:boolean,notice?:string,authorization?:string}) {
  const ready=configured();
  const id=authorizationId(authorization);
  return <section className="card"><span className="eyebrow">DIN FÆLLES KONTO</span><h1>{register?'Opret Funktion360 ID':'Velkommen tilbage'}</h1><Notice code={notice}/>{id?<p>Log ind for at fortsætte til det produkt, du kom fra.</p>:null}{!ready?<p className="notice">Login er ikke tilsluttet endnu. Tilføj Identity-projektets oplysninger i .env.local for at teste.</p>:null}<form action={register?signup:login}>{id?<input type="hidden" name="authorization_id" value={id}/>:null}<label htmlFor="email">E-mail</label><input id="email" name="email" type="email" autoComplete="email" required maxLength={254}/><label htmlFor="password">Adgangskode</label><input id="password" name="password" type="password" autoComplete={register?'new-password':'current-password'} required minLength={12} maxLength={128}/><p className="hint">Mindst 12 tegn.</p><button disabled={!ready}>{register?'Opret konto':'Log ind'}</button></form><p>{register?'Har du en konto?':'Ny hos Funktion360?'} <Link href={authPath(register?'login':'signup',id)}>{register?'Log ind':'Opret konto'}</Link></p></section>;
}
