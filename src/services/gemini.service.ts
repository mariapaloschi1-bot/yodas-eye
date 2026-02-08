import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, Schema, GenerateContentResponse } from '@google/genai';
import { AnalysisResult, BrandInput } from '../types';
import { retryWithBackoff, parseJsonSafely } from './api-utils';

// ⚠️ Rimozione della dipendenza da process.env per BYOK (Bring Your Own Key)

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  
  async analyzeContent(apiKey: string, focusBrand: string, brands: BrandInput[]): Promise<AnalysisResult> {
    // 🔑 BYOK: La chiave arriva dal browser dell'utente (salvata in LocalStorage)
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API Key mancante. Inserisci la tua Gemini API Key nel form.');
    }
    
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // 1. INPUT LIMITATO A 400 - SOLO TITOLI (no URL per analisi)
    const fullBrands = brands.map(b => ({
      name: b.name,
      count: b.articles.length,
      articles: b.articles.slice(0, 400).map(a => ({ title: a.title }))
    }));
    const brandsJson = JSON.stringify(fullBrands);

    // ==========================================================================================
    // FASE 1: STRATEGIA & GAPS (Overview) - COMPACT MODE
    // ==========================================================================================
    
    const schemaPhase1: Schema = {
      type: Type.OBJECT,
      properties: {
        meta: {
            type: Type.OBJECT,
            properties: {
              focus_brand: { type: Type.STRING },
              article_counts_list: { 
                type: Type.ARRAY, 
                items: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, count: { type: Type.NUMBER } } } 
              }
            }
        },
        tab1_overview: {
          type: Type.OBJECT,
          properties: {
            theme_share_table: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING },
                  totals: { type: Type.OBJECT, properties: { all_brands_count: { type: Type.NUMBER } } },
                  by_brand_list: { 
                    type: Type.ARRAY, 
                    items: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, count: { type: Type.NUMBER }, pct: { type: Type.NUMBER } } } 
                  }
                }
              }
            },
            leaders: {
              type: Type.OBJECT,
              properties: {
                breadth_leader: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, why: { type: Type.STRING } }, nullable: true },
                specialist: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, why: { type: Type.STRING } }, nullable: true }
              }
            },
            focus_brand_exposure: {
              type: Type.OBJECT,
              properties: {
                overexposed: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { theme: { type: Type.STRING }, focus_pct: { type: Type.NUMBER }, competitor_avg_pct: { type: Type.NUMBER }, note: { type: Type.STRING } } } },
                underexposed: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { theme: { type: Type.STRING }, focus_pct: { type: Type.NUMBER }, competitor_avg_pct: { type: Type.NUMBER }, note: { type: Type.STRING } } } }
              }
            },
            key_insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        },
        tab5_gap_analysis: {
          type: Type.OBJECT,
          properties: {
            theme_gaps: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING },
                  competitor_avg_pct: { type: Type.NUMBER },
                  focus_pct: { type: Type.NUMBER },
                  gap_type: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  rationale: { type: Type.STRING },
                  what_to_emulate: { type: Type.ARRAY, items: { type: Type.STRING } },
                  what_to_avoid: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            prioritized_opportunities: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  rank: { type: Type.NUMBER },
                  opportunity: { type: Type.STRING },
                  type: { type: Type.STRING },
                  why_it_matters: { type: Type.STRING },
                  suggested_angles: { type: Type.ARRAY, items: { type: Type.STRING } },
                  proof_points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, title: { type: Type.STRING } } } }
                }
              }
            },
            key_insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    };

    const promptPhase1 = `
      Sei Yoda's Eye. Focus Brand: ${focusBrand}. Input: ${brandsJson}

      TASK: OVERVIEW & GAPS (Fase 1)
      
      REGOLE JEDI (Output Compatto):
      1. **JSON COMPATTO**: Rimuovi spazi extra. Testi brevi (max 200 char).
      2. **Themes**: Identifica MAX 8 MACRO-TEMI principali.
      3. **Gaps**: Identifica MAX 2 GAPS principali strategici.
      4. **Opportunità**: MAX 2 opportunità.
      5. **Insights**: MAX 3 insights brevi.
    `;

    console.log("FASE 1: Overview & Gaps...");
    const res1 = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptPhase1,
      config: { responseMimeType: 'application/json', responseSchema: schemaPhase1, temperature: 0.1, maxOutputTokens: 8192 }
    }));
    const data1 = parseJsonSafely<any>(res1.text || '{}');
    
    // Temi per fasi successive
    const themesList = data1.tab1_overview?.theme_share_table?.map((t: any) => t.theme).join(", ") || "";

    await new Promise(r => setTimeout(r, 1500));

    // ==========================================================================================
    // FASE 2: CLUSTERING - NO URL nell'output
    // ==========================================================================================

    const schemaPhase2: Schema = {
      type: Type.OBJECT,
      properties: {
        tab2_theme_clustering: {
          type: Type.OBJECT,
          properties: {
            themes: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING },
                  by_brand_list: { 
                    type: Type.ARRAY, 
                    items: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, count: { type: Type.NUMBER }, pct: { type: Type.NUMBER } } } 
                  },
                  drilldown_list: {
                    type: Type.ARRAY,
                    items: {
                       type: Type.OBJECT,
                       properties: {
                         brand: { type: Type.STRING },
                         articles: { 
                            type: Type.ARRAY, 
                            items: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, format: {type:Type.STRING}, intent: {type:Type.STRING} } } 
                         }
                       }
                    }
                  }
                }
              }
            },
            key_insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    };

    const promptPhase2 = `
      Sei Yoda's Eye. Input: ${brandsJson}. Temi: [${themesList}]

      TASK: CLUSTERING (Fase 2)
      
      REGOLE JEDI:
      1. **JSON COMPATTO**.
      2. **Drilldown Limitato**: Per ogni TEMA, restituisci un TOTALE di MAX 2 ARTICOLI ESEMPLARI dei COMPETITOR (NON del focus brand). 
         - SOLO 2 articoli totali per tema, scegli i più rappresentativi tra i competitor.
         - Seleziona i più significativi per analisi competitiva.
         - NO URL nell'output, solo title + format + intent.
      3. **Insights**: MAX 3 insights.
    `;

    console.log("FASE 2: Clusters...");
    const res2 = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptPhase2,
      config: { responseMimeType: 'application/json', responseSchema: schemaPhase2, temperature: 0.1, maxOutputTokens: 8192 }
    }));
    const data2 = parseJsonSafely<any>(res2.text || '{}');

    await new Promise(r => setTimeout(r, 1500));

    // ==========================================================================================
    // FASE 3: MATRICE TATTICA - RIMOSSA PER OTTIMIZZAZIONE
    // ==========================================================================================
    
    console.log("FASE 3: Matrix SKIPPED (ottimizzazione)");
    const data3 = { tab3_dual_clustering: null };
    
    await new Promise(r => setTimeout(r, 500));

    // ==========================================================================================
    // FASE 4: PILLAR CONTENT - CON URL (unico posto dove servono)
    // ==========================================================================================

    const schemaPhase4: Schema = {
      type: Type.OBJECT,
      properties: {
        tab4_depth_and_format: {
          type: Type.OBJECT,
          properties: {
            pillar_candidates_list: {
                type: Type.ARRAY,
                items: {
                    type: Type.OBJECT,
                    properties: {
                        brand: { type: Type.STRING },
                        candidates: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { url: {type: Type.STRING}, title: {type: Type.STRING}, reason: {type: Type.STRING} } } }
                    }
                }
            },
            key_insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    };

    // Per i pillar, passiamo gli URL originali completi
    const brandsWithUrls = brands.map(b => ({
      name: b.name,
      articles: b.articles.slice(0, 400).map(a => ({ url: a.url, title: a.title }))
    }));

    const promptPhase4 = `
      Sei Yoda's Eye. Brands: ${fullBrands.map(b => b.name).join(', ')}
      
      TASK: PILLAR CONTENT (Fase 4)
      
      Input con URL per identificare i pillar:
      ${JSON.stringify(brandsWithUrls)}
      
      REGOLE JEDI:
      1. **ESATTAMENTE 2 PILLAR** per ogni brand. Non di più, non di meno.
      2. Devi restituire: URL completo + title + reason (max 15 parole).
      3. **Insights**: MAX 3 insights.
    `;

    console.log("FASE 4: Pillars...");
    const res4 = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptPhase4,
      config: { responseMimeType: 'application/json', responseSchema: schemaPhase4, temperature: 0.1, maxOutputTokens: 8192 }
    }));
    const data4 = parseJsonSafely<any>(res4.text || '{}');

    // ==========================================================================================
    // MAPPING
    // ==========================================================================================
    
    const listToMap = (list: any[], keyField: string, valueTransform: (item: any) => any = (i) => i) => {
        const map: any = {};
        if (Array.isArray(list)) {
            list.forEach(item => {
                if(item[keyField]) map[item[keyField]] = valueTransform(item);
            });
        }
        return map;
    };

    const article_counts = listToMap(data1.meta?.article_counts_list, 'brand', i => i.count);

    if (data1.tab1_overview?.theme_share_table) {
        data1.tab1_overview.theme_share_table.forEach((row: any) => {
            row.by_brand = listToMap(row.by_brand_list, 'brand', i => ({ count: i.count, pct: i.pct }));
        });
    }

    if (data2.tab2_theme_clustering?.themes) {
        data2.tab2_theme_clustering.themes.forEach((theme: any) => {
            theme.by_brand = listToMap(theme.by_brand_list, 'brand', i => ({ count: i.count, pct: i.pct }));
            theme.drilldown_articles = listToMap(theme.drilldown_list, 'brand', i => i.articles);
        });
    }

    let pillar_candidates: any = {};
    if (data4.tab4_depth_and_format?.pillar_candidates_list) {
        pillar_candidates = listToMap(data4.tab4_depth_and_format.pillar_candidates_list, 'brand', i => i.candidates);
    }
    
    const finalResult: AnalysisResult = {
      meta: {
          focus_brand: focusBrand,
          brands: brands.map(b => b.name),
          article_counts: article_counts,
          second_dimension_used: 'intent'
      },
      tab1_overview: data1.tab1_overview,
      tab2_theme_clustering: data2.tab2_theme_clustering,
      tab3_dual_clustering: null,
      tab4_depth_and_format: {
          ...data4.tab4_depth_and_format,
          pillar_candidates: pillar_candidates,
          depth_metrics: { note: "Dati profondità sintetizzati" } as any
      },
      tab5_gap_analysis: data1.tab5_gap_analysis
    };

    if (Object.keys(finalResult.meta.article_counts).length === 0) {
       brands.forEach(b => finalResult.meta.article_counts[b.name] = b.articles.length);
    }

    return finalResult;
  }
}
