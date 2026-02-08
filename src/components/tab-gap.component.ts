import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { AnalysisResult } from '../types';

@Component({
  selector: 'app-tab-gap',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Gap Analysis -->
      <section>
        <h3 class="text-xl font-bold text-teal-400 mb-6 uppercase tracking-wide flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Gap Tematici Individuati
        </h3>

        <div class="grid gap-6">
          @for (gap of data.theme_gaps; track gap.theme) {
            <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              <div class="p-6">
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h4 class="text-lg font-bold text-slate-200 mb-2">{{ gap.theme }}</h4>
                    <div class="flex items-center gap-4 text-sm">
                      <span class="px-3 py-1 rounded-full text-xs font-bold uppercase"
                            [class]="gap.gap_type === 'underrepresented' 
                              ? 'bg-red-900/30 text-red-400 border border-red-700'
                              : 'bg-amber-900/30 text-amber-400 border border-amber-700'">
                        {{ gap.gap_type === 'underrepresented' ? '🔻 Sotto-rappresentato' : '⚠️ Approccio migliorabile' }}
                      </span>
                      <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-900/30 text-purple-400 border border-purple-700">
                        Priorità: {{ gap.priority }}
                      </span>
                    </div>
                  </div>

                  <div class="text-right">
                    <div class="text-3xl font-bold text-slate-400 mb-1">
                      {{ gap.focus_pct }}%
                    </div>
                    <div class="text-xs text-slate-500">vs {{ gap.competitor_avg_pct }}% competitor</div>
                  </div>
                </div>

                <p class="text-slate-300 leading-relaxed mb-4">
                  {{ gap.rationale }}
                </p>

                <div class="grid md:grid-cols-2 gap-4">
                  <div class="bg-teal-900/20 border border-teal-700 rounded-lg p-4">
                    <h5 class="text-sm font-bold text-teal-400 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      Da Emulare:
                    </h5>
                    <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{{ gap.what_to_emulate }}</p>
                  </div>

                  <div class="bg-red-900/20 border border-red-700 rounded-lg p-4">
                    <h5 class="text-sm font-bold text-red-400 mb-2 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      Da Evitare:
                    </h5>
                    <p class="text-sm text-slate-300 leading-relaxed whitespace-pre-line">{{ gap.what_to_avoid }}</p>
                  </div>
                </div>
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Opportunità Prioritizzate -->
      <section>
        <h3 class="text-xl font-bold text-purple-400 mb-6 uppercase tracking-wide flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Opportunità Strategiche (Top {{ data.prioritized_opportunities.length }})
        </h3>

        <div class="grid gap-6">
          @for (opp of data.prioritized_opportunities; track opp.rank) {
            <div class="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl border-2 border-purple-700/50 overflow-hidden hover:border-purple-500 transition">
              <div class="bg-purple-900/30 px-6 py-3 border-b border-purple-700/50 flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <span class="text-2xl font-bold text-purple-400">#{opp.rank}</span>
                  <span class="px-3 py-1 rounded-full text-xs font-bold bg-purple-600 text-white uppercase">
                    {{ opp.type }}
                  </span>
                </div>
              </div>

              <div class="p-6 space-y-4">
                <h4 class="text-lg font-bold text-slate-200 leading-tight">
                  {{ opp.opportunity }}
                </h4>

                <div class="bg-slate-900/50 rounded-lg p-4 border-l-4 border-teal-500">
                  <p class="text-sm text-slate-300 leading-relaxed">
                    <span class="font-bold text-teal-400">Perché è importante:</span><br>
                    {{ opp.why_it_matters }}
                  </p>
                </div>

                <div>
                  <h5 class="text-sm font-bold text-purple-400 mb-2 flex items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                     Angoli Suggeriti:
                  </h5>
                  <ul class="space-y-2">
                     @for (angle of opp.suggested_angles; track angle) {
                       <li class="flex items-start gap-2 text-sm text-slate-300">
                          <span class="text-teal-500 mt-0.5">▸</span>
                          <span class="flex-1">{{ angle }}</span>
                       </li>
                     }
                  </ul>
                </div>

                @if (opp.proof_points && opp.proof_points.length > 0) {
                  <div class="bg-red-900/10 border border-red-700/30 rounded-lg p-4">
                     <h5 class="text-sm font-bold text-red-400 mb-3 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        Osservati nel Nemico:
                     </h5>
                     <ul class="space-y-3">
                       @for (proof of opp.proof_points; track proof) {
                         <li>
                           <div class="text-sm text-teal-300 whitespace-normal leading-tight">{{ proof }}</div>
                         </li>
                       }
                     </ul>
                  </div>
               }
              </div>
            </div>
          }
        </div>
      </section>

      <!-- Key Insights -->
      @if (data.key_insights && data.key_insights.length > 0) {
        <section class="bg-gradient-to-br from-purple-900/20 to-teal-900/20 border border-purple-700/50 rounded-xl p-6">
          <h3 class="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Saggezza Jedi sui Gap
          </h3>
          <ul class="space-y-2">
            @for (insight of data.key_insights; track insight) {
              <li class="flex items-start gap-2 text-slate-300">
                <span class="text-teal-500 mt-1">✦</span>
                <span class="flex-1">{{ insight }}</span>
              </li>
            }
          </ul>
        </section>
      }
    </div>
  `,
})
export class TabGapComponent {
  @Input({ required: true }) data!: AnalysisResult['tab5_gap_analysis'];
}
