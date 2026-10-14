# Selvbetjent ID-MFA

/account/security har adgangskodebekræftelse før TOTP-enrollment, QR/manuelt secret og første kode før aktivering. Serveren verificerer faktorens ejerskab, type og status med getUser. AAL2 og verificeret faktor kontrolleres efter aktivering. Fjernelse kræver eksisterende AAL2 samt frisk kode fra den valgte faktor og eksplicit samtykke. Kun egne ubekræftede TOTP-opsætninger med friendly_name Funktion360 ID ryddes ved en ny opsætning. QR og secret returneres kun til den autentificerede bruger og logges ikke.

Aktivér TOTP enrollment og verification i Funktion360-ID Supabase → Authentication → Multi-Factor, hvis de ikke allerede er aktiveret. Ingen SQL eller miljøvariable.

Test først med en testkonto: forkert adgangskode afvises; QR scan; forkert kode afvises; korrekt kode aktiverer; logout/password/MFA/login; produktlogin via consent; deaktivering med forkert og korrekt kode. TOTP-hemmelighed vises kun under opsætningen. Selvbetjente recovery-koder og hjælp ved mistet faktor er ikke implementeret.
