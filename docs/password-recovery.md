# Gendannelse af ID-adgangskode

Tilføj https://id.funktion360.dk/reset-password?** til Redirect URLs i Funktion360-ID Supabase. Bevar eksisterende redirects.

Authentication → Emails → Reset password: sæt linket til {{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery. RedirectTo indeholder allerede ?flow=recovery. Skift kun recovery-skabelonen, ikke signup-skabelonen.

Eksempel:
<h2>Vælg en ny adgangskode</h2>
<p><a href="{{ .RedirectTo }}&token_hash={{ .TokenHash }}&type=recovery">Vælg en ny Funktion360 ID-adgangskode</a></p>
<p>Ignorér mailen, hvis du ikke har bedt om en ny adgangskode.</p>

Token verificeres først ved indsendelse af ny adgangskode, så et GET fra en mailscanner ikke forbruger linket. verifyOtp recovery og updateUser bruger den almindelige brugersession. Ingen service-role. ID-MFA kræver frisk TOTP og AAL2, andre faktorformer afvises. En mislykket MFA-verifikation kræver nyt recovery-link, fordi OTP allerede er brugt. Signout er local og lukker ikke automatisk sessions i produkterne eller alle enheder. SMTP og Supabase rate limits gælder. Den offentlige send-besked afslører ikke, om kontoen findes. Serverlog viser kun fejlkode.

Test med en testkonto: anmod mail, vælg ny kode, login med ny kode, afvis gammel kode, gentaget token afvises. MFA-test: korrekt kode accepteres, forkert kode afvises. Maillevering og faktisk Auth skal verificeres efter opsætningen.
