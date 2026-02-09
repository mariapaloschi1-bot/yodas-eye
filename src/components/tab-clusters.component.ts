import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../types';

@Component({
  selector: 'app-tab-clusters',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Insights Box (SOPRA la tabella come richiesto) -->
    <div class="bg-slate-800/80 rounded-xl border border-slate-700 p-6 mb-8 shadow-lg">
      <h3 class="flex items-center gap-2 text-teal-400 font-bold mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
        Saggezza sui Cluster (Jedi Insights)
      </h3>
      <div class="space-y-4">
        @for (insight of data.key_insights; track $index) {
          <div class="bg-slate-900/50 p-5 rounded-lg border border-slate-700/50 shadow-sm border-l-4 border-l-amber-500">
             <p class="text-sm text-slate-300 leading-relaxed whitespace-normal">{{ insight }}</p>
          </div>
        }
        @if (!data.key_insights || data.key_insights.length === 0) {
           <p class="text-slate-500 italic">Nessun insight specifico sui cluster.</p>
        }
      </div>
    </div>

    <!-- Cluster List -->
    <div class="space-y-6">
      @for (cluster of data.themes; track cluster.theme) {
        <div class="bg-slate-800 rounded-xl border border-slate-700 shadow-md overflow-hidden hover:border-teal-500/30 transition duration-300">
          <!-- Cluster Header -->
          <div 
            class="px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-slate-700/50 transition select-none"
            (click)="toggle(cluster.theme)"
          >
            <div class="flex items-center gap-4">
              <div class="bg-slate-700 p-2 rounded text-teal-400">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" /></svg>
              </div>
              <h3 class="text-lg font-bold text-slate-200 tracking-wide">{{ cluster.theme }}</h3>
            </div>
            
            <div class="flex items-center gap-6">
              <!-- Mini Bar Chart -->
              <div class="flex gap-1 h-2 w-32 bg-slate-900 rounded-full p-0.5">
                 @for (brand of getBrands(cluster); track brand) {
                   <div 
                    class="h-full rounded-full"
                    [style.width.%]="cluster.by_brand[brand].pct"
                    [class.bg-teal-500]="isFirst(brand)"
                    [class.shadow-[0_0_5px_rgba(20,184,166,0.6)]]="isFirst(brand)"
                    [class.bg-slate-600]="!isFirst(brand)"
                    [title]="brand + ': ' + cluster.by_brand[brand].pct + '%'">
                   </div>
                 }
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" 
                class="h-5 w-5 text-slate-500 transform transition-transform duration-200"
                [class.rotate-180]="isExpanded(cluster.theme)"
                viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
              </svg>
            </div>
          </div>

          <!-- Drilldown: ARTICOLI UNO SOTTO L'ALTRO (no separazione per brand) -->
          @if (isExpanded(cluster.theme)) {
            <div class="border-t border-slate-700 bg-slate-900/50 p-6">
              <!-- Nota: Solo Esempi -->
              <div class="flex items-start gap-2 mb-4 px-4 py-3 bg-amber-500/10 rounded-lg border border-amber-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
                </svg>
                <p class="text-xs text-amber-200/90 leading-relaxed">
                  Gli articoli mostrati sono <strong>solo esempi rappresentativi</strong> del cluster. L'analisi è stata condotta sull'intero archivio.
                </p>
              </div>
              
              <div class="space-y-3">
                @for (brand of getBrands(cluster); track brand) {
                  @for (article of cluster.drilldown_articles[brand]; track article.title) {
                    <div class="bg-slate-800/80 rounded-lg border border-slate-700/50 p-4 hover:border-teal-500/30 transition group">
                      <!-- Brand Label (piccolo badge) -->
                      <div class="flex items-start justify-between gap-3 mb-2">
                        <span class="text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full"
                              [class.bg-teal-500/20]="isFirst(brand)"
                              [class.text-teal-400]="isFirst(brand)"
                              [class.border-teal-500/30]="isFirst(brand)"
                              [class.bg-slate-700/50]="!isFirst(brand)"
                              [class.text-slate-400]="!isFirst(brand)"
                              [class.border-slate-600]="!isFirst(brand)"
                              class="border">
                          {{ brand }}
                        </span>
                      </div>
                      
                      <!-- Titolo articolo -->
                      <div class="text-sm font-medium text-slate-200 mb-2 leading-snug group-hover:text-teal-300 transition" [title]="article.title">
                        {{ article.title }}
                      </div>
                      
                      <!-- Format + Intent -->
                      <div class="flex gap-2">
                        <span class="text-[10px] uppercase tracking-wide bg-slate-700/70 text-slate-300 px-2 py-1 rounded border border-slate-600/50">
                          {{ article.format }}
                        </span>
                        <span class="text-[10px] uppercase tracking-wide bg-slate-700/70 text-slate-300 px-2 py-1 rounded border border-slate-600/50">
                          {{ article.intent }}
                        </span>
                      </div>
                    </div>
                  }
                }
                
                <!-- Messaggio vuoto SOLO se nessun brand ha articoli -->
                @if (getTotalArticles(cluster) === 0) {
                  <div class="text-center text-slate-600 italic py-6 bg-slate-900/30 rounded-lg border border-slate-700/50">
                    Il vuoto qui regna.
                  </div>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `
})
export class TabClustersComponent {
  @Input({ required: true }) data!: AnalysisResult['tab2_theme_clustering'];
  
  expanded = signal<Set<string>>(new Set());

  toggle(theme: string) {
    this.expanded.update(set => {
      const newSet = new Set(set);
      if (newSet.has(theme)) newSet.delete(theme);
      else newSet.add(theme);
      return newSet;
    });
  }

  isExpanded(theme: string) {
    return this.expanded().has(theme);
  }

  getBrands(cluster: any) {
    return Object.keys(cluster.by_brand);
  }

  isFirst(brand: string) {
    const brands = this.getBrands(this.data.themes[0]);
    return brands[0] === brand;
  }

  // Helper per contare TOTALE articoli nel cluster
  getTotalArticles(cluster: any): number {
    let total = 0;
    for (const brand of this.getBrands(cluster)) {
      total += cluster.drilldown_articles[brand]?.length || 0;
    }
    return total;
  }
}
