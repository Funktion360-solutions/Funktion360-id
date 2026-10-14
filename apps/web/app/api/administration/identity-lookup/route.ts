import {NextRequest,NextResponse} from 'next/server';
import {createClient} from '@supabase/supabase-js';
export const runtime='nodejs';
export async function POST(request:NextRequest){
 const response=(body:unknown,status=200)=>NextResponse.json(body,{status,headers:{'Cache-Control':'private, no-store'}});
 const administrationUrl=process.env.ADMINISTRATION_SUPABASE_URL;
 const administrationKey=process.env.ADMINISTRATION_SUPABASE_PUBLISHABLE_KEY;
 const idKey=process.env.ID_ADMIN_SUPABASE_SECRET_KEY;
 const idUrl=process.env.SUPABASE_URL;
 if(!administrationUrl || !administrationKey || !idKey || !idUrl)return response({error:'not_configured'},503);
 try{if(new URL(administrationUrl).protocol!=='https:' || new URL(idUrl).protocol!=='https:')return response({error:'invalid_configuration'},503);}catch{return response({error:'invalid_configuration'},503);}
 const authorization=request.headers.get('authorization');
 if(!authorization?.startsWith('Bearer ') || authorization.length>16384)return response({error:'unauthorized'},401);
 const token=authorization.slice(7);
 const options={auth:{persistSession:false,autoRefreshToken:false,detectSessionInUrl:false},global:{fetch:(url:RequestInfo|URL,init?:RequestInit)=>fetch(url,{...init,signal:AbortSignal.timeout(10000)})}};
 try{
  const staffClient=createClient(administrationUrl,administrationKey,{...options,global:{...options.global,headers:{Authorization:authorization}}});
  const {data:{user},error}=await staffClient.auth.getUser(token);
  if(error || !user)return response({error:'unauthorized'},401);
  const [staff,permission]=await Promise.all([staffClient.rpc('get_current_staff_status'),staffClient.rpc('current_user_has_permission',{required_permission:'people.read'})]);
  if(staff.error || !Array.isArray(staff.data) || staff.data.length!==1 || staff.data[0].status!=='active' || permission.error || permission.data!==true)return response({error:'forbidden'},403);
  if(Number(request.headers.get('content-length') || 0)>8192)return response({error:'request_too_large'},413);
  let body:unknown;try{const raw=await request.text();if(Buffer.byteLength(raw)>8192)return response({error:'request_too_large'},413);body=JSON.parse(raw);}catch{return response({error:'invalid_request'},400);}
  const subject=typeof body==='object' && body!==null && 'subject' in body?body.subject:undefined;
  if(typeof subject!=='string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(subject))return response({error:'invalid_subject'},400);
  const idClient=createClient(idUrl,idKey,options);
  const {data:identity,error:lookupError}=await idClient.auth.admin.getUserById(subject);
  if(lookupError || !identity.user)return response({error:'identity_not_found'},404);
  return response({contract_version:1,issuer:idUrl.replace(/\/$/,'')+'/auth/v1',subject:identity.user.id,email:identity.user.email || null,email_verified:Boolean(identity.user.email_confirmed_at),checked_at:new Date().toISOString()});
 }catch{return response({error:'lookup_unavailable'},502);}
}
