import {authorizationId} from './authorization.ts';
export function needsMfa(factors:Array<{status:string}>|undefined,level:string|null|undefined){return Boolean(factors?.some(f=>f.status==='verified')) && level!=='aal2';}
export function mfaPath(id?:string,notice?:string){const query=new URLSearchParams();const valid=authorizationId(id);if(valid)query.set('authorization_id',valid);if(notice && ['failed','invalid','unavailable'].includes(notice))query.set('notice',notice);return '/mfa'+(query.size?'?'+query.toString():'');}
