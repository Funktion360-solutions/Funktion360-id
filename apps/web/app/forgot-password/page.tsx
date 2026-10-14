import Link from 'next/link';
import {requestReset} from './actions';
export default async function ForgotPassword({searchParams}:{searchParams:Promise<{notice?:string}>}){
 const {notice}=await searchParams;
 const errors:Record<string,string>={expired:'Linket er udløbet eller allerede brugt. Bed om et nyt.',retry:'Adgangskoden kunne ikke ændres. Brug mindst 12 tegn og gentag den præcist. Bed om et nyt link.',mfa:'MFA kunne ikke bekræftes. Bed om et nyt link og brug en frisk kode. Har du mistet din authenticator, skal du have hjælp til kontogendannelse.'};
 return <section className="card"><span className="eyebrow">FUNKTION360 ID</span><h1>Glemt adgangskode?</h1><p>Vi sender dig et link, så du kan vælge en ny adgangskode til dit Funktion360 ID.</p>{notice && errors[notice]?<p role="status" className="notice">{errors[notice]}</p>:null}{notice==='sent'?<p role="status" className="notice">Hvis vi kan sende et link til denne konto, modtager du en mail. Tjek også din spammappe.</p>:notice==='invalid'?<p role="status" className="notice">Indtast en gyldig emailadresse.</p>:null}<form action={requestReset}><label htmlFor="recovery-email">Din email</label><input id="recovery-email" name="email" type="email" autoComplete="email" required maxLength={254}/><button>Send link til ny adgangskode</button></form><p><Link href="/login">Tilbage til login</Link></p></section>;
}
