import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GeminiService } from './services/gemini.service';
import { InputViewComponent } from './components/input-view.component';
import { DashboardViewComponent } from './components/dashboard-view.component';
import type { BrandInput, AnalysisResult } from './types';

type ViewState = 'input' | 'loading' | 'dashboard' | 'error';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, InputViewComponent, DashboardViewComponent],
  template: `
    <div class="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      @if (state() === 'input') {
        <app-input-view (analyze)="handleAnalyze($event)" />
      }

      @if (state() === 'loading') {
        <div class="flex flex-col items-center justify-center min-h-screen p-8">
          <div class="text-center space-y-8">
            <!-- Yoda animato -->
            <div class="relative w-32 h-32 mx-auto">
              <div class="absolute inset-0 bg-teal-500/20 rounded-full animate-ping"></div>
              <div class="relative w-32 h-32 bg-gradient-to-br from-teal-500 to-purple-600 rounded-full flex items-center justify-center animate-pulse">
                <span class="text-5xl">🧙‍♂️</span>
              </div>
            </div>

            <!-- Testo animato -->
            <div class="space-y-4">
              <h2 class="text-3xl font-bold text-teal-400 animate-pulse">
                {{ currentProcessStep() }}
              </h2>
              <p class="text-slate-400 text-lg">
                Tempo trascorso: <span class="text-teal-400 font-mono">{{ formattedTime() }}</span>
              </p>
              <p class="text-slate-500 text-sm max-w-md mx-auto">
                La Forza lavora per te. Analisi in corso su {{ elapsedSeconds() > 30 ? 'centinaia' : 'decine' }} di articoli...
              </p>
            </div>

            <!-- Barra di progresso -->
            <div class="w-64 mx-auto">
              <div class="h-2 bg-slate-700 rounded-full overflow-hidden">
                <div 
                  class="h-full bg-gradient-to-r from-teal-500 to-purple-600 animate-pulse"
                  [style.width.%]="Math.min((elapsedSeconds() / 120) * 100, 95)"
                ></div>
              </div>
            </div>
          </div>
        </div>
      }

      @if (state() === 'dashboard' && result) {
        <app-dashboard-view 
          [data]="result"
          (back)="resetState()"
        />
      }

      @if (state() === 'error') {
        <div class="flex flex-col items-center justify-center min-h-screen p-8">
          <div class="bg-red-900/20 border border-red-500 rounded-xl p-8 max-w-2xl">
            <h2 class="text-2xl font-bold text-red-400 mb-4">⚠️ Errore nell'Analisi</h2>
            <p class="text-slate-300 mb-6">{{ errorMessage() }}</p>
            <button 
              (click)="resetState()"
              class="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition"
            >
              🔄 Riprova
            </button>
          </div>
        </div>
      }
    </div>
  `,
})
export class AppComponent implements OnDestroy {
  readonly Math = Math;
  private geminiService = inject(GeminiService);

  state = signal<ViewState>('input');
  errorMessage = signal('');
  result: AnalysisResult | null = null;

  // Loading sequence
  elapsedSeconds = signal(0);
  currentProcessStep = signal('Phase 1: Analisi Strategica (Gaps & Overview)...');
  
  private timerInterval: any = null;
  private stepInterval: any = null;

  private loadingSteps = [
    'Phase 1: Analisi Strategica (Gaps & Overview)...',
    'Phase 2: Scansione Profonda dei Cluster...',
    'Phase 3: Calcolo Matrice Tattica...',
    'Phase 4: Identificazione Pillar Content...',
    'Unificando gli Holocron...'
  ];

  ngOnDestroy() {
    this.stopTimers();
  }

  formattedTime() {
    const s = this.elapsedSeconds();
    const minutes = Math.floor(s / 60);
    const seconds = s % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  startLoadingSequence() {
    this.elapsedSeconds.set(0);
    this.currentProcessStep.set(this.loadingSteps[0]);

    // Timer secondi
    this.timerInterval = setInterval(() => {
      this.elapsedSeconds.update(v => v + 1);
    }, 1000);

    // Cambio step ogni 8 secondi
    let stepIndex = 0;
    this.stepInterval = setInterval(() => {
      stepIndex = (stepIndex + 1) % this.loadingSteps.length;
      this.currentProcessStep.set(this.loadingSteps[stepIndex]);
    }, 8000);
  }

  stopTimers() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
    if (this.stepInterval) {
      clearInterval(this.stepInterval);
      this.stepInterval = null;
    }
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
