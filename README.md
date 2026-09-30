# Compensi Call Center

## 1. Crea le tabelle su Supabase
Vai su Supabase → il tuo progetto → **SQL Editor** → **New query**, incolla tutto il contenuto
del file `sql/schema.sql` e clicca **Run**. Questo crea le tabelle e attiva la sicurezza
(ogni utente vede solo i propri dati).

## 2. Verifica l'autenticazione email
Su Supabase vai su **Authentication → Providers** e assicurati che **Email** sia attivo
(lo è di default). Se vuoi che gli utenti possano accedere subito senza confermare l'email,
vai su **Authentication → Settings** e disattiva "Confirm email" (comodo solo per te/uso
personale, sconsigliato se altre persone si registrano).

## 3. Pubblica il sito (gratis)
1. Crea un account gratuito su [github.com](https://github.com) se non lo hai già
2. Crea un nuovo repository (anche privato) e carica tutti i file di questa cartella
3. Vai su [vercel.com](https://vercel.com), registrati con l'account GitHub
4. "Add New Project" → seleziona il repository → Deploy (le impostazioni di default vanno bene)
5. Dopo 1-2 minuti Vercel ti dà un indirizzo tipo `tuosito.vercel.app` — il sito è online

Il file `src/supabaseClient.js` contiene già l'indirizzo e la chiave pubblica del tuo
progetto Supabase, quindi funziona così com'è, senza configurare altro.

## 4. Modifiche future
Per qualsiasi modifica (aggiungere un campo, cambiare un calcolo), chiedi il codice
aggiornato in chat, sostituisci i file nel repository GitHub (anche da telefono, editando
il file direttamente su github.com) e Vercel ripubblica il sito da solo in automatico.
Versione 1
