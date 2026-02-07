import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, Schema, GenerateContentResponse } from '@google/genai';
import { AnalysisResult, BrandInput } from '../types';
import { retryWithBackoff, parseJsonSafely } from './api-utils';

declare var process: {
  env: {
    API_KEY: string;
  }
};

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  
  async analyzeContent(focusBrand: string, brands: BrandInput[]): Promise<AnalysisResult> {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // 1. INPUT LIMITATO A 500 (Massima stabilità)
    const fullBrands = brands.map(b => ({
      name: b.name,
      count: b.articles.length,
      articles: b.articles.slice(0, 500).map(a => ({ title: a.title, url: a.url }))
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
                  proof_points: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, url: { type: Type.STRING }, title: { type: Type.STRING } } } }
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
    // FASE 2: CLUSTERING - LIMITATO A 3 ESEMPI TOTALI PER TEMA
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
                            items: { type: Type.OBJECT, properties: { title: {type:Type.STRING}, url: {type:Type.STRING}, format: {type:Type.STRING}, intent: {type:Type.STRING} } } 
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
      2. **Drilldown Limitato**: Per ogni TEMA, restituisci un TOTALE di MAX 3 ARTICOLI ESEMPLARI (tra tutti i brand). 
         - Non 3 per brand, ma 3 totali per il tema.
         - Seleziona i più rappresentativi.
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
    // FASE 3: MATRICE TATTICA - SOLO NUMERI (ZERO ARTICOLI)
    // ==========================================================================================

    const schemaPhase3: Schema = {
      type: Type.OBJECT,
      properties: {
        tab3_dual_clustering: {
          type: Type.OBJECT,
          properties: {
            dimension_x: { type: Type.STRING },
            dimension_y: { type: Type.STRING },
            matrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING },
                  rows: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        dimension_value: { type: Type.STRING },
                        by_brand_list: { 
                           type: Type.ARRAY, 
                           items: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, count: { type: Type.NUMBER }, pct_within_brand: { type: Type.NUMBER } } } 
                        }
                        // DRILLDOWN RIMOSSO COMPLETAMENTE
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

    const promptPhase3 = `
      Sei Yoda's Eye. Temi: [${themesList}]. Brands: ${fullBrands.map(b => b.name).join(', ')}
      
      TASK: MATRICE TATTICA (Fase 3) - Tema vs Intento (Info, Comm, Nav)
      
      REGOLE JEDI:
      1. **SOLO NUMERI**: Restituisci solo count e pct. 
      2. **NESSUN ARTICOLO**: Non includere titoli o URL.
      3. Stime statistiche accurate basate sull'input.
      4. **Insights**: MAX 3 insights tattici brevi.
      
      Contesto Input: ${brandsJson.substring(0, 400000)}...
    `;

    console.log("FASE 3: Matrix...");
    const res3 = await retryWithBackoff<GenerateContentResponse>(() => ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: promptPhase3,
      config: { responseMimeType: 'application/json', responseSchema: schemaPhase3, temperature: 0.1, maxOutputTokens: 8192 }
    }));
    const data3 = parseJsonSafely<any>(res3.text || '{}');
    
    await new Promise(r => setTimeout(r, 1500));

    // ==========================================================================================
    // FASE 4: PILLAR CONTENT - ESATTAMENTE 2 PER BRAND
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

    const promptPhase4 = `
      Sei Yoda's Eye. Brands: ${fullBrands.map(b => b.name).join(', ')}
      
      TASK: PILLAR CONTENT (Fase 4)
      
      REGOLE JEDI:
      1. **ESATTAMENTE 2 PILLAR** per ogni brand. Non di più, non di meno.
      2. Descrizioni (Reason) brevissime (max 15 parole).
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

    if (data3.tab3_dual_clustering?.matrix) {
        data3.tab3_dual_clustering.matrix.forEach((group: any) => {
            if (group.rows) {
                group.rows.forEach((row: any) => {
                    row.by_brand = listToMap(row.by_brand_list, 'brand', i => ({ count: i.count, pct_within_brand: i.pct_within_brand }));
                    // DRILLDOWN REMOVED from mapping
                });
            }
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
      tab3_dual_clustering: data3.tab3_dual_clustering,
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