# Funktion360 ID på Vercel

Repository: Funktion360-solutions/Funktion360-id. Importér som projekt funktion360-id i aksel-lang's projects. Root Directory: apps/web. Framework: Next.js. Node.js: 24.x. Aktivér adgang til filer uden for Root Directory, så workspace og lockfile er tilgængelige. Build/install følger apps/web/vercel.json.

Konfigurér Production env-vars på det nye ID-projekt:

- SUPABASE_URL=https://fthalqavjmsydmqszvkk.supabase.co
- SUPABASE_PUBLISHABLE_KEY=<Identity-projektets publishable key>
- APP_ORIGIN=https://id.funktion360.dk

Der kræves ingen service-role, klienthemmelighed eller Vores Kok-nøgle til den centrale kontoportal. Supabase publishable key indtastes i Vercel Dashboard. Gem ikke .env.local i Git. Konfigurér Preview særskilt med en godkendt fast testadresse; genbrug ikke Production APP_ORIGIN på tilfældige preview-URL'er.

Tilføj id.funktion360.dk til projektets Domains. Følg præcis det DNS-record, Vercel viser. Brug ikke et gættet CNAME. Test HTTPS og forsiden, før Supabase Site URL skiftes.

I Identity Supabase: skift Site URL til https://id.funktion360.dk og behold Authorization Path /oauth/consent. Tilføj passende /auth/confirm redirect-regel, også med query (authorization_id eller flow=signup). Bekræftelsesmailens link skal være {{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=email. Behold localhost-regler, så lokal test stadig kan bruges.

Eksisterende Vores Kok OAuth-broker har redirect https://tgqwyheqhquwncyloond.supabase.co/auth/v1/callback; den skal ikke ændres til ID-appens domain. Supabase Vores Kok projektets redirect-liste skal før produktionspilot også indeholde https://voreskok.funktion360.dk/auth/funktion360/signin/callback.

Før produktionspilot på Vores Kok: verificér at den seneste produktkode er pushed og deployment READY. Tilføj F360_SSO_ENABLED=true, F360_SSO_ALLOWED_USER_IDS=<den manuelt koblede lokale bruger>, F360_SSO_COOKIE_SECRET=<ny separat 32-byte hexnøgle> og NEXT_PUBLIC_SITE_URL=https://voreskok.funktion360.dk til Vores Koks Production-env. Aktivér kun efter ID-domainet er testet. Automatisk konto-linking, nye konti og bred rollout er fortsat uafklaret; denne pilot gælder kun de udtrykkeligt tilknyttede konti.

Manuel kontokobling og gamle OIDC-teststatus-ruter er stadig lukket i produktion. Disse bruger udviklingslager og må ikke aktiveres på Vercel. Normalt produktlogin har intet SQLite-lager.

Verifikation: central login og email; OAuth consent; lokalt produktlogout; produktlogin på offentligt domain; samme lokale bruger-ID; opskrifter, husstande og session efter genindlæsning. Der er ikke udført en hosted end-to-end-test endnu.
