import * as oidc from 'openid-client';

export interface IdentityConfig {
  issuer: string;
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export interface LoginTransaction {
  state: string;
  nonce: string;
  verifier: string;
  createdAt: number;
  returnTo: string;
}

/** Implement atomically in a server-side store. take MUST delete before returning. */
export interface TransactionStore {
  put(browserBinding: string, transaction: LoginTransaction): Promise<void>;
  take(browserBinding: string): Promise<LoginTransaction | undefined>;
}

export function safeReturnTo(value: string): string {
  if (!value.startsWith('/') || value.startsWith('//') || /[\\\u0000-\u0020]/u.test(value)) {
    throw new Error('Invalid return path');
  }
  const parsed = new URL(value, 'https://local.invalid');
  if (parsed.origin !== 'https://local.invalid') throw new Error('Invalid return origin');
  return parsed.pathname + parsed.search + parsed.hash;
}

function secureUrl(value: string): URL {
  const url = new URL(value);
  if (url.protocol !== 'https:' || url.username || url.password || url.hash || url.search) {
    throw new Error('Expected a clean HTTPS URL');
  }
  return url;
}

export async function connect(config: IdentityConfig): Promise<oidc.Configuration> {
  const issuer = secureUrl(config.issuer);
  secureUrl(config.redirectUri);
  if (!config.clientId || !config.clientSecret) throw new Error('Missing client credentials');
  const client = await oidc.discovery(issuer, config.clientId, undefined,
    oidc.ClientSecretBasic(config.clientSecret));
  // Always verify ID-token signatures against the issuer's JWKS, including TLS token responses.
  oidc.enableNonRepudiationChecks(client);
  return client;
}

export async function beginLogin(
  client: oidc.Configuration,
  redirectUri: string,
  store: TransactionStore,
  browserBinding: string,
  returnTo = '/',
): Promise<URL> {
  secureUrl(redirectUri);
  if (!browserBinding) throw new Error('Missing browser binding');
  const transaction: LoginTransaction = {
    state: oidc.randomState(), nonce: oidc.randomNonce(),
    verifier: oidc.randomPKCECodeVerifier(), createdAt: Date.now(),
    returnTo: safeReturnTo(returnTo),
  };
  const url = oidc.buildAuthorizationUrl(client, {
    redirect_uri: redirectUri, response_type: 'code', scope: 'openid email profile',
    state: transaction.state, nonce: transaction.nonce,
    code_challenge: await oidc.calculatePKCECodeChallenge(transaction.verifier),
    code_challenge_method: 'S256',
  });
  await store.put(browserBinding, transaction);
  return url;
}

export async function finishLogin(
  client: oidc.Configuration,
  config: Pick<IdentityConfig, 'redirectUri'>,
  callback: URL,
  store: TransactionStore,
  browserBinding: string,
) {
  const expected = secureUrl(config.redirectUri);
  if (callback.origin !== expected.origin || callback.pathname !== expected.pathname || callback.hash) {
    throw new Error('Unexpected callback URL');
  }
  const transaction = await store.take(browserBinding);
  const age = transaction ? Date.now() - transaction.createdAt : Infinity;
  if (!transaction || age < 0 || age > 300_000) throw new Error('Missing or expired login transaction');
  if (callback.searchParams.getAll('state').length !== 1 || callback.searchParams.get('state') !== transaction.state) {
    throw new Error('Invalid OAuth state');
  }
  const tokens = await oidc.authorizationCodeGrant(client, callback, {
    pkceCodeVerifier: transaction.verifier,
    expectedState: transaction.state,
    expectedNonce: transaction.nonce,
    idTokenExpected: true,
  });
  const claims = tokens.claims();
  if (!claims?.sub) throw new Error('Missing verified subject');
  // Tokens are server-only. The caller must create an opaque host-only app session.
  return { subject: claims.sub, issuer: claims.iss, returnTo: safeReturnTo(transaction.returnTo), tokens };
}
