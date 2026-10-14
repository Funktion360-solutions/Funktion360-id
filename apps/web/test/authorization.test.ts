import test from 'node:test';
import assert from 'node:assert/strict';
import {authorizationId,authPath,consentPath,providerRedirect} from '../lib/authorization.ts';
const id='01234567-89ab-cdef-0123-456789abcdef';
test('preserves authorization across login and signup',()=>{
 assert.equal(new URL(authPath('login',id,'failed'),'https://id.example').searchParams.get('authorization_id'),id);
 assert.equal(new URL(authPath('signup',id),'https://id.example').searchParams.get('authorization_id'),id);
 assert.equal(consentPath(id),'/oauth/consent?authorization_id='+id);
});
test('rejects duplicate and injected authorization parameters',()=>{
 for(const v of [undefined,['a','b'],'https://evil.example','x&redirect=https://evil.example','a'.repeat(129)]) assert.equal(authorizationId(v),undefined);
 assert.equal(consentPath('https://evil.example'),'/account');
});
test('accepts HTTPS provider redirects and local development',()=>{
 assert.equal(providerRedirect('https://product.example/auth/callback?code=abc'),'https://product.example/auth/callback?code=abc');
 assert.equal(providerRedirect('http://localhost:3001/callback'),'http://localhost:3001/callback');
});
test('rejects unsafe redirect protocols and embedded credentials',()=>{
 for(const v of ['javascript:alert(1)','http://evil.example/callback','https://user:password@example.com','https://example.com/#token']) assert.throws(()=>providerRedirect(v));
});
