# Funktion360 ID

Central identity platform for personal Funktion360 accounts with linked organisations.

This repository owns the shared identity client and will own the central login and account portal. Each product retains its own data and authorisation.

## Current status

Next.js account portal with login, signup, email confirmation, profile editing, organisation visibility and OAuth consent. The shared OIDC client has PKCE, state, nonce and signed token validation. A Vores Kok local pilot has verified manual linking and product login. Hosted deployment has not yet been verified.

## Products

- Vores Kok: first pilot.
- Dej.
- Favn360.
- Studiemakker.
- Funktion360 Administration.

## Development

Requires Node.js 24 and pnpm 11.25.0.

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm typecheck
```

See [implementation constraints and migration requirements](docs/implementation.md). The client must run on the server; it does not itself provide sessions or product database access.

See [Vercel deployment setup](docs/deployment.md).
