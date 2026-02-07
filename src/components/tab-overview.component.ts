import { Component, Input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../types';

@Component({
  selector: 'app-tab-overview',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      <!-- Leaders Cards -->
      @if (data.leaders?.breadth_leader) {
        <div class="bg-slate-800 p-6 rounded-xl border-l-4 border-teal-500 shadow-lg relative overflow-hidden flex flex-col">
          <div class="absolute -right-4 -top-4 w-20 h-20 bg-teal-500/10 rounded-full blur-xl"></div>
          <h3 class="text-xs font-bold text-teal-400 uppercase tracking-widest mb-4">Maestro dell'Ampiezza</h3>
          <div class="flex items-end gap-3 mb-2">
             <span class="text-3xl font-bold text-white">{{ data.leaders.breadth_leader.brand }}</span>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed italic whitespace-normal">"{{ data.leaders.breadth_leader.why }}"</p>
        </div>
      }
      
      @if (data.leaders?.specialist) {
        <div class="bg-slate-800 p-6 rounded-xl border-l-4 border-amber-500 shadow-lg relative overflow-hidden flex flex-col">
          <div class="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-xl"></div>
          <h3 class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-4">Specialista del Settore</h3>
          <div class="flex items-end gap-3 mb-2">
             <span class="text-3xl font-bold text-white">{{ data.leaders.specialist.brand }}</span>
          </div>
          <p class="text-sm text-slate-400 leading-relaxed italic whitespace-normal">"{{ data.leaders.specialist.why }}"</p>
        </div>
      }

      <div class="bg-slate-800 p-6 rounded-xl border-l-4 border-purple-500 shadow-lg flex flex-col justify-between relative overflow-hidden">
        <div class="absolute -right-4 -top-4 w-20 h-20 bg-purple-500/10 rounded-full blur-xl"></div>
        <h3 class="text-xs font-bold text-purple-400 uppercase tracking-widest mb-4">Il Tuo Equilibrio</h3>
        <div class="space-y-4">
          @if (data.focus_brand_exposure?.overexposed && data.focus_brand_exposure.overexposed.length > 0) {
            <div class="flex items-start gap-3">
               <span class="shrink-0 text-[10px] font-bold text-amber-300 bg-amber-900/50 border border-amber-500/30 px-2 py-1 rounded uppercase">Eccesso</span>
               <span class="text-sm text-slate-300 font-medium">
                  {{ data.focus_brand_exposure.overexposed[0].theme }}
               </span>
            </div>
          }
          @if (data.focus_brand_exposure?.underexposed && data.focus_brand_exposure.underexposed.length > 0) {
            <div class="flex items-start gap-3">
               <span class="shrink-0 text-[10px] font-bold text-red-300 bg-red-900/50 border border-red-500/30 px-2 py-1 rounded uppercase">Vuoto</span>
               <span class="text-sm text-slate-300 font-medium">
                  {{ data.focus_brand_exposure.underexposed[0].theme }}
               </span>
            </div>
          }
        </div>
      </div>
    </div>

    <!-- Visual Graph (Radar Galattico) -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden mb-8 p-8 relative">
       <!-- Grid Background -->
       <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
       
       <div class="relative z-10">
         <div class="flex justify-between items-center mb-6">
            <h3 class="font-bold text-teal-400 text-lg tracking-wide flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" /></svg>
              Radar Galattico (Volume Articoli)
            </h3>
         </div>

         <div class="space-y-6">
            @for (brand of chartData(); track brand.name) {
               <div>
                 <div class="flex justify-between text-sm mb-2 font-bold uppercase tracking-wider">
                    <span [class.text-teal-400]="brand.isFocus" [class.text-slate-400]="!brand.isFocus">{{ brand.name }}</span>
                    <span class="text-slate-500">{{ brand.pct }}% ({{ brand.count }})</span>
                 </div>
                 <div class="h-4 bg-slate-900 rounded-full overflow-hidden border border-slate-700 relative">
                    <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite] z-20"></div>
                    
                    <div 
                      class="h-full rounded-full transition-all duration-1000 ease-out relative z-10"
                      [style.width.%]="brand.pct"
                      [class.bg-teal-500]="brand.isFocus"
                      [class.bg-red-500]="!brand.isFocus && brand.index === 0"
                      [class.bg-amber-500]="!brand.isFocus && brand.index === 1"
                      [class.bg-blue-500]="!brand.isFocus && brand.index > 1"
                      [class.shadow-[0_0_10px_rgba(45,212,191,0.6)]]="brand.isFocus"
                    ></div>
                 </div>
               </div>
            }
         </div>
       </div>
    </div>

    <!-- Insights List -->
    <div class="bg-teal-900/10 rounded-xl p-8 border border-teal-500/20 shadow-[0_0_15px_rgba(20,184,166,0.1)] mb-8">
      <h3 class="flex items-center gap-2 text-teal-400 font-bold mb-6 text-lg tracking-wide">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        Saggezza degli Holocron (Executive Summary)
      </h3>
      <ul class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (insight of data.key_insights; track $index) {
          <li class="flex items-start gap-3 text-slate-300 text-sm bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-700 hover:border-teal-500/40 transition">
            <span class="mt-1.5 h-2 w-2 rounded-full bg-teal-500 shadow-[0_0_5px_rgba(20,184,166,0.8)] shrink-0"></span>
            <span class="italic whitespace-normal">"{{ insight }}"</span>
          </li>
        }
        @if (!data.key_insights || data.key_insights.length === 0) {
           <li class="text-slate-500 italic">La nebbia copre il futuro... (Nessun insight generato)</li>
        }
      </ul>
    </div>

    <!-- Theme Share Table -->
    <div class="bg-slate-800 rounded-xl border border-slate-700 shadow-xl overflow-hidden mb-8">
      <div class="px-8 py-6 border-b border-slate-700 bg-slate-800/50 flex justify-between items-center">
        <h3 class="font-bold text-teal-400 text-lg tracking-wide">Dominio dei Temi (Share of Voice)</h3>
        <div class="text-xs text-slate-500">Dati dal Consiglio</div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left">
          <thead class="text-xs text-slate-400 uppercase bg-slate-900/50 border-b border-slate-700">
            <tr>
              <th class="px-8 py-4 font-semibold tracking-wider">Tema</th>
              <th class="px-6 py-4 font-semibold text-right tracking-wider text-slate-500">Volume</th>
              @for (brand of meta.brands; track brand) {
                <th class="px-6 py-4 font-semibold text-right tracking-wider" [class.text-teal-400]="brand === meta.focus_brand">{{ brand }}</th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700">
            @for (row of data.theme_share_table; track row.theme) {
              <tr class="hover:bg-slate-700/50 transition duration-150">
                <td class="px-8 py-4 font-medium text-slate-200">{{ row.theme }}</td>
                <td class="px-6 py-4 text-right text-slate-500">{{ row.totals.all_brands_count }}</td>
                @for (brand of meta.brands; track brand) {
                  <td class="px-6 py-4 text-right">
                    <div class="flex flex-col items-end">
                      <div class="flex items-center gap-2">
                        <span class="font-bold text-base" [class.text-teal-400]="brand === meta.focus_brand" [class.text-slate-400]="brand !== meta.focus_brand">
                            {{ row.by_brand[brand]?.pct || 0 }}%
                        </span>
                      </div>
                      <div class="w-16 h-1 bg-slate-700 rounded-full overflow-hidden mt-1">
                         <div class="h-full shadow-[0_0_8px_rgba(45,212,191,0.5)]" 
                              [class.bg-teal-500]="brand === meta.focus_brand"
                              [class.bg-slate-500]="brand !== meta.focus_brand"
                              [style.width.%]="row.by_brand[brand]?.pct || 0"></div>
                      </div>
                    </div>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `
})
export class TabOverviewComponent {
  @Input({ required: true }) data!: AnalysisResult['tab1_overview'];
  @Input({ required: true }) meta!: AnalysisResult['meta'];

  chartData = computed(() => {
    if (!this.meta?.article_counts) return [];
    
    const total = Object.values(this.meta.article_counts).reduce((a, b) => a + b, 0);
    return Object.keys(this.meta.article_counts).map((brand, i) => ({
      name: brand,
      count: this.meta.article_counts[brand],
      pct: total > 0 ? Math.round((this.meta.article_counts[brand] / total) * 100) : 0,
      isFocus: brand === this.meta.focus_brand,
      index: i
    })).sort((a, b) => b.pct - a.pct);
  });
}