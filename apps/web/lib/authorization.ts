export function authorizationId(value: unknown): string | undefined {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{16,128}$/.test(value) ? value : undefined;
}
export function consentPath(id?: string) {
  const valid=authorizationId(id);
  return valid ? '/oauth/consent?authorization_id='+encodeURIComponent(valid) : '/account';
}
export function authPath(route:'login'|'signup', id?: string, notice?: string) {
  const query=new URLSearchParams();
  const valid=authorizationId(id);
  if(valid) query.set('authorization_id',valid);
  if(notice) query.set('notice',notice);
  return '/'+route+(query.size?'?'+query.toString():'');
}
export function providerRedirect(value:string) {
  const url=new URL(value);
  if(url.username || url.password || url.hash) throw new Error('Invalid OAuth redirect');
  if(url.protocol!=='https:' && !(url.protocol==='http:' && ['localhost','127.0.0.1'].includes(url.hostname))) throw new Error('Invalid OAuth redirect');
  return url.href;
}
