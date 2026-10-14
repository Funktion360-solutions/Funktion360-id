# MFA ved Funktion360 ID-login

Konti med en verificeret MFA-faktor skal have AAL2 før kontooversigt, profilændring og OAuth-godkendelse. Server actions kontrollerer samme krav som siderne. En eksisterende OAuth-godkendelse springer ikke appens kontrol over.

/mfa accepterer kun en verificeret TOTP-faktor fra getUser for den aktuelle konto. challengeAndVerify efterfølges af AAL2 og samme bruger-ID. Authorization ID bevares mellem password, MFA og consent. Ingen vilkårlig next-URL. Ingen nye miljøvariabler, SQL eller ændringer i produkt-MFA.

Dette tilføjer login for allerede aktiveret ID-MFA. Selvbetjent tilmelding og recovery-koder er ikke implementeret. Supabase OAuth-serverens direkte endpoints har deres egen sikkerhedsmodel; appens guard er ikke i sig selv en global database- eller OAuth-politik.

Test med en særskilt ID-testkonto med verificeret TOTP: password → MFA → konto; forkert kode afvises; produktlogin bevarer authorization ID; direkte konto/consent på AAL1 fører til MFA. Konti uden MFA fortsætter som før. Faktiske Auth-flows kræver live test efter deployment.
