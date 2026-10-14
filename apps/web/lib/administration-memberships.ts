import 'server-only';
export type AdministrationMembership={organization_id:string;name:string;role:'owner'|'admin'|'member'|'billing';status:'active'|'suspended';product:'favn360'};
export async function administrationMemberships(token:string|undefined,subject:string):Promise<AdministrationMembership[]|null>{
 if(!token)return null;
 try{
 const base=new URL(process.env.ADMINISTRATION_BASE_URL||'https://administration.funktion360.dk');
 if(base.origin!=='https://administration.funktion360.dk'||base.username||base.password)return null;
 const response=await fetch(new URL('/api/identity/memberships',base),{headers:{Authorization:`Bearer ${token}`},cache:'no-store',redirect:'error',signal:AbortSignal.timeout(8000)});
 if(!response.ok)return null;const body=await response.json();
 if(body.version!==1||body.issuer!=='https://fthalqavjmsydmqszvkk.supabase.co/auth/v1'||body.subject!==subject||!Array.isArray(body.memberships)||body.memberships.length>1000)return null;
 if(!body.memberships.every((m:AdministrationMembership)=>m&&typeof m.organization_id==='string'&&/^[0-9a-f-]{36}$/i.test(m.organization_id)&&typeof m.name==='string'&&m.name.length<=500&&['owner','admin','member','billing'].includes(m.role)&&['active','suspended'].includes(m.status)&&m.product==='favn360'))return null;
 return body.memberships;
 }catch{return null;}
}
