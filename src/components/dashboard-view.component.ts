import { Component, Input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AnalysisResult } from '../types';
import { TabOverviewComponent } from './tab-overview.component';
import { TabClustersComponent } from './tab-clusters.component';
import { TabDepthComponent } from './tab-depth.component';
import { TabGapComponent } from './tab-gap.component';

@Component({
  selector: 'app-dashboard-view',
  standalone: true,
  host: {
    class: 'block h-full'
  },
  imports: [
    CommonModule,
    TabOverviewComponent,
    TabClustersComponent,
    TabDepthComponent,
    TabGapComponent
  ],
  template: `
    <div class="h-full flex flex-col bg-slate-900 text-slate-200 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]">
      <!-- Header -->
      <header class="bg-slate-800 border-b border-teal-900/50 px-4 py-2 md:px-6 md:py-3 flex flex-col md:flex-row items-center justify-between shrink-0 z-20 shadow-[0_4px_20px_rgba(0,0,0,0.5)] gap-3">
        <div class="flex flex-col md:flex-row items-center gap-3 text-center md:text-left">
          <div class="w-10 h-10 md:w-12 md:h-12 rounded-full border border-teal-500/50 overflow-hidden shadow-[0_0_10px_rgba(45,212,191,0.3)] shrink-0">
             <!-- RIPRISTINATA IMMAGINE FUNZIONANTE -->
             <img src="https://www.shutterstock.com/image-vector/baby-yoda-grogu-cartoon-character-260nw-2293123629.jpg" class="w-full h-full object-cover">
          </div>
          
          <div>
            <h1 class="text-lg md:text-xl font-bold text-teal-400 font-mono tracking-wider leading-tight">
              YODA'S <span class="text-white">EYE</span>
            </h1>
            <p class="text-[10px] md:text-xs text-slate-400 font-medium uppercase tracking-wide opacity-80">
              Analisi Competitiva Editoriale
            </p>
          </div>
        </div>

        <div class="flex flex-wrap justify-center gap-2 text-xs md:text-sm">
           <div class="px-2 py-1 md:px-3 md:py-1.5 bg-slate-900 rounded-lg text-slate-400 border border-slate-700 flex items-center gap-2">
             <span class="text-[10px] uppercase font-bold text-slate-500">Focus:</span>
             <span class="font-bold text-teal-400">{{ data.meta.focus_brand }}</span>
           </div>
           <div class="px-2 py-1 md:px-3 md:py-1.5 bg-slate-900 rounded-lg text-slate-400 border border-slate-700 flex items-center gap-2">
             <span class="text-[10px] uppercase font-bold text-slate-500">Holocron:</span>
             <span class="font-bold text-teal-400">{{ getTotalArticles() }}</span>
           </div>
        </div>
      </header>

      <!-- Tabs Navigation -->
      <div class="bg-slate-800 border-b border-teal-900/30 px-4 md:px-6 flex gap-4 md:gap-8 shrink-0 overflow-x-auto no-scrollbar">
        @for (tab of tabs; track tab.id) {
          <button 
            (click)="activeTab.set(tab.id)"
            class="py-2.5 md:py-3 text-xs md:text-sm font-bold border-b-[3px] transition-all whitespace-nowrap px-2 tracking-wide uppercase"
            [class.border-teal-400]="activeTab() === tab.id"
            [class.text-teal-400]="activeTab() === tab.id"
            [class.drop-shadow-[0_0_5px_rgba(45,212,191,0.5)]]="activeTab() === tab.id"
            [class.border-transparent]="activeTab() !== tab.id"
            [class.text-slate-500]="activeTab() !== tab.id"
            [class.hover:text-slate-300]="activeTab() !== tab.id"
          >
            {{ tab.label }}
          </button>
        }
      </div>

      <!-- Tab Content Area -->
      <main class="flex-1 overflow-auto p-4 md:p-6 custom-scrollbar relative">
        <div class="max-w-[1600px] mx-auto pb-12">
          @switch (activeTab()) {
            @case ('overview') {
              @if (data.tab1_overview && data.meta) {
                <app-tab-overview [data]="data.tab1_overview" [meta]="data.meta" />
              } @else {
                <div class="text-center text-slate-500 py-10">Dati panoramici non disponibili.</div>
              }
            }
            @case ('clusters') {
              @if (data.tab2_theme_clustering) {
                <app-tab-clusters [data]="data.tab2_theme_clustering" />
              } @else {
                <div class="text-center text-slate-500 py-10">Dati cluster non disponibili.</div>
              }
            }
            @case ('depth') {
              @if (data.tab4_depth_and_format) {
                <app-tab-depth [data]="data.tab4_depth_and_format" />
              } @else {
                <div class="text-center text-slate-500 py-10">Dati pillar non disponibili.</div>
              }
            }
            @case ('gaps') {
              @if (data.tab5_gap_analysis) {
                <app-tab-gap [data]="data.tab5_gap_analysis" />
              } @else {
                <div class="text-center text-slate-500 py-10">Analisi gap non disponibile.</div>
              }
            }
          }
        </div>
      </main>

      <footer class="bg-slate-900/80 border-t border-slate-800 py-4 text-center text-slate-500 text-xs font-medium">
         Fatto con ❤️ per la SEO da Maria Paloschi • v1.0.1 Stable
      </footer>
    </div>
  `
})
export class DashboardViewComponent {
  @Input({ required: true }) data!: AnalysisResult;
  
  activeTab = signal('overview');

  tabs = [
    { id: 'overview', label: 'Visione Galattica' },
    { id: 'clusters', label: 'Clusters' },
    { id: 'depth', label: 'Pillar Content' },
    { id: 'gaps', label: 'Mappa Opportunità' },
  ];

  getTotalArticles() {
    if (!this.data.meta?.article_counts) return 0;
    return Object.values(this.data.meta.article_counts).reduce((a, b) => a + b, 0);
  }
}
