# 📋 AGESCI Trani 2 — Modulo Lista d'Attesa

Modulo web per l'iscrizione online in lista d'attesa del **Gruppo Scout AGESCI Trani 2**.

## Funzionalità
- Modulo multi-step (Genitori → Bambino → Privacy → Conferma)
- Supporto per 1 o 2 genitori/tutori
- Validazione campi in tempo reale
- Invio dati a Firebase Firestore
- Codice di riferimento univoco per ogni iscrizione
- Mobile friendly (testato su iOS e Android)

## Configurazione Firebase

1. Vai su [console.firebase.google.com](https://console.firebase.google.com/)
2. Crea un nuovo progetto (es. `agesci-trani2`)
3. Aggiungi un'**app web** al progetto
4. Copia le credenziali e incollale in `js/firebase-config.js`
5. In **Firestore Database**: crea il database in modalità produzione
6. Imposta le **regole Firestore**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /lista_attesa/{docId} {
      allow create: if true;          // chiunque può iscriversi
      allow read, update, delete: if false; // solo admin (dal pannello)
    }
  }
}
```

## Deploy (GitHub Pages)

```bash
git add .
git commit -m "deploy modulo iscrizione"
git push
```

Abilita GitHub Pages nelle impostazioni del repository (branch `main`, cartella `/`).

## Struttura
```
scout-lista-attesa/
├── index.html
├── css/style.css
└── js/
    ├── firebase-config.js   ← inserisci qui le credenziali Firebase
    └── app.js
```
