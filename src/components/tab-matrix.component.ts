import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult, MatrixRow } from '../types';

@Component({
  selector: 'app-tab-matrix',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- 3 Box Insights (Saggezza Tattica) - SOPRA LA TABELLA -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
       @for (insight of data.key_insights; track $index) {
         <div class="bg-slate-800/80 p-6 rounded-xl border border-slate-700 border-t-4 shadow-lg"
              [class.border-t-teal-500]="$index === 0"
              [class.border-t-amber-500]="$index === 1"
              [class.border-t-purple-500]="$index >= 2">
            <h4 class="text-xs font-bold uppercase tracking-widest mb-3"
                [class.text-teal-400]="$index === 0"
                [class.text-amber-400]="$index === 1"
                [class.text-purple-400]="$index >= 2">
                Saggezza Tattica #{{ $index + 1 }}
            </h4>
            <p class="text-slate-300 text-sm leading-relaxed italic">"{{ insight }}"</p>
         </div>
       }
       @if (!data.key_insights || data.key_insights.length === 0) {
          <div class="col-span-3 text-center text-slate-500 py-4 italic">Nessun insight tattico rilevato in questa griglia.</div>
       }
    </div>

    <!-- Matrix Table (Heatmap Only) -->
    <div class="bg-slate-800 rounded-xl shadow-lg border border-slate-700 overflow-hidden mb-8">
      <div class="px-6 py-4 border-b border-slate-700 bg-slate-800 flex justify-between items-center">
        <h3 class="font-bold text-teal-400 tracking-wide">Matrice della Forza: Tema vs {{ data.dimension_y }}</h3>
        <span class="text-xs text-slate-500 italic">
           Mappa di calore (Dati puri)
        </span>
      </div>
      
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
           <thead class="bg-slate-900/50 text-xs text-slate-400 uppercase">
             <tr>
               <th class="px-4 py-3 text-left w-48">Tema / {{ data.dimension_y }}</th>
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
                                  <div class="flex-1 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                                    <div 
                                      class="h-full rounded-full shadow-[0_0_5px_rgba(255,255,255,0.3)]" 
                                      [class.bg-teal-500]="true" 
                                      [style.width.%]="normalizePct(row.by_brand[brand].count)">
                                    </div>
                                  </div>
                                  <span class="w-4 text-right text-[10px] text-slate-500">{{ row.by_brand[brand].count }}</span>
                               </div>
                             }
                          </div>
                       } @else {
                         <div class="text-center text-slate-600">-</div>
                       }
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
export class TabMatrixComponent {
  @Input({ required: true }) data!: AnalysisResult['tab3_dual_clustering'];
  
  getColumns() {
    const all = new Set<string>();
    this.data.matrix.forEach(g => g.rows.forEach(r => all.add(r.dimension_value)));
    return Array.from(all).sort();
  }

  getRow(rows: MatrixRow[], val: string) {
    return rows.find(r => r.dimension_value === val);
  }

  getBrands(obj: any) {
    return obj ? Object.keys(obj) : [];
  }

  normalizePct(count: number) {
    // Normalizza visivamente la barra (max 10 articoli come riferimento per il 100%)
    return Math.min(100, (count / 10) * 100);
  }
}