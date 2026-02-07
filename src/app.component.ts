import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';
import { AnalysisResult, BrandInput } from './types';
import { InputViewComponent } from './components/input-view.component';
import { DashboardViewComponent } from './components/dashboard-view.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule, 
    InputViewComponent, 
    DashboardViewComponent
  ],
  template: `
    @if (state() === 'input') {
      <div class="min-h-screen w-full bg-slate-900 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
        <div class="py-8 md:py-12 px-4">
          <header class="text-center mb-8 md:mb-12">
             <div class="flex items-center justify-center gap-3 mb-6 animate-bounce">
               <div class="w-16 h-16 md:w-20 md:h-20 rounded-full border-2 border-teal-400 shadow-[0_0_20px_rgba(45,212,191,0.5)] overflow-hidden">
                  <!-- RIPRISTINATA IMMAGINE FUNZIONANTE -->
                  <img src="https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg" alt="Yoda Logo" class="w-full h-full object-cover">
               </div>
             </div>
             
             <h1 class="text-3xl md:text-5xl font-extrabold text-teal-400 tracking-tight mb-2 font-mono drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]">
               YODA'S <span class="text-slate-100">EYE</span>
             </h1>
             
             <h2 class="text-xs md:text-lg text-teal-600/80 font-bold uppercase tracking-[0.2em] mb-4">
               Analisi Competitiva Editoriale
             </h2>
             
             <div class="inline-block bg-slate-800/50 px-4 py-2 rounded-full border border-slate-700 mb-6">
               <p class="text-sm md:text-lg text-slate-400 italic">"Molto da apprendere ancora tu hai..."</p>
             </div>

             <!-- Description Box -->
             <div class="max-w-3xl mx-auto bg-slate-800/80 p-6 rounded-2xl border border-teal-900/50 shadow-lg backdrop-blur-sm relative overflow-hidden group">
                <div class="absolute top-0 left-0 w-1 h-full bg-teal-500"></div>
                <h3 class="text-teal-400 font-bold mb-3 uppercase text-xs tracking-widest flex items-center justify-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  Come Funziona il Tool
                </h3>
                <p class="text-slate-300 text-sm leading-relaxed">
                  <strong>Yoda's Eye</strong> sfrutta la Forza dell'Intelligenza Artificiale (Gemini) per analizzare la tua strategia editoriale contro quella dei Sith (competitor).
                  <br class="mb-2 block">
                  Inserisci le liste di URL e titoli degli articoli: il Consiglio Jedi elaborerà semanticamente i dati per rivelare 
                  <span class="text-teal-300 font-bold">Cluster Tematici</span>, 
                  <span class="text-amber-300 font-bold">Gap Strategici</span> e 
                  <span class="text-purple-300 font-bold">Opportunità di Ranking</span> nascoste nella galassia SERP.
                </p>
             </div>
          </header>
          <app-input-view (analyze)="handleAnalyze($event)"></app-input-view>
        </div>
      </div>
    }

    @if (state() === 'loading') {
      <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] p-4">
        <div class="bg-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl flex flex-col items-center text-center max-w-lg w-full border border-teal-500/30 relative overflow-hidden">
          <div class="absolute inset-0 bg-teal-500/5 animate-pulse"></div>
          
          <div class="relative w-24 h-24 mb-6">
             <!-- Spinner around image -->
             <div class="absolute inset-0 rounded-full border-4 border-slate-700"></div>
             <div class="absolute inset-0 rounded-full border-4 border-teal-400 border-t-transparent animate-spin shadow-[0_0_15px_rgba(45,212,191,0.6)] z-20"></div>
             <div class="absolute inset-1 rounded-full overflow-hidden z-10">
                <img src="https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg" class="w-full h-full object-cover opacity-80">
             </div>
          </div>
          
          <h2 class="text-2xl md:text-3xl font-bold text-teal-400 mb-2 tracking-wide">Meditando io sto...</h2>
          <p class="text-slate-400 italic mb-6">"Pazienza avere tu devi, l'analisi tempo richiede..."</p>
          
          <!-- Timer Display -->
          <div class="font-mono text-xl text-teal-300 font-bold mb-4 bg-slate-900/50 px-4 py-1 rounded border border-teal-500/30">
             {{ formattedTime }}
          </div>
          
          <div class="mb-6 px-4 py-2 bg-slate-900/50 rounded-lg border border-slate-700">
             <p class="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Nota del Consiglio:</p>
             <p class="text-xs text-slate-400">
               Per grandi archivi (1000+ URL), la meditazione può durare fino a <strong>10-15 minuti</strong>. 
               La Forza scorre potente, ma lenta. Non chiudere questa finestra.
             </p>
          </div>

          <!-- Progress Text -->
          <div class="h-8 flex items-center justify-center overflow-hidden w-full">
            <p class="text-slate-300 leading-relaxed text-sm md:text-base animate-[fadeInOut_3s_infinite] italic">
               "{{ currentProcessStep() }}"
            </p>
          </div>
        </div>
      </div>
    }

    @if (state() === 'dashboard' && result) {
      <app-dashboard-view [data]="result!"></app-dashboard-view>
    }

    @if (state() === 'error') {
      <div class="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 text-center">
        <div class="bg-slate-800 p-10 rounded-2xl shadow-2xl max-w-lg w-full border border-red-900/50">
          <div class="text-red-500 mb-6 bg-red-900/20 inline-block p-6 rounded-full border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 class="text-2xl md:text-3xl font-bold text-red-500 mb-2 font-mono">Disturbo nella Forza</h2>
          <p class="text-slate-400 mb-6 italic">"Fallito ho. Nel Lato Oscuro un errore c'è."</p>
          
          <!-- Error Details -->
          <div class="bg-red-950/50 border border-red-500/20 p-4 rounded-lg mb-8 text-left overflow-auto max-h-40 custom-scrollbar">
            <p class="text-red-400 text-xs font-mono whitespace-pre-wrap break-all">{{ errorMessage() }}</p>
          </div>

          <button (click)="resetState()" class="w-full md:w-auto bg-slate-700 hover:bg-slate-600 text-white px-8 py-3 rounded-lg font-bold transition shadow-lg border border-slate-500">
            Ritorna al Tempio
          </button>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeInOut {
      0%, 100% { opacity: 0.5; transform: translateY(2px); }
      50% { opacity: 1; transform: translateY(0); }
    }
  `]
})
export class AppComponent implements OnDestroy {
  private geminiService = inject(GeminiService);
  
