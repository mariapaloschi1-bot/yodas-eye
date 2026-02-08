import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../types';

@Component({
  selector: 'app-tab-clusters',
  standalone: true,
  imports: [CommonModule],
  template: `
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

    <div class="space-y-6">
      @for (cluster of data.themes; track cluster.theme) {
        <div class="bg-slate-800 rounded-xl border border-slate-700 shadow-md overflow-hidden hover:border-teal-500/30 transition duration-300">
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

          @if (isExpanded(cluster.theme)) {
            <div class="border-t border-slate-700 bg-slate-900/50 p-6">
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                @for (brand of getBrands(cluster); track brand) {
                  <div class="bg-slate-800 rounded-lg border border-slate-700 p-4 shadow-sm">
                     <h4 class="text-xs font-bold text-slate-500 uppercase mb-3 flex justify-between tracking-wider">
                        {{ brand }}
                        <span class="text-slate-600">{{ cluster.drilldown_articles[brand]?.length || 0 }} art.</span>
                     </h4>
                     <ul class="space-y-3">
                        @for (article of cluster.drilldown_articles[brand]; track article.title) {
                          <li class="group">
                             <div class="block">
                               <div class="text-sm font-medium text-slate-300 truncate" [title]="article.title">
                                  {{ article.title }}
                               </div>
                               <div class="flex gap-2 mt-1">
                                  <span class="text-[10px] uppercase tracking-wide bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600">
                                    {{ article.format }}
                                  </span>
                                  <span class="text-[10px] uppercase tracking-wide bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded border border-slate-600">
                                    {{ article.intent }}
                                  </span>
                               </div>
                             </div>
                          </li>
                        }
                        @if (!cluster.drilldown_articles[brand]?.length) {
                          <li class="text-sm text-slate-600 italic">Il vuoto qui regna.</li>
                        }
                     </ul>
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
}
