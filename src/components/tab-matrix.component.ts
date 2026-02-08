import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import type { AnalysisResult } from '../types';

@Component({
  selector: 'app-tab-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8">
      <!-- Insights -->
      @if (data.key_insights && data.key_insights.length > 0) {
        <section class="bg-gradient-to-br from-purple-900/20 to-teal-900/20 border border-purple-700/50 rounded-xl p-6">
          <h3 class="text-lg font-bold text-purple-400 mb-4 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Saggezza Jedi sulla Matrice
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

    <!-- Matrix Table (Heatmap Only) -->
    <div class="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-8">
      <div class="px-6 py-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
        <h3 class="font-bold text-teal-400 tracking-wide">Matrice della Forza: Tema vs {{ data.second_dimension_used }}</h3>
        <span class="text-xs text-slate-500 italic">
           Mappa di calore (Dati puri)
        </span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
           <thead class="bg-slate-900/50 text-xs text-slate-400 uppercase">
             <tr>
               <th class="px-4 py-3 text-left w-48">Tema / {{ data.second_dimension_used }}</th>
               @for (col of getColumns(); track col) {
                 <th class="px-4 py-3 text-center min-w-[120px]">{{ col }}</th>
               }
             </tr>
           </thead>
           <tbody class="divide-y divide-slate-700">
             @for (group of data.matrix; track group.theme) {
               <tr>
                 <td class="px-4 py-3 font-medium text-slate-200 bg-slate-800">{{ group.theme }}</td>
                 @for (col of getColumns(); track col) {
                    <td class="px-2 py-2 p-0 h-full border-l border-slate-700/50">
                       @if (getRow(group.rows, col); as row) {
                          <div class="h-full w-full flex flex-col gap-1 p-2 rounded hover:bg-slate-700/30 transition">
                             @for (brand of getBrands(row.by_brand); track brand) {
                               <div class="flex items-center gap-2 text-xs">
                                  <span class="font-medium text-slate-400">{{ brand }}:</span>
                                  <span class="font-bold text-teal-400">{{ row.by_brand[brand].count }}</span>
                                  <span class="text-slate-500">({{ row.by_brand[brand].pct }}%)</span>
                               </div>
                             }
                          </div>
                       } @else {
                          <div class="h-full w-full p-2 text-center">
                             <span class="text-slate-600 text-xs">—</span>
                          </div>
                       }
                    </td>
                 }
               </tr>
             }
           </tbody>
        </table>
      </div>
    </div>
    </div>
  `,
})
export class TabMatrixComponent {
  @Input({ required: true }) data!: AnalysisResult['tab3_dual_clustering'];

  getColumns(): string[] {
    const cols = new Set<string>();
    for (const group of this.data.matrix) {
      for (const row of group.rows) {
        cols.add(row.dimension_value);
      }
    }
    return Array.from(cols);
  }

  getRow(rows: any[], dimensionValue: string) {
    return rows.find(r => r.dimension_value === dimensionValue);
  }

  getBrands(byBrand: Record<string, any>): string[] {
    return Object.keys(byBrand);
  }
}
