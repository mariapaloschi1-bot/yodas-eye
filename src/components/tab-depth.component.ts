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
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (insight of data.key_insights; track $index) {
          <div class="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 shadow-sm border-l-2 border-l-amber-500">
             <p class="text-sm text-slate-300 italic whitespace-normal">"{{ insight }}"</p>
          </div>
        }
        @if (!data.key_insights || data.key_insights.length === 0) {
           <p class="text-slate-500 italic">Nessun insight specifico sui pillar disponibile.</p>
        }
      </div>
    </div>

    <!-- Pillar Candidates Grid -->
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
           
           <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative z-10">
             @for (pillar of data.pillar_candidates[brand]; track pillar.url) {
               <div class="bg-slate-900/80 p-5 rounded-lg border border-slate-700 hover:border-teal-500/30 transition duration-300 flex flex-col shadow-sm">
                  <div class="flex-1 mb-3">
                    <h4 class="text-sm font-bold text-slate-200 mb-2 text-teal-300 transition leading-snug whitespace-normal">
                      {{ pillar.title }}
                    </h4>
                    <p class="text-xs text-slate-400 italic leading-relaxed border-l-2 border-slate-700 pl-3 whitespace-normal">
                      "{{ pillar.reason }}"
                    </p>
                  </div>
                  <div class="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between">
                     <span class="text-[10px] font-mono text-slate-600 truncate w-full">{{ pillar.url }}</span>
                  </div>
               </div>
             }
             @if (!data.pillar_candidates[brand]?.length) {
               <div class="col-span-full text-center text-slate-500 italic py-4">Nessun contenuto pillar identificato chiaramente.</div>
             }
           </div>
        </div>
       }
    </div>
  `
})
export class TabDepthComponent {
  @Input({ required: true }) data!: AnalysisResult['tab4_depth_and_format'];

  getBrands(obj: any) {
    return obj ? Object.keys(obj) : [];
  }
}