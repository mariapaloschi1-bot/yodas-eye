# 🚀 Quick Deploy Guide - Yoda's Eye (BYOK Version)

## 📦 **Pre-requisiti**

- ✅ Git installato
- ✅ Progetto `yodas-eye-main` pronto
- ✅ Account Cloudflare Pages (o Vercel)

---

## 🔥 **Deploy in 5 Minuti**

### **Step 1: Commit e Push** (1 minuto)

```bash
# Dalla cartella yodas-eye-main
git add .
git commit -m "feat: implement BYOK + fix Gemini integration"
git push origin main
```

---

### **Step 2: Deploy su Cloudflare Pages** (3 minuti)

#### **Opzione A: Interfaccia Web** (Consigliata)

1. Vai su: https://pages.cloudflare.com
2. Click **"Create a project"**
3. Click **"Connect to Git"**
4. Seleziona il repository `yodas-eye-tool`
5. Configurazione:

```yaml
Framework preset: Angular
Build command: npm run build
Build output directory: dist/yodas-eye-main/browser
Root directory: /
Node version: 20
```

6. Click **"Save and Deploy"**
7. Aspetta 2-3 minuti ⏱️
8. Ottieni l'URL: `https://yodas-eye-tool.pages.dev` 🎉

---

#### **Opzione B: CLI** (Per esperti)

```bash
# Installa Wrangler CLI
npm install -g wrangler

# Login
wrangler login

# Deploy
cd yodas-eye-main
npm run build
wrangler pages deploy dist/yodas-eye-main/browser --project-name=yodas-eye-tool
```

---

### **Step 3: Test dell'App** (1 minuto)

1. Apri l'URL del deploy
2. Dovresti vedere il campo **"Gemini API Key (BYOK)"** 🔑
3. Inserisci una chiave di test da: https://aistudio.google.com/app/apikey
4. Compila Focus Brand e Competitor con dati demo
5. Click **"Meditare sui Dati"**
6. Verifica che l'analisi funzioni ✅

---

## 🔧 **Troubleshooting**

### **Problema 1: Build fallisce**

**Errore:**
```
Error: Cannot find module '@angular/...'
```

**Soluzione:**
```bash
# Reinstalla dipendenze
npm install
npm run build
```

---

### **Problema 2: API Key non funziona**

**Errore:**
```
API key not valid. Please pass a valid API key.
```

**Soluzione:**
1. Verifica che la key sia corretta (inizia con `AIzaSy...`)
2. Vai su: https://aistudio.google.com/app/apikey
3. Controlla che la key sia attiva
4. Prova a generare una nuova key

---

### **Problema 3: CORS Error**

**Errore:**
```
Access to fetch at 'https://generativelanguage.googleapis.com/...' 
from origin 'https://yodas-eye-tool.pages.dev' has been blocked by CORS
```

**Soluzione:**
Questo errore NON dovrebbe verificarsi perché Google Gemini supporta CORS. 

Se succede:
1. Verifica che l'API key sia valida
2. Controlla che il browser non blocchi richieste third-party
3. Prova in modalità incognito

---

### **Problema 4: LocalStorage non funziona**

**Errore:**
```
API Key mancante. Inserisci la tua Gemini API Key.
```

**Soluzione:**
1. Verifica che il browser consenta LocalStorage
2. Controlla le impostazioni Privacy/Cookie
3. Disabilita estensioni che bloccano lo storage (Privacy Badger, etc.)

---

## ⚙️ **Configurazione Avanzata**

### **Custom Domain**

Su Cloudflare Pages:

1. Dashboard → **Custom domains**
2. Click **"Set up a custom domain"**
3. Inserisci: `yodas-eye.tuodominio.com`
4. Aggiungi il record CNAME sul tuo DNS:

```
CNAME yodas-eye yodas-eye-tool.pages.dev
```

---

### **Variabili d'Ambiente** (Opzionale)

Anche se ora NON servono più (grazie a BYOK!), puoi configurare:

```bash
# Cloudflare Pages → Settings → Environment variables
NODE_VERSION=20
```

---

## 🎯 **Verifica Deploy Funzionante**

### **Checklist:**

- [ ] URL live raggiungibile
- [ ] Campo API key visibile
- [ ] LocalStorage funziona (key salvata al reload)
- [ ] Analisi con dati demo funziona
- [ ] Risultati visualizzati correttamente nei 5 tab
- [ ] Nessun errore nella console del browser
- [ ] Build time < 5 minuti
- [ ] First load < 3 secondi

---

## 📊 **Performance Attesa**

| Metrica | Target | Note |
|---------|--------|------|
| **Build Time** | 2-4 min | Cloudflare |
| **Deploy Time** | 30-60s | Dopo build |
| **First Load** | 1-2s | Con CDN |
| **API Call** | 15-40s | Dipende dal dataset |

---

## 🔗 **Link Utili**

- **Gemini API Keys:** https://aistudio.google.com/app/apikey
- **Cloudflare Dashboard:** https://dash.cloudflare.com
- **Google Gemini Docs:** https://ai.google.dev/docs
- **Angular Deployment:** https://angular.io/guide/deployment

---

## 🎉 **Deploy Completato!**

Ora il tuo tool è:
- ✅ Live e accessibile pubblicamente
- ✅ Scalabile (ogni utente usa la propria quota)
- ✅ Sicuro (nessuna API key esposta)
- ✅ Zero maintenance (deploy automatici su push)

**Congratulazioni, Padawan! La Forza è con te.** 🌌

---

## 📧 **Supporto**

Se hai problemi:
1. Controlla i log su Cloudflare Dashboard → Deployments → View build log
2. Verifica la console del browser (F12 → Console)
3. Testa con dati ridotti (2 brand × 20 articoli)

**May the Deploy be with you!** 🚀
