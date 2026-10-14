# Backup-authenticator

Sikkerhedssiden kan opsætte op til to verificerede authenticators gennem appen. Før tilføjelse kræves adgangskode samt frisk kode fra en eksisterende faktor, hvis der er en. Password-reauth sænker sessionen, så den eksisterende faktor verificeres igen før enrollment.

Ved fjernelse vælges både den mistede faktor og en verificeret faktor, brugeren stadig har, til frisk kodebekræftelse. Begge faktor-ID'er kontrolleres mod den aktuelle getUser. MFA-login viser faktornavne, så backupen kan vælges. Supabases egen faktorgrænse gælder fortsat for API-kald; appens to-faktorgrænse er en UI-begrænsning.

Recovery codes findes i SDK men kræver eksperimentelt opt-in samt server-enablement. Denne pakke bruger stabile TOTP-API'er og aktiverer ikke recovery codes.

Live test: aktivér første faktor; tilføj backup med forkert og korrekt eksisterende kode; verificér backupens første kode; logout og login med backup; fjern første faktor med kode fra backup; logout og login igen. Hav begge authenticators til rådighed under testen. Ingen SQL eller nye miljøvariable.
