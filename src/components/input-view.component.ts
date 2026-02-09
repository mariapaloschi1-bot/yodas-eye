import { Component, EventEmitter, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BrandInput, Article } from '../types';

@Component({
  selector: 'app-input-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="max-w-5xl mx-auto p-6 lg:p-12 font-sans">
      <div class="bg-slate-800 rounded-3xl shadow-2xl border border-slate-700 overflow-hidden relative">
        <!-- Glow effect -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-50"></div>

        <!-- Header Section - MOBILE FRIENDLY (icona nascosta su mobile) -->
        <div class="bg-slate-900/50 border-b border-slate-700 p-8">
          <div class="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6">
            
            <!-- Icona Yoda: visibile SOLO su schermi >= sm (≥640px) -->
            <div class="hidden sm:flex w-24 h-24 shrink-0 bg-slate-800 rounded-full border-2 border-teal-500/50 items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.3)] overflow-hidden relative group">
              <div class="absolute inset-0 bg-teal-500/20 group-hover:bg-transparent transition duration-500 z-10"></div>
              <img 
                 src="https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg" 
                 alt="Maestro Yoda" 
                 class="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
              />
            </div>
            
            <!-- Testo -->
            <div>
              <h2 class="text-2xl sm:text-3xl font-extrabold text-teal-400 mb-2 tracking-tight drop-shadow-sm">
                Consiglio Strategico Jedi
              </h2>
              <p class="text-slate-400 italic text-sm sm:text-base">
                "Equilibrio cercare dobbiamo. 500 articoli per brand il limite è."
              </p>
            </div>
          </div>
        </div>

        <div class="p-8 space-y-10">
          
          <!-- NUOVO: API Key Section -->
          <div class="bg-amber-900/20 border-2 border-amber-600/50 rounded-xl p-6 relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl"></div>
            
            <div class="flex items-start gap-4 mb-4">
              <div class="flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clip-rule="evenodd" />
                </svg>
              </div>
              <div class="flex-1">
                <h3 class="text-sm font-bold text-amber-400 uppercase tracking-widest mb-1">
                  🔑 Chiave del Cristallo Kyber (API Key)
                </h3>
                <p class="text-xs text-slate-400 leading-relaxed mb-3">
                  La tua <strong class="text-amber-300">API Key di Google Gemini</strong> è necessaria per alimentare la Forza. 
                  <span class="text-teal-300">Salvata solo nel tuo browser</span>, mai inviata ai nostri server. 
                  <a href="https://aistudio.google.com/apikey" target="_blank" class="text-teal-400 underline hover:text-teal-300 transition">
                    Ottienila qui gratuitamente
                  </a>.
                </p>
                
                <div class="relative group">
                  <input 
                    [(ngModel)]="apiKey" 
                    [type]="showApiKey() ? 'text' : 'password'"
                    placeholder="AIza..."
                    class="w-full p-4 pr-12 bg-slate-900 border border-amber-600/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-slate-200 font-mono text-sm"
                  />
                  <button 
                    (click)="toggleApiKeyVisibility()"
                    type="button"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition p-2"
                    [title]="showApiKey() ? 'Nascondi' : 'Mostra'"
                  >
                    @if (showApiKey()) {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                      </svg>
                    } @else {
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                        <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                      </svg>
                    }
                  </button>
                </div>
                
                <div class="flex items-center gap-2 mt-3">
                  @if (isApiKeyStored()) {
                    <span class="inline-flex items-center gap-1 text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded-full border border-teal-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      Salvata in LocalStorage
                    </span>
                  }
                  @if (apiKey && apiKey.length > 10) {
                    <span class="text-xs text-slate-500">
                      Lunghezza: {{ apiKey.length }} caratteri
                    </span>
                  }
                </div>
              </div>
            </div>
          </div>
          
          <!-- Focus Brand -->
          <div>
            <label class="block text-xs font-bold text-teal-500 uppercase tracking-widest mb-2">Il Tuo Ordine (Focus Brand)</label>
            <div class="flex flex-col gap-4">
              <input 
                [(ngModel)]="focusBrandName" 
                placeholder="es. Ordine Jedi"
                class="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition text-slate-200"
              />
              <textarea 
                [(ngModel)]="focusBrandData"
                rows="6" 
                placeholder="Gli archivi qui incollare devi (CSV):&#10;URL, Titolo (o solo URL)&#10;Max 400 articoli per stabilità JSON."
                class="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition font-mono text-xs text-slate-400"
              ></textarea>
              <p class="text-[10px] text-slate-500 text-right">
                {{ parseData(focusBrandData).length }} / 400 articoli rilevati
              </p>
            </div>
          </div>

          <!-- Competitors -->
          <div class="space-y-6">
            @for (comp of competitors(); track $index) {
              <div class="relative bg-slate-800/50 p-6 rounded-xl border border-slate-700 hover:border-red-900/50 transition">
                <button (click)="removeCompetitor($index)" class="absolute top-4 right-4 text-slate-600 hover:text-red-500 bg-slate-900 p-2 rounded-full border border-slate-700 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                </button>
                <label class="block text-xs font-bold text-red-400 uppercase tracking-widest mb-3">Minaccia Sith (Competitor Unico)</label>
                <div class="flex flex-col gap-3">
                  <input 
                    [(ngModel)]="comp.name" 
                    placeholder="Nome dell'Impero Rivale"
                    class="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition text-slate-200"
                  />
                  <textarea 
                    [(ngModel)]="comp.data"
                    rows="4" 
                    placeholder="Incolla qui gli URL dei Sith (CSV)... Max 400 articoli."
                    class="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition font-mono text-xs text-slate-400"
                  ></textarea>
                  <p class="text-[10px] text-slate-500 text-right">
                    {{ parseData(comp.data).length }} / 400 articoli rilevati
                  </p>
                </div>
              </div>
            }
          </div>

          <!-- Action Bar -->
          <div class="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
             <div class="flex gap-4 items-center">
               @if (competitors().length < 10) {
                <button (click)="addCompetitor()" class="text-red-400 hover:text-red-300 transition flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-700/50 font-bold text-sm tracking-wide">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                  Aggiungi Rivale
                </button>
               }
               <button (click)="loadSampleData()" class="text-sm text-slate-500 underline hover:text-teal-400 transition">
                  Archivi Demo
               </button>
             </div>

             <button 
                (click)="submit()"
                [disabled]="!isValid()"
                class="w-full sm:w-auto bg-teal-600 hover:bg-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-10 py-4 rounded-xl font-bold text-lg shadow-[0_0_20px_rgba(20,184,166,0.4)] hover:shadow-[0_0_30px_rgba(20,184,166,0.6)] transition transform hover:-translate-y-1 flex items-center justify-center gap-3 border border-teal-400/20"
              >
                <span>Meditare sui Dati</span>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </button>
          </div>
        </div>
      </div>
      
      <footer class="text-center mt-8 text-slate-500 text-sm font-medium opacity-60 hover:opacity-100 transition-opacity duration-300">
         Fatto con ❤️ per la SEO da Maria Paloschi
      </footer>
    </div>
  `
})
export class InputViewComponent {
  apiKey = '';
  showApiKey = signal(false);
  
  focusBrandName = '';
  focusBrandData = '';
  
  competitors = signal<{name: string, data: string}[]>([]);

  @Output() analyze = new EventEmitter<{apiKey: string, focusBrand: string, brands: BrandInput[]}>();

  constructor() {
    // Carica API key da localStorage se presente
    const stored = localStorage.getItem('yoda_gemini_api_key');
    if (stored) {
      this.apiKey = stored;
    }
  }

  toggleApiKeyVisibility() {
    this.showApiKey.update(v => !v);
  }

  isApiKeyStored(): boolean {
    return !!localStorage.getItem('yoda_gemini_api_key');
  }

  addCompetitor() {
    if (this.competitors().length < 10) {
      this.competitors.update(c => [...c, { name: '', data: '' }]);
    }
  }

  removeCompetitor(index: number) {
    this.competitors.update(c => c.filter((_, i) => i !== index));
  }

  isValid() {
    return this.apiKey && 
           this.apiKey.length > 10 &&
           this.focusBrandName && 
           this.focusBrandData && 
           this.competitors().every(c => c.name && c.data);
  }

  loadSampleData() {
    // Imposta anche una API key demo (non funzionante, solo per test UI)
    if (!this.apiKey) {
      this.apiKey = 'AIzaSy_DEMO_KEY_REPLACE_WITH_REAL_ONE';
    }
    
    this.focusBrandName = "Accademia Jedi";
    this.focusBrandData = `https://jedi.force/uso-della-forza-avanzato, Uso della Forza: Guida Avanzata
https://jedi.force/costruire-spada-laser, Costruzione Spada Laser per Padawan
https://jedi.force/codice-jedi-spiegato, Il Codice Jedi: Nessuna Emozione c'è Pace
https://jedi.force/meditazione-quotidiana, Tecniche di Meditazione Quotidiana
https://jedi.force/diplomazia-galattica, Basi di Diplomazia Galattica`;

    this.competitors.set([
      {
        name: "Impero Sith",
        data: `https://sith.darkside/potere-illimitato, Ottenere Potere Illimitato
https://sith.darkside/regola-dei-due, La Regola dei Due Spiegata
https://sith.darkside/passione-e-forza, La Pace è una Menzogna: Passione e Forza
https://sith.darkside/fulmini-di-forza, Guida ai Fulmini di Forza`
      }
    ]);
  }

  parseData(raw: string): Article[] {
    const parsed = raw.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 2)
      .map(line => {
        let cleanLine = line.replace(/^"|"$/g, '').trim();
        let separator = ',';
        if (cleanLine.includes('\t')) separator = '\t';
        else if (cleanLine.includes(';')) separator = ';';
        
        const parts = cleanLine.split(separator);
        let url = '';
        let title = '';

        if (parts.length >= 2) {
             const p1 = parts[0].trim();
             const p2 = parts.slice(1).join(separator).trim();
             if (p1.includes('.') || p1.includes('/')) {
                 url = p1;
                 title = p2;
             } else {
                 title = p1;
                 url = p2;
             }
        } else {
            url = cleanLine;
            title = cleanLine;
        }

        if (!url) return null;
        return { url, title: title || url };
      })
      .filter((item): item is Article => item !== null);

    // LIMITATO A 400 PER BRAND PER SICUREZZA OUTPUT
    return parsed.slice(0, 400);
  }

  submit() {
    // Salva API key in localStorage
    localStorage.setItem('yoda_gemini_api_key', this.apiKey);
    
    const brands: BrandInput[] = [];
    
    brands.push({
      name: this.focusBrandName,
      articles: this.parseData(this.focusBrandData)
    });

    this.competitors().forEach(c => {
      brands.push({
        name: c.name,
        articles: this.parseData(c.data)
      });
    });

    this.analyze.emit({ 
      apiKey: this.apiKey,
      focusBrand: this.focusBrandName, 
      brands 
    });
  }
}
