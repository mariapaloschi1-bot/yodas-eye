import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../types';

@Component({
  selector: 'app-tab-depth',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="space-y-8 pb-12">
      
      <div class="bg-slate-800/80 rounded-xl border border-slate-700 p-6 shadow-lg">
        <h3 class="flex items-center gap-2 text-teal-400 font-bold mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" /></svg>
          Saggezza sulla Profondità (Depth Insights)
        </h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          @for (insight of data.key_insights; track $index) {
            <div class="bg-slate-900/50 p-4 rounded-lg border border-slate-700/50 shadow-sm flex gap-3">
               <span class="text-purple-500 font-bold text-lg">✦</span>
               <p class="text-sm text-slate-300 italic">"{{ insight }}"</p>
            </div>
          }
          @if (!data.key_insights || data.key_insights.length === 0) {
             <p class="text-slate-500 italic">Nessun insight sulla profondità dei contenuti.</p>
          }
        </div>
      </div>

      <section>
        <div class="flex items-center gap-3 mb-6">
            <span class="bg-purple-900/50 text-purple-400 p-2 rounded-lg shadow-md border border-purple-500/30">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
            </span>
            <h3 class="text-2xl font-bold text-white tracking-wide">Pilastri del Sapere (Pillar Content)</h3>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          @for (brand of getBrands(); track brand) {
            <div class="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden hover:border-purple-500/50 transition duration-300 shadow-lg">
              <div class="bg-slate-900/50 px-6 py-4 border-b border-slate-700">
                <h4 class="text-lg font-bold text-white flex items-center gap-2">
                  <span class="text-purple-400">●</span>
                  {{ brand }}
                </h4>
              </div>
              
              <div class="p-6">
                @if (data.pillar_candidates[brand] && data.pillar_candidates[brand].length > 0) {
                  <ul class="space-y-4">
                    @for (pillar of data.pillar_candidates[brand]; track pillar.url) {
                      <li class="group">
                        <a [href]="pillar.url" target="_blank" class="block">
                          <div class="text-sm font-bold text-purple-400 group-hover:text-purple-300 group-hover:underline mb-2 leading-tight" [title]="pillar.title">
                            {{ pillar.title }}
                          </div>
                          <p class="text-xs text-slate-400 italic leading-relaxed">
                            {{ pillar.reason }}
                          </p>
                        </a>
                      </li>
                    }
                  </ul>
                } @else {
                  <p class="text-sm text-slate-500 italic">Nessun pillar content identificato per questo brand.</p>
                }
              </div>
            </div>
          }
        </div>
      </section>

    </div>
  `
})
export class TabDepthComponent {
  @Input({ required: true }) data!: AnalysisResult['tab4_depth_and_format'];

  getBrands(): string[] {
    return Object.keys(this.data.pillar_candidates || {});
  }
}
