import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { AnalysisResult, BrandInput } from '../types';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {

  async analyzeContent(
    apiKey: string,
    focusBrand: string,
    brands: BrandInput[]
  ): Promise<AnalysisResult> {
    
    // 1) Validazione API Key
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('❌ API Key mancante. Inserisci la tua Gemini API Key nel form.');
    }

    // 2) Init GoogleGenAI (BYOK: l'API key viene dal browser, salvata in LocalStorage)
    const ai = new GoogleGenAI({ apiKey });

    // 3) Prepara i dati di input (LIMITE 400 ARTICOLI per brand)
    const fullBrands = brands.map(b => ({
      name: b.name,
      count: b.articles.length,
      articles: b.articles.slice(0, 400).map(a => ({
        title: a.title,
        url: a.url
      }))
    }));

    const brandsJson = JSON.stringify(fullBrands, null, 2);

    // 4) System Prompt (UNA SOLA CHIAMATA, come versione OLD funzionante)
    const systemPrompt = `
Sei YODA, maestro Jedi della SEO, esperto di analisi editoriale competitiva.

📊 TASK: Analizza gli archivi editoriali di ${focusBrand} (Padawan Brand) e dei competitor per:
1) Clustering dei temi (MAX 10 TEMI)
2) Share of Voice per tema
3) Gap Analysis (MAX 2 GAPS strategici)
4) Opportunità di Ranking (MAX 4 OPPORTUNITÀ)
5) Pillar Content (esattamente 2 articoli per brand con URL completo)

📥 INPUT DATI:
- Padawan Brand (Focus): ${focusBrand}
- Archivi del Tempio (Brands e Articoli):
${brandsJson}

📤 OUTPUT: DEVI restituire SOLO un JSON valido (nessun altro testo) seguendo ESATTAMENTE questo schema:

{
  "meta": {
    "language": "it-yoda",
    "focus_brand": "${focusBrand}",
    "brands": ["${focusBrand}", "Competitor1"],
    "article_counts": {
      "${focusBrand}": 400,
      "Competitor1": 400
    },
    "second_dimension_used": "intent"
  },
  "tab1_overview": {
    "theme_share_table": [
      {
        "theme": "Tema 1",
        "totals": { "all_brands_count": 150 },
        "by_brand": {
          "${focusBrand}": { "count": 50, "pct": 50 },
          "Competitor1": { "count": 50, "pct": 50 }
        }
      }
    ],
    "leaders": {
      "breadth_leader": { "brand": "Brand1", "why": "Motivo strategico conciso" },
      "specialist": { "brand": "Brand2", "why": "Motivo strategico conciso" }
    },
    "focus_brand_exposure": {
      "overexposed": [
        { "theme": "Tema X", "focus_pct": 45, "competitor_avg_pct": 20, "note": "Perché overexposed" }
      ],
      "underexposed": [
        { "theme": "Tema Y", "focus_pct": 5, "competitor_avg_pct": 30, "note": "Perché underexposed" }
      ]
    },
    "key_insights": [
      "Insight 1: analisi approfondita strategica con circa 250 parole che spiega tendenze editoriali, posizionamento competitivo, distribuzione tematica e implicazioni SEO. L'analisi deve essere comprensibile, professionale e priva di metafore Yoda, scritta in italiano standard con focus su dati concreti e raccomandazioni strategiche basate sui cluster tematici identificati e sulla distribuzione della share of voice tra i brand analizzati. Include dettagli sulle aree di forza e debolezza del focus brand rispetto ai competitor, evidenziando opportunità di espansione editoriale e rischi di sovra-saturazione tematica.",
      "Insight 2: seconda analisi strategica dettagliata di circa 250 parole focalizzata su aspetti complementari come formati editoriali, intent coverage, e gap strutturali. Mantiene tono professionale e linguaggio chiaro senza riferimenti Star Wars.",
      "Insight 3: terza analisi strategica dettagliata di circa 250 parole che sintetizza le principali raccomandazioni operative derivanti dall'analisi competitiva, con focus su priorità di azione e metriche chiave da monitorare."
    ]
  },
  "tab2_theme_clustering": {
    "themes": [
      {
        "theme": "Tema 1",
        "by_brand": {
          "${focusBrand}": { "count": 50, "pct": 33.3 },
          "Competitor1": { "count": 60, "pct": 40.0 }
        },
        "drilldown_articles": {
          "${focusBrand}": [
            { "title": "Esempio articolo Focus Brand 1", "format": "guida", "intent": "informational" },
            { "title": "Esempio articolo Focus Brand 2", "format": "tutorial", "intent": "informational" }
          ],
          "Competitor1": [
            { "title": "Esempio articolo Competitor 1", "format": "listicle", "intent": "commercial" },
            { "title": "Esempio articolo Competitor 2", "format": "how-to", "intent": "informational" }
          ]
        }
      }
    ],
    "key_insights": [
      "Insight cluster 1: analisi dettagliata di circa 250 parole sulla distribuzione tematica, evidenziando pattern editoriali distintivi, aree di specializzazione per brand, e opportunità di differenziazione. Include valutazione della copertura per intent e formato, con raccomandazioni specifiche per bilanciare il portfolio editoriale del focus brand.",
      "Insight cluster 2: seconda analisi di circa 250 parole sui cluster tematici emergenti e sul posizionamento relativo del focus brand, con focus su gap di coverage e strategie di espansione.",
      "Insight cluster 3: terza analisi di circa 250 parole che sintetizza le implicazioni SEO dei cluster identificati e propone priorità editoriali basate sui dati."
    ]
  },
  "tab3_dual_clustering": null,
  "tab4_depth_and_format": {
    "depth_metrics": {
      "note": "Analisi approfondita della qualità e profondità editoriale rilevata negli archivi, con focus su formati distintivi e copertura degli intent di ricerca."
    },
    "pillar_candidates": {
      "${focusBrand}": [
        { "url": "https://example.com/pillar1", "title": "Titolo Pillar 1", "reason": "Motivo strategico per cui questo contenuto può diventare pillar (copertura ampia tema X, alta profondità, forte potenziale link interno)" },
        { "url": "https://example.com/pillar2", "title": "Titolo Pillar 2", "reason": "Motivo strategico per cui questo contenuto può diventare pillar (hub tematico su Y, formato long-form, alta autorevolezza)" }
      ],
      "Competitor1": [
        { "url": "https://competitor1.com/pillar1", "title": "Pillar Competitor 1", "reason": "Analisi del perché questo pillar competitor è efficace e cosa possiamo imparare dalla sua struttura" },
        { "url": "https://competitor1.com/pillar2", "title": "Pillar Competitor 2", "reason": "Secondo pillar competitor: punti di forza e opportunità di emulazione strategica" }
      ]
    },
    "key_insights": [
      "Insight pillar 1: analisi dettagliata di circa 250 parole sui contenuti pillar identificati, valutando struttura, profondità, linking strategy e potenziale di posizionamento. Include confronto tra pillar del focus brand e dei competitor, evidenziando best practice da adottare.",
      "Insight pillar 2: seconda analisi di circa 250 parole focalizzata su formati editoriali, distribuzione intent e strategie di content depth osservate nei pillar competitor.",
      "Insight pillar 3: terza analisi di circa 250 parole con raccomandazioni operative per sviluppare o ottimizzare pillar content del focus brand basate sui benchmark competitivi."
    ]
  },
  "tab5_gap_analysis": {
    "theme_gaps": [
      {
        "theme": "Tema Gap 1",
        "competitor_avg_pct": 35.5,
        "focus_pct": 10.2,
        "gap_type": "underexposed",
        "priority": "alta",
        "rationale": "Rationale strategico del gap (perché questo gap è critico per il focus brand)",
        "what_to_emulate": [
          "Best practice 1 osservata nei competitor",
          "Best practice 2 da adottare",
          "Strategia 3 efficace nei competitor"
        ],
        "what_to_avoid": [
          "Errore 1 osservato nei competitor da evitare",
          "Pattern 2 inefficace rilevato",
          "Approccio 3 da non replicare"
        ]
      },
      {
        "theme": "Tema Gap 2",
        "competitor_avg_pct": 20.3,
        "focus_pct": 45.8,
        "gap_type": "overexposed",
        "priority": "media",
        "rationale": "Rationale strategico del secondo gap",
        "what_to_emulate": [
          "Best practice competitor 1",
          "Strategia competitor 2"
        ],
        "what_to_avoid": [
          "Errore competitor 1",
          "Pattern inefficace competitor 2"
        ]
      }
    ],
    "prioritized_opportunities": [
      {
        "rank": 1,
        "opportunity": "Opportunità Strategica #1",
        "type": "content-gap",
        "why_it_matters": "Motivazione strategica dettagliata (perché questa opportunità è prioritaria, impatto SEO atteso, vantaggio competitivo potenziale)",
        "suggested_angles": [
          "Angolo di attacco 1 suggerito",
          "Angolo di attacco 2 suggerito",
          "Angolo di attacco 3 suggerito"
        ],
        "proof_points": [
          { "brand": "Competitor1", "title": "Esempio articolo competitor 1 che dimostra l'opportunità" }
        ]
      },
      {
        "rank": 2,
        "opportunity": "Opportunità Strategica #2",
        "type": "format-gap",
        "why_it_matters": "Motivazione strategica per la seconda opportunità",
        "suggested_angles": [
          "Angolo di attacco 1",
          "Angolo di attacco 2"
        ],
        "proof_points": [
          { "brand": "Competitor1", "title": "Proof point competitor 1" }
        ]
      },
      {
        "rank": 3,
        "opportunity": "Opportunità Strategica #3",
        "type": "intent-gap",
        "why_it_matters": "Motivazione strategica per la terza opportunità",
        "suggested_angles": [
          "Angolo di attacco 1",
          "Angolo di attacco 2"
        ],
        "proof_points": [
          { "brand": "Competitor1", "title": "Proof point competitor 1" }
        ]
      },
      {
        "rank": 4,
        "opportunity": "Opportunità Strategica #4",
        "type": "depth-gap",
        "why_it_matters": "Motivazione strategica per la quarta opportunità",
        "suggested_angles": [
          "Angolo di attacco 1",
          "Angolo di attacco 2"
        ],
        "proof_points": [
          { "brand": "Competitor1", "title": "Proof point competitor 1" }
        ]
      }
    ],
    "key_insights": [
      "Insight gap 1: analisi dettagliata di circa 250 parole sui gap strategici identificati, valutando priorità competitive, rischi di sotto-copertura tematica e opportunità di espansione. Include raccomandazioni specifiche basate sui pattern osservati nei competitor.",
      "Insight gap 2: seconda analisi di circa 250 parole focalizzata sulle opportunità prioritarie, con valutazione del potenziale impatto SEO e delle risorse necessarie per colmare i gap.",
      "Insight gap 3: terza analisi di circa 250 parole con roadmap strategica per implementare le opportunità identificate, includendo quick wins e progetti a lungo termine."
    ]
  }
}

🔍 REQUISITI CRITICI:
1) MAX 10 TEMI (theme clustering)
2) MAX 2 ARTICOLI drilldown per tema per brand (tab2)
3) IMPORTANTE: in drilldown_articles includi ANCHE articoli del FOCUS BRAND (${focusBrand}) - esattamente 2 articoli esempio
4) MAX 2 GAPS (theme_gaps in tab5)
5) MAX 4 OPPORTUNITÀ (prioritized_opportunities in tab5, rank 1-4)
6) Pillar candidates: esattamente 2 per brand con URL completo
7) key_insights: circa 250 parole ciascuno, stile professionale (NON Yoda), comprensibile e strategico
8) tab3_dual_clustering deve essere null (non implementato)
9) URL presenti SOLO nei pillar_candidates; drilldown_articles NON hanno URL
10) proof_points nei gap NON hanno URL (solo brand e title)
11) ANALISI 2 BRAND: Focus + 1 Competitor (NON 3)

📝 NOTA IMPORTANTE:
- drilldown_articles: includi articoli di TUTTI i brand (focus + competitor)
- Pillar candidates: esattamente 2 per brand con URL completo
- Gap theme_gaps: MAX 2 gaps
- Opportunità: MAX 4, ordinate per rank (1, 2, 3, 4)
- Insights: lunghi e comprensibili (≈250 parole), NO stile Yoda
- Limite articoli: 400 per brand (non 500)
- Numero brand: 2 (Focus + 1 Competitor)

🚀 Genera ora l'analisi completa in formato JSON.
`;

    // 5) Chiamata a Gemini (UNA SOLA CHIAMATA, come versione OLD)
    console.log('🔮 Inizio analisi con Gemini 2.5 Flash (LIMITE 400 ARTICOLI, 2 BRAND)...');
    
    const model = ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: systemPrompt,
      config: {
        responseMimeType: 'application/json'
      }
    });

    const response = await model;
    const text = response.text;

    if (!text || text.trim() === '') {
      throw new Error('❌ Risposta vuota dal Consiglio Jedi (Gemini API)');
    }

    // 6) Parse JSON
    console.log('📦 Risposta ricevuta da Gemini, parsing JSON...');
    let result: AnalysisResult;
    
    try {
      result = JSON.parse(text);
      console.log('✅ Analisi completata con successo!');
      return result;
    } catch (parseError: any) {
      console.error('❌ Errore parsing JSON:', parseError);
      
      // 7) Gestione errori specifici
      if (text.toLowerCase().includes('too many') || text.toLowerCase().includes('troppi')) {
        throw new Error('⚠️ Troppi dati generati o formato invalido. Riprova con meno articoli (LIMITE 400 per brand).');
      }
      
      if (text.toLowerCase().includes('not found') || text.includes('404')) {
        throw new Error('❌ Modello Gemini non disponibile. Verifica la tua API Key.');
      }
      
      throw new Error(`❌ Errore Gemini API: ${parseError.message}`);
    }
  }
}
