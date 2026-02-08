import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import { AnalysisResult, BrandInput } from '../types';
import { retryWithBackoff, parseJsonSafely } from './api-utils';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  
  async analyzeContent(apiKey: string, focusBrand: string, brands: BrandInput[]): Promise<AnalysisResult> {
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API Key mancante. Inserisci la tua Gemini API Key nel form.');
    }
    
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // INPUT: fino a 500 per brand, massimo 1000 totali
    const fullBrands = brands.map(b => ({
      name: b.name,
      count: b.articles.length,
      articles: b.articles.slice(0, 500).map(a => ({ title: a.title, url: a.url }))
    }));
    const brandsJson = JSON.stringify(fullBrands, null, 0);

    const totalArticles = fullBrands.reduce((sum, b) => sum + b.count, 0);
    console.log(`🚀 Analisi avviata su ${totalArticles} articoli totali...`);

    // FASE 1: OVERVIEW + GAPS
    const schemaPhase1: Schema = {
      type: Type.OBJECT,
      properties: {
        meta: {
            type: Type.OBJECT,
            properties: {
              focus_brand: { type: Type.STRING },
              brands: { type: Type.ARRAY, items: { type: Type.STRING } },
              article_counts: { type: Type.OBJECT, additionalProperties: { type: Type.NUMBER } }
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
                  by_brand: { type: Type.OBJECT, additionalProperties: { type: Type.OBJECT, properties: { count: { type: Type.NUMBER }, pct: { type: Type.NUMBER } } } }
                }
              }
            },
            leaders: {
              type: Type.OBJECT,
              properties: {
                breadth_leader: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, why: { type: Type.STRING } } },
                specialist: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, why: { type: Type.STRING } } }
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
                  references: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, url: { type: Type.STRING }, title: { type: Type.STRING } } } },
                  what_to_emulate: { type: Type.STRING },
                  what_to_avoid: { type: Type.STRING }
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
                  proof_points: { type: Type.ARRAY, items: { type: Type.STRING } }
                }
              }
            },
            key_insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    };

    const promptPhase1 = `Sei un analista SEO in stile Yoda. Analizza TUTTI i ${totalArticles} articoli forniti.

INPUT: ${brandsJson}

COMPITO:
1. Identifica 4-6 MACRO-TEMI analizzando TUTTI gli articoli
2. Calcola distribuzione % per brand su ogni tema
3. Identifica leader (breadth vs specialist)
4. Identifica focus brand overexposed/underexposed
5. Identifica 3-5 gap strategici
6. Identifica 3-5 opportunità

REGOLE:
- Analizza TUTTI gli articoli
- MAX 6 temi
- MAX 3 gaps
- MAX 5 opportunità
- MAX 3 insights per sezione
- MAX 2 references per gap
- Testi in italiano, stile Yoda
- JSON compatto

OUTPUT JSON:`;

    let result1: any;
    try {
      const response1 = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptPhase1,
          config: { responseMimeType: 'application/json', responseSchema: schemaPhase1, temperature: 0.1, maxOutputTokens: 8192 }
        });
      });

      if (!response1 || !response1.text) throw new Error('Risposta vuota da Gemini (Fase 1)');
      result1 = parseJsonSafely(response1.text);
    } catch (error: any) {
      console.error('❌ Gemini Error (Fase 1):', error);
      throw error;
    }

    // FASE 2: CLUSTERING (SOLO STATISTICHE + DELTA)
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
                  description: { type: Type.STRING },
                  focus_brand_pct: { type: Type.NUMBER },
                  competitors_delta: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { brand: { type: Type.STRING }, pct: { type: Type.NUMBER }, delta: { type: Type.NUMBER } } } }
                }
              }
            },
            key_insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    };

    const promptPhase2 = `Usa i temi Fase 1. Analizza TUTTI i ${totalArticles} articoli.

TEMI: ${JSON.stringify(result1.tab1_overview.theme_share_table.map((t: any) => t.theme))}
INPUT: ${brandsJson}

COMPITO:
Per ogni tema calcola:
1. % focus brand
2. % ogni competitor
3. DELTA (competitor % - focus brand %)

REGOLE:
- Analizza TUTTI gli articoli
- Delta: positivo = competitor domina, negativo = tu domini
- MAX 3 insights
- Testi in italiano, stile Yoda

OUTPUT JSON:`;

    let result2: any;
    try {
      const response2 = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptPhase2,
          config: { responseMimeType: 'application/json', responseSchema: schemaPhase2, temperature: 0.1, maxOutputTokens: 8192 }
        });
      });

      if (!response2 || !response2.text) throw new Error('Risposta vuota da Gemini (Fase 2)');
      result2 = parseJsonSafely(response2.text);
    } catch (error: any) {
      console.error('❌ Gemini Error (Fase 2):', error);
      throw error;
    }

    // FASE 3: MATRICE (SOLO NUMERI)
    const schemaPhase3: Schema = {
      type: Type.OBJECT,
      properties: {
        tab3_dual_clustering: {
          type: Type.OBJECT,
          properties: {
            second_dimension_used: { type: Type.STRING },
            matrix: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  theme: { type: Type.STRING },
                  rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { dimension_value: { type: Type.STRING }, by_brand: { type: Type.OBJECT, additionalProperties: { type: Type.OBJECT, properties: { count: { type: Type.NUMBER }, pct: { type: Type.NUMBER } } } } } } }
                }
              }
            },
            key_insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    };

    const promptPhase3 = `Crea matrice TEMA × INTENT analizzando TUTTI i ${totalArticles} articoli.

TEMI: ${JSON.stringify(result1.tab1_overview.theme_share_table.map((t: any) => t.theme))}
INPUT (400k char): ${brandsJson.substring(0, 400000)}

COMPITO:
Per ogni tema, classifica articoli per INTENT (Informational, Commercial, Transactional, Navigational).
Calcola count e % per brand in ogni cella. SOLO NUMERI.

REGOLE:
- Analizza TUTTI gli articoli
- MAX 3 insights
- Testi in italiano, stile Yoda

OUTPUT JSON:`;

    let result3: any;
    try {
      const response3 = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptPhase3,
          config: { responseMimeType: 'application/json', responseSchema: schemaPhase3, temperature: 0.1, maxOutputTokens: 8192 }
        });
      });

      if (!response3 || !response3.text) throw new Error('Risposta vuota da Gemini (Fase 3)');
      result3 = parseJsonSafely(response3.text);
    } catch (error: any) {
      console.error('❌ Gemini Error (Fase 3):', error);
      throw error;
    }

    // FASE 4: PILLAR (5-7 PER BRAND)
    const schemaPhase4: Schema = {
      type: Type.OBJECT,
      properties: {
        tab4_depth_and_format: {
          type: Type.OBJECT,
          properties: {
            pillar_candidates: { type: Type.OBJECT, additionalProperties: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { url: { type: Type.STRING }, title: { type: Type.STRING }, reason: { type: Type.STRING } } } } },
            key_insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    };

    const promptPhase4 = `Identifica PILLAR CONTENT analizzando TUTTI i ${totalArticles} articoli.

INPUT (400k char): ${brandsJson.substring(0, 400000)}

COMPITO:
Identifica 5-7 articoli pillar PER BRAND.

CRITERI:
- Titolo indica contenuto cornerstone (guida, tutorial, overview)
- Topic ampio e fondamentale
- Probabile hub per link interni

REGOLE:
- 5-7 pillar per brand
- Reason: max 10 parole
- MAX 3 insights
- Testi in italiano, stile Yoda

OUTPUT JSON:`;

    let result4: any;
    try {
      const response4 = await retryWithBackoff(async () => {
        return await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: promptPhase4,
          config: { responseMimeType: 'application/json', responseSchema: schemaPhase4, temperature: 0.1, maxOutputTokens: 8192 }
        });
      });

      if (!response4 || !response4.text) throw new Error('Risposta vuota da Gemini (Fase 4)');
      result4 = parseJsonSafely(response4.text);
    } catch (error: any) {
      console.error('❌ Gemini Error (Fase 4):', error);
      throw error;
    }

    // UNIFICAZIONE
    const finalResult: AnalysisResult = {
      meta: {
        focus_brand: result1.meta.focus_brand,
        brands: result1.meta.brands,
        article_counts: result1.meta.article_counts,
        second_dimension_used: result3.tab3_dual_clustering.second_dimension_used
      },
      tab1_overview: result1.tab1_overview,
      tab2_theme_clustering: result2.tab2_theme_clustering,
      tab3_dual_clustering: result3.tab3_dual_clustering,
      tab4_depth_and_format: result4.tab4_depth_and_format,
      tab5_gap_analysis: result1.tab5_gap_analysis
    };

    console.log('✅ Analisi completata!');
    return finalResult;
  }
}
