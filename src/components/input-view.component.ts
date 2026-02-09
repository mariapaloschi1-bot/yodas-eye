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
                "Equilibrio cercare dobbiamo. 400 articoli per brand il limite è."
              </p>
            </div>
          </div>
        </div>

        <div class="p-8 space-y-10">
          
          <!-- NUOVO: API Key Section -->
          <div class="bg-amber-900/20 border-2 border-amber-600/50 rounded-xl p-6 relative overflow-hidden">
            <div class="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-amber-500/10 blur-2xl"></div>
            
            <div class="flex items-start gap-4 mb-4">
              <!-- Icona lucchetto: NASCOSTA su mobile -->
              <div class="hidden sm:flex flex-shrink-0 w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/50 items-center justify-center">
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
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" 
                     class="underline hover:text-amber-300 transition">
                    Ottieni qui la tua chiave
                  </a>
                </p>
                
                <div class="relative">
                  <input 
                    [(ngModel)]="apiKey" 
                    [type]="showApiKey() ? 'text' : 'password'"
                    placeholder="Inserisci la tua Gemini API Key..."
                    class="w-full p-4 pr-12 bg-slate-900 border border-amber-600/30 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none transition text-slate-200 font-mono text-sm"
                  />
                  <button
                    type="button"
                    (click)="toggleApiKeyVisibility()"
                    class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-amber-400 transition p-2"
                  >
                    <svg *ngIf="!showApiKey()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fill-rule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clip-rule="evenodd" />
                    </svg>
                    <svg *ngIf="showApiKey()" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fill-rule="evenodd" d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z" clip-rule="evenodd" />
                      <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                    </svg>
                  </button>
                </div>

                <div class="flex items-center justify-between mt-3">
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1 text-xs text-teal-400 bg-teal-900/30 px-2 py-1 rounded-full border border-teal-500/30">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                      </svg>
                      BYOK (Bring Your Own Key)
                    </span>
                    <span *ngIf="isApiKeyStored()" class="text-xs text-slate-500">
                      ✓ Salvata
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Focus Brand -->
          <div>
            <label class="block text-xs font-bold text-teal-500 uppercase tracking-widest mb-2">Il Tuo Ordine (Focus Brand)</label>
            <input 
              [(ngModel)]="focusBrandName" 
              placeholder="Es: Accademia Jedi"
              class="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition text-slate-200"
            />
            <textarea 
              [(ngModel)]="focusBrandData" 
              placeholder="Incolla qui la lista di URL o titoli (uno per riga)"
              class="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition font-mono text-xs text-slate-400"
              rows="6"></textarea>
            <p class="text-[10px] text-slate-500 text-right">
              Max 400 articoli (il resto verrà troncato)
            </p>
          </div>

          <!-- Competitors -->
          <div>
            <label class="block text-xs font-bold text-red-500 uppercase tracking-widest mb-2">Ordini Rivali (Competitor)</label>
            <div class="space-y-6">
              @for (comp of competitors(); track $index) {
                <div class="bg-slate-900/50 p-5 rounded-xl border border-slate-700 relative">
                  <button (click)="removeCompetitor($index)" class="absolute top-4 right-4 text-slate-600 hover:text-red-500 bg-slate-900 p-2 rounded-full border border-slate-700 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /></svg>
                  </button>
                  <input 
                    [(ngModel)]="comp.name" 
                    placeholder="Nome competitor (es: Impero Sith)"
                    class="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition text-slate-200"
                  />
                  <textarea 
                    [(ngModel)]="comp.data" 
                    placeholder="Incolla qui la lista di URL o titoli (uno per riga)"
                    class="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition font-mono text-xs text-slate-400"
                    rows="6"></textarea>
                  <p class="text-[10px] text-slate-500 text-right">
                    Max 400 articoli
                  </p>
                </div>
              }
            </div>

            <button 
              (click)="addCompetitor()" 
              [disabled]="competitors().length >= 10"
              class="mt-4 w-full p-4 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 rounded-xl border border-slate-600 hover:border-slate-500 transition flex items-center justify-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
              Aggiungi Competitor (max 10)
            </button>
          </div>

          <!-- Actions -->
          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-4">
            <button 
              (click)="submit()" 
              [disabled]="!isValid()"
              class="w-full sm:w-auto bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-400 disabled:opacity-50 disabled:cursor-not-allowed text-white px-12 py-5 rounded-2xl font-bold text-xl shadow-[0_0_30px_rgba(20,184,166,0.5)] hover:shadow-[0_0_40px_rgba(20,184,166,0.7)] transition-all duration-300 transform hover:scale-105 hover:-translate-y-1 flex items-center justify-center gap-3 border-2 border-teal-300/30">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
              Avvia Meditazione
            </button>
            <button (click)="loadSampleData()" class="text-sm text-slate-500 underline hover:text-teal-400 transition">
              Carica dati di esempio
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
  competitors = signal<{ name: string; data: string }[]>([{ name: '', data: '' }]);

  @Output() analyze = new EventEmitter<{
    apiKey: string;
    focusBrand: string;
    brands: BrandInput[];
  }>();

  ngOnInit() {
    const saved = localStorage.getItem('yoda_gemini_api_key');
    if (saved) this.apiKey = saved;
  }

  toggleApiKeyVisibility() {
    this.showApiKey.update(v => !v);
  }

  isApiKeyStored() {
    return !!localStorage.getItem('yoda_gemini_api_key');
  }

  addCompetitor() {
    if (this.competitors().length < 10) {
      this.competitors.update(arr => [...arr, { name: '', data: '' }]);
    }
  }

  removeCompetitor(index: number) {
    this.competitors.update(arr => arr.filter((_, i) => i !== index));
  }

  isValid() {
    return (
      this.apiKey.trim() !== '' &&
      this.focusBrandName.trim() !== '' &&
      this.focusBrandData.trim() !== '' &&
      this.competitors().some(c => c.name.trim() !== '' && c.data.trim() !== '')
    );
  }

  loadSampleData() {
    this.apiKey = 'AIzaSy_DEMO_KEY_REPLACE_WITH_REAL_ONE';
    this.focusBrandName = 'Accademia Jedi';
    this.focusBrandData = `https://jedi.force/articolo-1
https://jedi.force/articolo-2
https://jedi.force/articolo-3`;

    this.competitors.set([
      {
        name: 'Impero Sith',
        data: `https://sith.darkside/post-1
https://sith.darkside/post-2
https://sith.darkside/post-3`
      }
    ]);
  }

  submit() {
    const brands: BrandInput[] = [
      {
        name: this.focusBrandName.trim(),
        articles: this.parseData(this.focusBrandData)
      },
      ...this.competitors()
        .filter(c => c.name.trim() && c.data.trim())
        .map(c => ({
          name: c.name.trim(),
          articles: this.parseData(c.data)
        }))
    ];

    localStorage.setItem('yoda_gemini_api_key', this.apiKey);
    this.analyze.emit({ apiKey: this.apiKey, focusBrand: this.focusBrandName.trim(), brands });
  }

  private parseData(raw: string): Article[] {
    return raw
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 400)
      .map(line => {
        const isUrl = line.startsWith('http://') || line.startsWith('https://');
        return {
          url: isUrl ? line : '',
          title: isUrl ? '' : line
        };
      });
  }
}
