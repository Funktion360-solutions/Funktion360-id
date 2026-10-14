# Lokal opsætning – pakke 2

Dette er central kontoportal, ikke aktiveret produkt-SSO. Kør på ét origin i denne pakke; separate id/account-domæner kræver egne sessionsflows.

1. Brug Node.js 24 og pnpm 11.25.0. Kør `pnpm install`, `pnpm test`, `pnpm typecheck`, `pnpm build`.
2. Kør `pnpm dev`. Forsiden, login, signup og kontoens opsætningsbesked virker uden miljøvariabler.
3. Opret et separat Identity Supabase-testprojekt. Brug ikke Vores Kok/Favn360-projektet. Kopiér apps/web/.env.example til apps/web/.env.local og indsæt projektets URL, publishable key og APP_ORIGIN.
4. Behold e-mailbekræftelse aktiveret og slå anonyme login fra. Konfigurér adgangskodekrav til mindst 12 tegn og SMTP/rate limits. Tilføj http://localhost:3000/auth/confirm som tilladt redirect.
5. Bekræftelsesmailen skal linke til `{{ .RedirectTo }}?token_hash={{ .TokenHash }}&type=email`. Token-hash verificeres server-side. Password recovery og social login er endnu ikke implementeret.
6. database/identity-foundation.sql er et SQL-udkast. Før det anvendes, skal det køres mod en isoleret testdatabase, og RLS skal testes med to brugere og to organisationer. Opret derefter en rigtig migration med Supabase CLI. Denne pakke anvender ikke SQL automatisk.
7. Test signup, mailbekræftelse, forkert kodeord, login, genindlæsning, profilgemning og lokal logout. Verificér, at bruger A ikke kan læse eller ændre bruger B's profil, og at medlemskaber ikke kan skrives med en bruger-token.

Ingen service-role-nøgle bruges. Organisationsoprettelse og rolleændringer er lukket, indtil audit, MFA og administrationsflows er implementeret. OIDC consent, produktfederation, recovery og global logout er udestående. Ingen eksisterende brugere migreres.
