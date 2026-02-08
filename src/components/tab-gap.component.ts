import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../types';

@Component({
  selector: 'app-tab-gap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-12 pb-12">
      
      <!-- Insights Box (Saggezza Jedi) -->
      <div class="bg-slate-800/80 rounded-xl border border-slate-700 p-6 shadow-lg">
        <h3 class="flex items-center gap-2 text-teal-400 font-bold mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
          Saggezza sul Divario (Gap Analysis)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (insight of data.key_insights; track $index) {
            <div class="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 shadow-sm flex gap-3 items-start">
               <span class="text-amber-500 font-bold text-lg mt-0.5">✦</span>
               <p class="text-sm text-slate-300 italic leading-relaxed whitespace-normal">"{{ insight }}"</p>
            </div>
          }
          @if (!data.key_insights || data.key_insights.length === 0) {
             <p class="text-slate-500 italic">Tutto bilanciato sembra, o nebbia c'è sui dati.</p>
          }
        </div>
      </div>

      <!-- Prioritized Opportunities -->
      <section>
        <div class="flex items-center gap-3 mb-6">
            <span class="bg-teal-900/50 text-teal-400 p-2 rounded-lg shadow-md border border-teal-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </span>
            <h3 class="text-2xl font-bold text-white tracking-wide">Nuovi Sentieri (Opportunità Prioritarie)</h3>
        </div>

        <div class="grid grid-cols-1 gap-6">
          @for (opp of data.prioritized_opportunities; track opp.rank) {
            <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-teal-500/50 transition duration-300 shadow-lg relative group">
               <!-- Rank Badge -->
               <div class="absolute top-0 right-0 bg-slate-700 text-teal-400 text-xs font-bold px-3 py-1 rounded-bl-xl border-b border-l border-slate-600 z-10">
                 Priorità #{{ opp.rank }}
               </div>
               
               <div class="p-6 md:p-8 flex flex-col md:flex-row gap-8">
                  <!-- Left: Core Info -->
                  <div class="flex-1">
                     <div class="flex items-center gap-3 mb-3">
                        <span class="px-2 py-1 bg-teal-900/40 text-teal-300 rounded text-[10px] uppercase font-bold tracking-widest border border-teal-500/20">
                          {{ opp.type }}
                        </span>
                     </div>
                     <h4 class="text-xl md:text-2xl font-bold text-white mb-4 leading-tight group-hover:text-teal-400 transition whitespace-normal">
                       {{ opp.opportunity }}
                     </h4>
                     <p class="text-slate-300 leading-relaxed mb-6 border-l-4 border-slate-600 pl-4 italic whitespace-normal">
                       {{ opp.why_it_matters }}
                     </p>

                     <div class="space-y-4">
                        <div>
                          <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Angoli di Attacco Consigliati:</h5>
                          <div class="flex flex-wrap gap-2">
                            @for (angle of opp.suggested_angles; track angle) {
                              <span class="bg-slate-900 text-slate-300 px-3 py-1.5 rounded-full text-xs font-medium border border-slate-700 shadow-sm whitespace-normal">
                                {{ angle }}
                              </span>
                            }
                          </div>
                        </div>
                     </div>
                  </div>

                  <!-- Right: Proof & Examples -->
                  <div class="md:w-1/3 bg-slate-900/50 rounded-xl p-5 border border-slate-700/50">
                     <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Osservati nel Nemico:
                     </h5>
                     <ul class="space-y-3">
                       @for (proof of opp.proof_points; track $index) {
                         <li>
                           <div class="block">
                             <div class="text-xs font-bold text-red-400 mb-0.5 whitespace-normal">{{ proof.brand }}</div>
                             <div class="text-sm text-slate-300 whitespace-normal leading-tight">{{ proof.title }}</div>
                           </div>
                         </li>
                       }
                     </ul>
                  </div>
               </div>
            </div>
          }
        </div>
      </section>

      <!-- Detailed Gaps Table/List -->
      <section>
         <div class="flex items-center gap-3 mb-6">
            <span class="bg-red-900/30 text-red-400 p-2 rounded-lg shadow-md border border-red-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
            </span>
            <h3 class="text-2xl font-bold text-white tracking-wide">Analisi dei Gap (Dove debole sei)</h3>
         </div>
         
         <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            @for (gap of data.theme_gaps; track gap.theme) {
              <div class="bg-slate-800 rounded-lg border border-slate-700 p-5 hover:bg-slate-800/80 transition flex flex-col h-full">
                 <div class="flex justify-between items-start mb-4">
                    <div>
                      <h4 class="font-bold text-lg text-white mb-1">{{ gap.theme }}</h4>
                      <div class="flex items-center gap-2 text-xs">
                        <span [class]="getPriorityClass(gap.priority)">Priorità {{ gap.priority }}</span>
                        <span class="text-slate-500">•</span>
                        <span class="text-slate-400">{{ gap.gap_type }}</span>
                      </div>
                    </div>
                    <div class="text-right">
                       <div class="text-[10px] text-slate-500 uppercase">Gap Score</div>
                       <div class="text-red-400 font-bold text-lg">-{{ (gap.competitor_avg_pct - gap.focus_pct).toFixed(1) }}%</div>
                    </div>
                 </div>
                 
                 <p class="text-sm text-slate-400 mb-4 flex-grow whitespace-normal leading-relaxed">{{ gap.rationale }}</p>
                 
                 <div class="grid grid-cols-2 gap-4 mt-auto pt-4 border-t border-slate-700">
                    <div>
                       <h5 class="text-[10px] font-bold text-teal-500 uppercase mb-2">Da Emulare (Jedi Way)</h5>
                       <ul class="list-disc list-inside text-xs text-slate-300 space-y-1">
                         @for (item of gap.what_to_emulate; track item) {
                           <li class="whitespace-normal">{{ item }}</li>
                         }
                       </ul>
                    </div>
                    <div>
                       <h5 class="text-[10px] font-bold text-red-500 uppercase mb-2">Da Evitare (Lato Oscuro)</h5>
                       <ul class="list-disc list-inside text-xs text-slate-300 space-y-1">
                         @for (item of gap.what_to_avoid; track item) {
                           <li class="whitespace-normal">{{ item }}</li>
                         }
                       </ul>
                    </div>
                 </div>
              </div>
            }
         </div>
      </section>

    </div>
  `
})
export class TabGapComponent {
  @Input({ required: true }) data!: AnalysisResult['tab5_gap_analysis'];

  getPriorityClass(priority: string) {
    const base = "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border ";
    if (priority.toLowerCase() === 'alta' || priority.toLowerCase() === 'high') {
      return base + "bg-red-900/30 text-red-400 border-red-500/30";
    } else if (priority.toLowerCase() === 'media' || priority.toLowerCase() === 'medium') {
      return base + "bg-amber-900/30 text-amber-400 border-amber-500/30";
    }
    return base + "bg-slate-700 text-slate-400 border-slate-600";
  }
}