import { test } from 'node:test';
import assert from 'node:assert/strict';
import { generateKeyPairSync, sign } from 'node:crypto';
import * as oidc from 'openid-client';
import { beginLogin, finishLogin, safeReturnTo, type LoginTransaction } from '../src/index.ts';

const issuer = 'https://identity.example/auth/v1';
const redirectUri = 'https://kok.example/auth/identity/callback';
const { privateKey, publicKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });
const jwk = { ...publicKey.export({ format: 'jwk' }), kid: 'test', alg: 'RS256', use: 'sig' };

function fixture(overrides: Record<string, unknown> = {}, invalidSignature = false) {
  let transaction: LoginTransaction | undefined;
  let exchanges = 0;
  const store = {
    async put(_binding: string, value: LoginTransaction) { transaction = value; },
    async take(_binding: string) { const value = transaction; transaction = undefined; return value; },
  };
  const client = new oidc.Configuration({
    issuer, authorization_endpoint: issuer + '/oauth/authorize',
    token_endpoint: issuer + '/oauth/token', jwks_uri: issuer + '/.well-known/jwks.json',
  }, 'kok-client', undefined, oidc.ClientSecretBasic('secret'));
  let nonce = '';
  client[oidc.customFetch] = async (url) => {
    if (String(url).endsWith('jwks.json')) return Response.json({ keys: [jwk] });
    exchanges++;
    const now = Math.floor(Date.now() / 1000);
    const encode = (v: unknown) => Buffer.from(JSON.stringify(v)).toString('base64url');
    const payload = encode({ iss: issuer, aud: 'kok-client', sub: 'central-user', iat: now, exp: now + 60, nonce, ...overrides });
    const input = encode({ alg: 'RS256', kid: 'test' }) + '.' + payload;
    const signature = sign('RSA-SHA256', Buffer.from(input), privateKey);
    if (invalidSignature) signature[0] ^= 1;
    const jwt = input + '.' + signature.toString('base64url');
    return Response.json({ access_token: 'access', token_type: 'Bearer', expires_in: 60, id_token: jwt });
  };
  oidc.enableNonRepudiationChecks(client);
  return { client, store, exchanges: () => exchanges,
    async start() {
      const url = await beginLogin(client, redirectUri, store, 'browser', '/recipes');
      nonce = url.searchParams.get('nonce')!;
      return new URL(redirectUri + '?code=test&state=' + url.searchParams.get('state'));
    },
  };
}

test('PKCE S256, state and nonce are independently generated', async () => {
  const f = fixture();
  const url = await beginLogin(f.client, redirectUri, f.store, 'browser');
  assert.equal(url.searchParams.get('code_challenge_method'), 'S256');
  assert.equal(url.searchParams.get('scope'), 'openid email profile');
  assert.notEqual(url.searchParams.get('state'), url.searchParams.get('nonce'));
  assert.ok(url.searchParams.get('code_challenge'));
});

test('verified login returns subject and consumes transaction', async () => {
  const f = fixture(); const callback = await f.start();
  const result = await finishLogin(f.client, { redirectUri }, callback, f.store, 'browser');
  assert.equal(result.subject, 'central-user'); assert.equal(result.returnTo, '/recipes');
  await assert.rejects(finishLogin(f.client, { redirectUri }, callback, f.store, 'browser'));
  assert.equal(f.exchanges(), 1);
});

for (const [label, claims] of Object.entries({
  issuer: { iss: 'https://attacker.example' }, audience: { aud: 'other-client' },
  nonce: { nonce: 'wrong' }, expiry: { exp: 1 },
})) test('rejects invalid ' + label, async () => {
  const f = fixture(claims); const callback = await f.start();
  await assert.rejects(finishLogin(f.client, { redirectUri }, callback, f.store, 'browser'));
});

test('rejects state substitution before token exchange', async () => {
  const f = fixture(); const callback = await f.start(); callback.searchParams.set('state', 'wrong');
  await assert.rejects(finishLogin(f.client, { redirectUri }, callback, f.store, 'browser'));
  assert.equal(f.exchanges(), 0);
});

test('rejects callback origin substitution', async () => {
  const f = fixture(); const callback = await f.start(); callback.hostname = 'attacker.example';
  await assert.rejects(finishLogin(f.client, { redirectUri }, callback, f.store, 'browser'));
  assert.equal(f.exchanges(), 0);
});

test('rejects invalid signature even on a successful HTTPS token response', async () => {
  const f = fixture({}, true); const callback = await f.start();
  await assert.rejects(finishLogin(f.client, { redirectUri }, callback, f.store, 'browser'));
});

test('rejects duplicate state and consumes the transaction', async () => {
  const f = fixture(); const callback = await f.start();
  callback.searchParams.append('state', callback.searchParams.get('state')!);
  await assert.rejects(finishLogin(f.client, { redirectUri }, callback, f.store, 'browser'));
  callback.searchParams.delete('state');
  await assert.rejects(finishLogin(f.client, { redirectUri }, callback, f.store, 'browser'));
  assert.equal(f.exchanges(), 0);
});

test('rejects expired transactions before exchange', async () => {
  const f = fixture(); const callback = await f.start();
  const transaction = (await f.store.take('browser'))!;
  transaction.createdAt -= 300_001;
  await f.store.put('browser', transaction);
  await assert.rejects(finishLogin(f.client, { redirectUri }, callback, f.store, 'browser'));
  assert.equal(f.exchanges(), 0);
});

test('rejects open redirects and unsafe paths', () => {
  for (const path of ['//evil.example', '/\\evil.example', 'https://evil.example', '/\n/evil.example']) {
    assert.throws(() => safeReturnTo(path));
  }
  assert.equal(safeReturnTo('/recipes?tab=mine'), '/recipes?tab=mine');
});
