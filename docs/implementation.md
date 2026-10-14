# Funktion360 ID: first implementation slice

Status: OIDC client foundation only; no live SSO, account portal or database migration.

## Verified repository findings (13 October 2026)

| Product | Current authentication | Migration constraint |
| --- | --- | --- |
| Vores Kok | `apps/web/src/lib/session.ts` calls Supabase `getUser()`; database client retains that local session | RLS, RPCs and Storage use `auth.uid()`; preserve existing IDs |
| Dej | Web OTP and Apple OAuth; mobile OTP and Apple ID token | Independently configured project URL; deployment configuration must confirm whether Auth is shared with Vores Kok |
| Favn360 Core | `lib/auth.ts` verifies local Supabase user, then loads local profile | Public repository excludes database migrations; tenant isolation cannot be certified from this repository alone |
| Studiemakker | Not yet inspected | Inventory repository, Auth configuration and local user references before integration |
| Administration | Supabase SSR, proxy refresh and separate server admin client | Staff permissions and MFA remain independently enforced |

The connected Supabase account currently lists Vores Kok (`tgqwyheqhquwncyloond`, eu-west-1) and Funktion360 (`jdpvibjjoyhalwsrlmpc`, eu-central-1). No identity project was created. Deployment environment values and live RLS have not yet been audited.

## Client delivered

`packages/identity-client` exports a server-side confidential OIDC client using pinned `openid-client` 6.8.8. It uses discovery, client-secret-basic, PKCE S256, state, nonce and JWKS signature validation. Callback origin/path and five-minute transaction expiry are enforced. Transactions are consumed once before code exchange. Issuer/audience/token expiry validation is handled by the OIDC library.

Run `pnpm --filter @funktion360/identity-client test` and `pnpm --filter @funktion360/identity-client typecheck`. Tests use signed local fixture tokens; they do not establish compatibility with a deployed Supabase provider.

## Required application integration

1. Configure a dedicated Supabase identity project, enable its OAuth server and register one confidential client per web product/environment. Use exact HTTPS callback URLs. Disable dynamic registration unless explicitly required.
2. Build the central login/signup and OAuth consent UI using `supabase.auth.oauth.getAuthorizationDetails`, `approveAuthorization` and `denyAuthorization`. Existing product Auth configuration stays intact.
3. Instantiate the client only on the server. Keep issuer, client ID, secret and callback URL in server environment variables; never use `NEXT_PUBLIC_` for secrets.
4. Implement `TransactionStore` with atomic consume and a five-minute TTL. Bind it to a cryptographically random host-only HttpOnly Secure SameSite=Lax cookie. Do not use the OAuth `state` alone as browser binding. Handle concurrent login attempts explicitly.
5. Generate callbacks from the configured origin, not untrusted forwarded headers. Create an opaque product session after verification. Keep access/refresh tokens encrypted in server storage; never send the returned token object to the browser or log it. Rotation, revocation, refresh serialization and local logout must be implemented before release. Global logout must be verified against actual provider support.
6. Link accounts only after recent verification of both central and existing local login. Derive both IDs server-side; never trust submitted user IDs or matching emails. Mapping key: `(issuer, subject, source_project_ref)` with a unique `(source_project_ref, legacy_user_id)` constraint. Preserve a proof timestamp and audit event. Re-linking requires an explicit recovery workflow.

## Critical remaining database decision

An identity mapping does **not** make a central token valid in a separate Supabase project. Do not send central tokens to the current Data API, rewrite `auth.users.id`, mint ad-hoc local JWTs, or use a service-role client to bypass existing RLS for product requests.

Before activating product SSO, select and test a supported local-session federation bridge, or explicitly migrate each affected policy/RPC/storage path to a reviewed external-identity authorization model. This decision requires actual deployed Auth capabilities and RLS inspection. Until then, existing product login remains authoritative and the new package is unconnected.

## Next implementation acceptance criteria

- Dedicated identity project and isolated staging clients configured after cost and organization selection.
- Personal profile, organisations, memberships, product grants and private mapping schema with constraints and RLS tests.
- Central login/signup/email confirmation/recovery/consent and account portal tested against real Auth.
- Dual-login account linking tested for duplicate mapping, stale proofs, replay and cross-account takeover.
- Vores Kok pilot preserves household access, RPC writes and Storage ownership; revoked membership denies access immediately where required.
- Old login remains available behind a per-product rollout flag; mappings and user data survive rollback.

## Documentation checked

- https://supabase.com/changelog.md (current breaking entry concerns TLS cipher retirement; no client API migration required for this slice)
- https://supabase.com/docs/guides/auth/oauth-server/getting-started
- https://supabase.com/docs/guides/auth/oauth-server/oauth-flows
- https://github.com/panva/openid-client/tree/main/docs
