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

        <!-- Header Section -->
        <div class="bg-slate-900/50 border-b border-slate-700 p-8 flex items-center gap-6">
           <div class="w-24 h-24 shrink-0 bg-slate-800 rounded-full border-2 border-teal-500/50 flex items-center justify-center shadow-[0_0_20px_rgba(45,212,191,0.3)] overflow-hidden relative group">
             <div class="absolute inset-0 bg-teal-500/20 group-hover:bg-transparent transition duration-500 z-10"></div>
             <img 
                src="https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg" 
                alt="Maestro Yoda" 
                class="w-full h-full object-cover transform group-hover:scale-110 transition duration-700"
             />
           </div>
           <div>
             <h2 class="text-3xl font-extrabold text-teal-400 mb-2 tracking-tight drop-shadow-sm">Consiglio Strategico Jedi</h2>
             <p class="text-slate-400 italic">"Equilibrio cercare dobbiamo. 500 articoli per brand il limite è."</p>
           </div>
        </div>

        <div class="p-8 space-y-10">
          
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
                placeholder="Gli archivi qui incollare devi (CSV):&#10;URL, Titolo (o solo URL)&#10;Max 500 articoli per stabilità JSON."
                class="w-full p-4 bg-slate-900 border border-slate-700 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none transition font-mono text-xs text-slate-400"
              ></textarea>
              <p class="text-[10px] text-slate-500 text-right">
                {{ parseData(focusBrandData).length }} / 500 articoli rilevati
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
                    placeholder="Incolla qui gli URL dei Sith (CSV)... Max 500 articoli."
                    class="w-full p-3 bg-slate-900 border border-slate-700 rounded-lg focus:ring-2 focus:ring-red-500 outline-none transition font-mono text-xs text-slate-400"
                  ></textarea>
                  <p class="text-[10px] text-slate-500 text-right">
                    {{ parseData(comp.data).length }} / 500 articoli rilevati
                  </p>
                </div>
              </div>
            }
          </div>

          <!-- Action Bar -->
          <div class="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4">
             <div class="flex gap-4 items-center">
               @if (competitors().length < 1) {
                <button (click)="addCompetitor()" class="text-red-400 hover:text-red-300 transition flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-slate-700/50 font-bold text-sm tracking-wide">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                  Aggiungi il Rivale (Sith)
                </button>
               }
               <button (click)="loadSampleData()" class="text-sm text-slate-500 underline hover:text-teal-400 transition">
                  Archivi Demo Usare
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
  focusBrandName = '';
  focusBrandData = '';
  
  competitors = signal<{name: string, data: string}[]>([]);

  @Output() analyze = new EventEmitter<{focusBrand: string, brands: BrandInput[]}>();

  addCompetitor() {
    if (this.competitors().length < 1) {
      this.competitors.update(c => [...c, { name: '', data: '' }]);
    }
  }

  removeCompetitor(index: number) {
    this.competitors.update(c => c.filter((_, i) => i !== index));
  }

  isValid() {
    return this.focusBrandName && this.focusBrandData && 
           this.competitors().every(c => c.name && c.data);
  }

  loadSampleData() {
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

    // LIMITATO A 500 PER BRAND PER SICUREZZA OUTPUT
    return parsed.slice(0, 500);
  }

  submit() {
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
      focusBrand: this.focusBrandName, 
      brands 
    });
  }
}