# Yoda's Eye - SEO Competitive Analysis Tool

![Yoda's Eye Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## 🌟 Descrizione

Yoda's Eye è un'applicazione web intelligente per l'analisi competitiva SEO che utilizza l'AI (Google Gemini) per identificare cluster tematici, gap strategici e opportunità di contenuto.

## ✨ Caratteristiche

- ✅ Analisi multi-brand (focus + competitor)
- ✅ Clustering semantico automatico con AI
- ✅ Dashboard interattiva con 5 tab di analisi
- ✅ Identificazione pillar content
- ✅ Gap analysis e opportunità prioritarie
- ✅ Design responsive con tema dark

## 🚀 Quick Start

### Prerequisiti
- Node.js 18+ 
- npm 10+

### Installazione

```bash
npm install
```

### Configurazione API Key

Crea un file `.env.local` e aggiungi la tua API key Gemini:

```
GEMINI_API_KEY=la-tua-api-key
```

### Sviluppo Locale

```bash
npm start
```

Apri [http://localhost:4200](http://localhost:4200)

### Build Produzione

```bash
npm run build
```

L'output sarà in `dist/yodas-eye/browser/`

## 📦 Deployment su Cloudflare Pages

### Setup

1. Connetti il repository GitHub a Cloudflare Pages
2. Configura build settings:
   - **Build command**: `npm run build`
   - **Build output directory**: `dist/yodas-eye/browser`
   - **Node version**: 18.x o superiore

3. Aggiungi custom domain:
   - Pages > Custom Domains > Add domain
   - Cloudflare configurerà automaticamente DNS e SSL

### Variabili d'Ambiente

In Cloudflare Pages > Settings > Environment variables:
- `GEMINI_API_KEY`: La tua API key Google Gemini

## 🛠️ Stack Tecnico

- **Framework**: Angular 21.1.2 (Standalone Components)
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS 3.3
- **AI**: Google Gemini (gemini-1.5-flash-002)
- **Build**: Angular CLI + esbuild
- **Deployment**: Cloudflare Pages

## 📁 Struttura Progetto

```
yodas-eye/
├── src/
│   ├── components/          # Componenti UI
│   │   ├── dashboard-view.component.ts
│   │   ├── input-view.component.ts
│   │   ├── tab-*.component.ts
│   ├── services/           # Servizi business logic
│   │   ├── gemini.service.ts
│   │   └── api-utils.ts
│   ├── app.component.ts    # Root component
│   ├── main.ts            # Bootstrap
│   ├── types.ts           # TypeScript interfaces
│   └── styles.css         # Global styles
├── public/                # Static assets
├── angular.json          # Angular config
├── package.json         # Dependencies
└── tsconfig.json        # TypeScript config
```

## 🎨 Design

- **Tema**: Dark mode professionale (slate-900)
- **Accenti**: Teal (#2DD4BF) per focus brand
- **Font**: Inter (Google Fonts)
- **Effetti**: Glow shadows, gradient borders, animazioni subtle
- **Responsive**: Mobile-first con breakpoints Tailwind

## 📊 Tab Dashboard

1. **Visione Galattica**: Overview, leader, theme share
2. **Clusters**: Clustering tematico dettagliato
3. **Matrice**: Analisi tema × formato/intent
4. **Pillar Content**: Identificazione contenuti pilastro
5. **Mappa Opportunità**: Gap analysis e priorità

## 🔒 Sicurezza

⚠️ **IMPORTANTE**: Non committare mai la API key nel codice!

Usa sempre variabili d'ambiente o secrets management.

## 🐛 Troubleshooting

### Build fallisce con errore Angular

Assicurati di usare Angular 21+ per supporto zoneless:
```bash
npm install @angular/core@^21.1.2 --save
```

### Dominio custom non funziona

1. Verifica DNS su Cloudflare
2. Controlla build logs in Pages > Deployments
3. Assicurati che build output directory sia corretto

## 📝 Changelog

### v1.0.1 (2026-02-07)
- ✅ Fix: Aggiornato Angular a v21 per supporto zoneless
- ✅ Fix: Ottimizzazione build per Cloudflare Pages
- ✅ Miglioramento: Error handling e retry logic
- ✅ Documentazione completa

## 👤 Autore

**Maria Paloschi**

- Repository: [github.com/mariapaloschi1-bot/yodas-eye](https://github.com/mariapaloschi1-bot/yodas-eye)
- Website: [yodaseo.club](https://yodaseo.club)

## 📄 Licenza

Questo progetto è privato. Tutti i diritti riservati.

---

**Fatto con ❤️ per la SEO**
