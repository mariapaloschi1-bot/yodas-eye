import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../types';

@Component({
  selector: 'app-tab-clusters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Insights Box (SOPRA come originale) -->
    <div class="bg-slate-800/80 rounded-xl border border-slate-700 p-6 mb-8 shadow-lg">
      <h3 class="flex items-center gap-2 text-teal-400 font-bold mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
        Saggezza sui Cluster (Jedi Insights)
      </h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        @for (insight of data.key_insights; track $index) {
          <div class="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 shadow-sm flex gap-3">
             <span class="text-teal-500 font-bold text-lg">✦</span>
             <p class="text-sm text-slate-300 italic">"{{ insight }}"</p>
          </div>
        }
        @if (!data.key_insights || data.key_insights.length === 0) {
           <p class="text-slate-500 italic">Nessun insight specifico sui cluster.</p>
        }
      </div>
    </div>

    <!-- Grafico Ciambella + Delta Competitor -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      
      <!-- Grafico Ciambella (Focus Brand) -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 shadow-md p-6">
        <h3 class="flex items-center gap-2 text-teal-400 font-bold mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" /><path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" /></svg>
          Distribuzione Tematica: {{ meta.focus_brand }}
        </h3>
        
        <div class="relative w-64 h-64 mx-auto mb-6">
          <svg viewBox="0 0 100 100" class="transform -rotate-90">
            @let cumulativePct = 0;
            @for (theme of data.themes; track theme.theme; let idx = $index) {
              <circle
                [attr.cx]="50"
                [attr.cy]="50"
                [attr.r]="30"
                fill="none"
                [attr.stroke]="getThemeColor(idx)"
                stroke-width="20"
                [attr.stroke-dasharray]="getCircumference(30) * (theme.focus_brand_pct / 100) + ' ' + getCircumference(30)"
                [attr.stroke-dashoffset]="-getCircumference(30) * (cumulativePct / 100)"
                class="transition-all duration-500"
              />
              @set cumulativePct = cumulativePct + theme.focus_brand_pct;
            }
          </svg>
          
          <div class="absolute inset-0 flex items-center justify-center">
            <div class="text-center">
              <div class="text-3xl font-bold text-teal-400">{{ data.themes.length }}</div>
              <div class="text-xs text-slate-400">Macro-Temi</div>
            </div>
          </div>
        </div>

        <!-- Legenda -->
        <div class="space-y-2">
          @for (theme of data.themes; track theme.theme; let idx = $index) {
            <div class="flex items-center gap-3 p-2 rounded hover:bg-slate-700/50 transition">
              <div class="w-4 h-4 rounded-full shrink-0" [style.background-color]="getThemeColor(idx)"></div>
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-slate-200 text-sm truncate">{{ theme.theme }}</div>
                <div class="text-xs text-slate-400 truncate">{{ theme.description }}</div>
              </div>
              <div class="text-right shrink-0">
                <div class="font-bold text-teal-400 text-lg">{{ theme.focus_brand_pct | number:'1.0-1' }}%</div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Delta Competitor -->
      <div class="bg-slate-800 rounded-xl border border-slate-700 shadow-md p-6">
        <h3 class="flex items-center gap-2 text-red-400 font-bold mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" /><path fill-rule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm9.707 5.707a1 1 0 00-1.414-1.414L9 12.586l-1.293-1.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" /></svg>
          Confronto con i Competitor (Delta %)
        </h3>
        <p class="text-xs text-slate-400 mb-4 italic">
          Delta positivo: competitor ha più copertura. Delta negativo: tu domini.
        </p>

        <div class="space-y-4">
          @for (theme of data.themes; track theme.theme; let themeIdx = $index) {
            <div class="border border-slate-700 rounded-xl overflow-hidden">
              <div class="p-3 flex items-center justify-between" [style.background-color]="getThemeColor(themeIdx) + '20'">
                <div class="flex items-center gap-2">
                  <div class="w-3 h-3 rounded-full" [style.background-color]="getThemeColor(themeIdx)"></div>
                  <span class="font-bold text-slate-200 text-sm">{{ theme.theme }}</span>
                </div>
                <span class="text-xs text-teal-400 font-mono">{{ theme.focus_brand_pct | number:'1.0-1' }}%</span>
              </div>

              <div class="bg-slate-900/50 p-3 space-y-2">
                @for (comp of theme.competitors_delta; track comp.brand) {
                  <div class="flex items-center justify-between text-sm">
                    <span class="text-slate-300">{{ comp.brand }}</span>
                    <div class="flex items-center gap-2">
                      <span class="text-slate-400 font-mono text-xs">{{ comp.pct | number:'1.0-1' }}%</span>
                      <span 
                        class="font-bold font-mono text-sm px-2 py-1 rounded"
                        [class.text-red-400]="comp.delta > 0"
                        [class.bg-red-900/20]="comp.delta > 0"
                        [class.text-green-400]="comp.delta <= 0"
                        [class.bg-green-900/20]="comp.delta <= 0"
                      >
                        {{ comp.delta > 0 ? '+' : '' }}{{ comp.delta | number:'1.0-1' }}%
                      </span>
                    </div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `
})
export class TabClustersComponent {
  @Input({ required: true }) data!: AnalysisResult['tab2_theme_clustering'];
  @Input({ required: true }) meta!: AnalysisResult['meta'];

  private themeColors = [
    '#14B8A6', // Teal
    '#3B82F6', // Blue
    '#8B5CF6', // Purple
    '#F59E0B', // Amber
    '#EF4444', // Red
    '#10B981', // Green
  ];

  getThemeColor(index: number): string {
    return this.themeColors[index % this.themeColors.length];
  }

  getCircumference(radius: number): number {
    return 2 * Math.PI * radius;
  }
}
