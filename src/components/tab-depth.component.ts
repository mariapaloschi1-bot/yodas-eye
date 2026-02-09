import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../types';

@Component({
  selector: 'app-tab-depth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Top Insights Box (Always on Top) -->
    <div class="bg-slate-800/80 rounded-xl border border-slate-700 p-6 mb-8 shadow-lg">
      <h3 class="flex items-center gap-2 text-teal-400 font-bold mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
        Saggezza sui Pillar Content
      </h3>
      <div class="space-y-4">
        @for (insight of data.key_insights; track $index) {
          <div class="bg-slate-900/50 p-5 rounded-lg border border-slate-700/50 shadow-sm border-l-4 border-l-amber-500">
             <p class="text-sm text-slate-300 leading-relaxed whitespace-normal">{{ insight }}</p>
          </div>
        }
        @if (!data.key_insights || data.key_insights.length === 0) {
           <p class="text-slate-500 italic">Nessun insight specifico sui pillar disponibile.</p>
        }
      </div>
    </div>

    <!-- Pillar Candidates Grid (ARRICCHITO) -->
    <div class="space-y-8 mb-8">
       @for (brand of getBrands(data.pillar_candidates); track brand) {
        <div class="bg-slate-800 rounded-xl border border-slate-700 shadow-md p-6 relative overflow-hidden">
           <!-- Background Glow -->
           <div class="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-5 blur-3xl bg-teal-500"></div>

           <h3 class="text-xl font-bold mb-6 flex items-center gap-3 relative z-10 text-white border-b border-slate-700 pb-3">
             <span class="bg-slate-700 p-1.5 rounded text-teal-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
             </span>
             Candidati Pillar: {{ brand }}
           </h3>
           
           <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 relative z-10">
             @for (pillar of data.pillar_candidates[brand]; track pillar.url) {
               <div class="bg-gradient-to-br from-slate-900/90 to-slate-900/70 p-6 rounded-lg border border-slate-700 hover:border-teal-500/50 hover:shadow-xl transition-all duration-300 flex flex-col shadow-md">
                  
                  <!-- Badge Pillar -->
                  <div class="flex items-center justify-between mb-3">
                    <span class="inline-block px-3 py-1 bg-teal-500/20 text-teal-400 text-xs font-semibold rounded-full border border-teal-500/30">
                      🏛️ Pillar Content
                    </span>
                  </div>

                  <!-- Titolo -->
                  <div class="flex-1 mb-4">
                    <h4 class="text-base font-bold text-slate-100 mb-3 leading-snug whitespace-normal hover:text-teal-300 transition">
                      {{ pillar.title }}
                    </h4>
                    
                    <!-- Reason (Why Pillar) -->
                    <div class="bg-slate-800/50 p-4 rounded border-l-4 border-amber-500/50 mb-4">
                      <p class="text-xs text-slate-300 italic leading-relaxed whitespace-normal">
                        <span class="font-semibold text-amber-400">📌 Perché Pillar:</span><br>
                        "{{ pillar.reason }}"
                      </p>
                    </div>
                  </div>

                  <!-- URL + CTA -->
                  <div class="mt-auto pt-4 border-t border-slate-700/50 flex flex-col gap-3">
                     <!-- URL -->
                     <div class="flex items-start gap-2">
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-slate-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                       <a [href]="pillar.url" target="_blank" rel="noopener noreferrer" class="text-xs font-mono text-slate-400 hover:text-teal-400 transition break-all leading-tight">
                         {{ pillar.url }}
                       </a>
                     </div>

                     <!-- CTA Button -->
                     <a [href]="pillar.url" target="_blank" rel="noopener noreferrer" 
                        class="inline-flex items-center justify-center gap-2 px-4 py-2 bg-teal-600/20 hover:bg-teal-600/30 text-teal-400 text-sm font-medium rounded-lg border border-teal-500/30 hover:border-teal-500/50 transition-all duration-200 group">
                       <span>Approfondisci Pillar</span>
                       <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                     </a>

                     <!-- Metriche Suggerite (Placeholder per future espansioni) -->
                     <div class="flex items-center gap-3 text-xs text-slate-500 pt-2 border-t border-slate-800">
                       <span class="flex items-center gap-1">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                         Long-form
                       </span>
                       <span class="flex items-center gap-1">
                         <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                         High Authority
                       </span>
                     </div>
                  </div>
               </div>
             }
             @if (!data.pillar_candidates[brand]?.length) {
               <div class="col-span-full text-center text-slate-500 italic py-8 bg-slate-900/30 rounded-lg border border-slate-700/50">
                 Nessun contenuto pillar identificato chiaramente per questo brand.
               </div>
             }
           </div>
        </div>
       }
    </div>

    <!-- Sezione Utilità Aggiuntiva: Come Usare i Pillar -->
    <div class="bg-gradient-to-r from-slate-800/80 to-slate-900/80 rounded-xl border border-slate-700 p-6 mt-8 shadow-lg">
      <h3 class="text-lg font-bold text-teal-400 mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Come Usare Questi Pillar Content
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm text-slate-300">
        <div class="bg-slate-900/50 p-4 rounded-lg border-l-4 border-teal-500/50">
          <h4 class="font-semibold text-teal-400 mb-2">🔗 Linking Strategy</h4>
          <p class="text-xs leading-relaxed">Usa i pillar come hub centrali per link interni da articoli satellite sullo stesso tema.</p>
        </div>
        <div class="bg-slate-900/50 p-4 rounded-lg border-l-4 border-amber-500/50">
          <h4 class="font-semibold text-amber-400 mb-2">📊 Benchmark Competitor</h4>
          <p class="text-xs leading-relaxed">Analizza struttura, profondità e formato dei pillar competitor per migliorare i tuoi.</p>
        </div>
        <div class="bg-slate-900/50 p-4 rounded-lg border-l-4 border-purple-500/50">
          <h4 class="font-semibold text-purple-400 mb-2">🎯 Espansione Topic</h4>
          <p class="text-xs leading-relaxed">Identifica subtopic non coperti nei tuoi pillar ma presenti nei competitor.</p>
        </div>
      </div>
    </div>
  `
})
export class TabDepthComponent {
  @Input({ required: true }) data!: AnalysisResult['tab4_depth_and_format'];

  getBrands(obj: any) {
    return obj ? Object.keys(obj) : [];
  }
}
