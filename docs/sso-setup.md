# Pakke 3 – OAuth-godkendelse på Funktion360 ID

ID-appen har nu /oauth/consent. Supabase sender brugeren hertil med authorization_id. Login, signup og mailbekræftelse bevarer dette ID. Der accepteres ikke en brugerleveret return URL. Kun redirect_url fra Supabase bruges efter godkendelse/afvisning. Tidligere samtykke kan give direkte retur, hvis Supabase returnerer redirect_url.

## Opsætning i det dedikerede Identity-testprojekt

1. Konfigurér apps/web/.env.local som beskrevet i local-setup.md.
2. Aktivér OAuth Server. Authorization Path: /oauth/consent. Site URL lokalt: http://localhost:3000. Senere: https://id.funktion360.dk.
3. Brug asymmetrisk signering (ES256/RS256), som kræves til OIDC ID-tokens. Lad dynamisk klientregistrering være slået fra.
4. Registrér Vores Kok som confidential OAuth-klient i staging, med præcis callback-URL til dens endnu ikke implementerede callback-handler. Brug separate klienter pr. miljø. Gem klienthemmeligheden kun på Vores Koks server.
5. Bekræftelsesmailen fra pakke 2 skal ændres til `{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email`, og emailRedirectTo skal altid indeholde en query. Denne pakke tilføjer det via signup-koden. Tilføj passende /auth/confirm redirect-regler for udvikling og produktion.

## Hvad mangler før SSO er aktivt?

Vores Kok har endnu ikke start-/callback-ruter, persistent engangs-PKCE-lager, serveropbevarede tokens eller kontosammenkobling. Mapping alene giver ikke adgang til Vores Koks Supabase RLS. Eksisterende produktlogin forbliver aktivt, indtil en understøttet databaseadgangsbro er testet.

Ingen Supabase-konfiguration, klientregistrering eller produktkode ændres af scriptet. OAuth-serveren skal testes med rigtige klienter: login → consent → callback, afvisning, tidligere samtykke, udløbet request, signup/mail og forsøg med en anden konto. Brug korte tokenlevetider og aktive sessionskontroller, før følsomme produkter aktiveres.

Lokale kommandoer på Intel-Mac: npx --yes pnpm@11.25.0 install --frozen-lockfile, test, typecheck og build. Derefter dev. SQL-udkastet fra pakke 2 er fortsat ikke en valideret migration.