  state = signal<'input' | 'loading' | 'dashboard' | 'error'>('input');
  errorMessage = signal<string>('');
  result: AnalysisResult | null = null;

  // Timer & Loading State Logic
  elapsedSeconds = signal(0);
  currentProcessStep = signal('Inizializzazione sensori...');
  
  private timerInterval: any;
  private stepInterval: any;

  private loadingSteps = [
    "Fase 1: Analisi Strategica (Gaps & Overview)...",
    "Fase 2: Scansione Profonda dei Cluster...",
    "Fase 3: Calcolo Matrice Tattica...",
    "Fase 4: Identificazione Pillar Content...",
    "Unificando gli Holocron..."
  ];

  ngOnDestroy() {
    this.stopTimers();
  }

  get formattedTime() {
    const minutes = Math.floor(this.elapsedSeconds() / 60);
    const seconds = this.elapsedSeconds() % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  private startLoadingSequence() {
    this.elapsedSeconds.set(0);
    this.currentProcessStep.set(this.loadingSteps[0]);
    
    // Timer updates every second
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(v => v + 1);
    }, 1000);

    // Step updates every 8 seconds (più lento per dare tempo alle chiamate multiple)
    let stepIndex = 0;
    this.stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % this.loadingSteps.length;
      this.currentProcessStep.set(this.loadingSteps[stepIndex]);
    }, 8000);
  }

  private stopTimers() {
    if (this.timerInterval) clearInterval(this.timerInterval);
    if (this.stepInterval) clearInterval(this.stepInterval);
  }

  handleAnalyze(event: { apiKey: string, focusBrand: string, brands: BrandInput[] }) {
    this.state.set('loading');
    this.startLoadingSequence();

    this.geminiService.analyzeContent(event.apiKey, event.focusBrand, event.brands)
      .then(result => {
        this.result = result;
        this.state.set('dashboard');
        this.stopTimers();
      })
      .catch(error => {
        console.error(error);
        this.errorMessage.set(error.message || "Errore sconosciuto durante l'analisi.");
        this.state.set('error');
        this.stopTimers();
      });
  }

  resetState() {
    this.state.set('input');
    this.result = null;
    this.errorMessage.set('');
  }
}