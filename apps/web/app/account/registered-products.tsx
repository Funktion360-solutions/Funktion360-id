import styles from './account.module.css';
type Products={accounts:Array<{system:string;registered:boolean}>;requests:Array<{id:string;name:string;status:string}>};
const labels:Record<string,string>={voreskok:'Vores Kok',studiemakker:'Studiemakker',favn360:'Favn360',raadig:'Rådig',dej:'Dej'};
const stages:Record<string,string>={pending:'Afventer invitation og oprettelse',provisioning:'Oprettelse under behandling',active:'Markeret aktiv i administrationen',failed:'Oprettelse kræver hjælp fra Funktion360',suspended:'Suspenderet i administrationen'};
export async function RegisteredProducts({token,subject}:{token?:string;subject:string}){
 let products:Products|null=null;
 try{
 const base=new URL(process.env.ADMINISTRATION_BASE_URL||'https://administration.funktion360.dk');
 if(!token||base.origin!=='https://administration.funktion360.dk'||base.username||base.password)throw Error('Configuration');
 const response=await fetch(new URL('/api/identity/products',base),{headers:{Authorization:`Bearer ${token}`},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});
 if(!response.ok)throw Error('Unavailable');const body=await response.json();
 if(body.version!==1||body.issuer!=='https://fthalqavjmsydmqszvkk.supabase.co/auth/v1'||body.subject!==subject)throw Error('Identity');
 const p=body.products;if(!p||!Array.isArray(p.accounts)||!Array.isArray(p.requests)||p.accounts.length>1000||p.requests.length>1000)throw Error('Invalid data');
 if(!p.accounts.every((a:Products['accounts'][number])=>a&&typeof a.system==='string'&&a.system.length<=100&&typeof a.registered==='boolean')||!p.requests.every((q:Products['requests'][number])=>q&&typeof q.id==='string'&&typeof q.name==='string'&&q.name.length<=500&&Object.hasOwn(stages,q.status)))throw Error('Invalid data');products=p;
 }catch{products=null;}
 return <section className={styles.panel} style={{marginTop:24}} aria-labelledby="registered-products-title"><span className="eyebrow">FUNKTION360 ADMINISTRATION</span><h2 id="registered-products-title">Dine registrerede produktkonti</h2>{products===null?<p role="status">Produktoversigten kunne ikke hentes. Prøv igen senere.</p>:<><ul className={styles.memberships}>{products.accounts.map((a,n)=><li key={a.system+'-'+n}><strong>{labels[a.system]||a.system}</strong><span>{a.registered?'Produktkonto registreret':'Kontoregistrering inaktiv'}</span></li>)}</ul>{!products.accounts.length?<p>Ingen produktkonti registreret i administrationen.</p>:null}{products.requests.length?<><h3>Produktanmodninger</h3><ul className={styles.memberships}>{products.requests.map(q=><li key={q.id}><strong>{q.name}</strong><span>{stages[q.status]}</span></li>)}</ul></>:null}</>}<p className="hint">Oversigten viser administrationens registreringer. Produkterne kontrollerer selv din aktuelle adgang. Organisationer og medlemsroller vises nedenfor.</p></section>;
}
