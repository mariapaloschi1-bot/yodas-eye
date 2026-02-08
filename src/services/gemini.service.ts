import { Injectable } from '@angular/core';
import { GoogleGenAI, Type, Schema } from '@google/genai';
import type { BrandInput, AnalysisResult } from '../types';
import { parseJsonSafely, retryWithBackoff } from './api-utils';

@Injectable({ providedIn: 'root' })
export class GeminiService {

  async analyzeContent(apiKey: string, focusBrand: string, brands: BrandInput[]): Promise<AnalysisResult> {
    if (!apiKey || apiKey.trim().length === 0) {
      throw new Error('API Key mancante. Inserisci la tua Gemini API Key nel form.');
    }

    const genai = new GoogleGenAI({ apiKey: apiKey });

    // Build compact input dataset
    const fullBrands = brands.map(b => ({
      name: b.name,
      article_count: b.articles.length,
      articles: b.articles.slice(0, 500).map(a => ({ title: a.title, url: a.url }))
    }));

    const totalArticles = fullBrands.reduce((sum, b) => sum + b.article_count, 0);
    console.log(`🚀 Analisi avviata su ${totalArticles} articoli totali...`);

    const brandsJson = JSON.stringify(fullBrands, null, 0);

    // Phase 1 - Strategy & Gaps (Compact Mode)
    const schemaPhase1: Schema = {
      type: Type.OBJECT,
      properties: {
        meta: {
            type: Type.OBJECT,
            properties: {
              focus_brand: { type: Type.STRING },
              brands: { type: Type.ARRAY, items: { type: Type.STRING } },
              article_counts: { type: Type.OBJECT, properties: {} }
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
                  by_brand: { type: Type.OBJECT, properties: {} }
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
                overexposed: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      theme: { type: Type.STRING },
                      focus_pct: { type: Type.NUMBER },
                      competitor_avg_pct: { type: Type.NUMBER },
                      note: { type: Type.STRING }
                    }
                  }
                },
                underexposed: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      theme: { type: Type.STRING },
                      focus_pct: { type: Type.NUMBER },
                      competitor_avg_pct: { type: Type.NUMBER },
                      note: { type: Type.STRING }
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

    const promptPhase1 = `
Tu sei un analista strategico esperto. Dato il seguente dataset di articoli di più brand, genera un'analisi strategica compatta in italiano con stile Yoda, usando terminologia Star Wars.

Dataset JSON:
${brandsJson}

Focus brand: ${focusBrand}

Regole:
- Individua 5-7 macro-temi principali (es. SEO Tecnico, Content Strategy, UX/UI, AI & Automation, Link Building, ecc.)
- Per ogni tema conta quanti articoli per brand (totali e %)
- Identifica: leader di varietà tematica, specialista di nicchia
- Calcola se ${focusBrand} è sovra-esposto o sotto-esposto rispetto alla media competitor
- Fornisci 3-5 insight strategici in italiano, stile Yoda

Output JSON come da schema.
`;

    const modelConfig1 = {
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schemaPhase1,
        temperature: 0.1,
        maxOutputTokens: 8192
      }
    };

    const rawResponse1 = await retryWithBackoff(() =>
      genai.models.generateContent({
        ...modelConfig1,
        contents: promptPhase1
      })
    );

    const phase1Data = parseJsonSafely(rawResponse1) as any;

    // Phase 2 - Theme Clustering (stats + delta only)
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
                  by_brand: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        brand: { type: Type.STRING },
                        count: { type: Type.NUMBER },
                        pct: { type: Type.NUMBER }
                      }
                    }
                  },
                  competitors_delta: {
                    type: Type.ARRAY,
                    items: {
                      type: Type.OBJECT,
                      properties: {
                        competitor: { type: Type.STRING },
                        delta: { type: Type.NUMBER }
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
Dataset JSON:
${brandsJson}

Focus brand: ${focusBrand}

Genera un clustering tematico con:
- 5-7 macro-temi
- Per ogni tema: count e pct per brand
- competitors_delta: per ogni competitor calcola delta = competitor_pct - focus_pct (positivo = competitor domina, negativo = focus domina)
- 3-5 insight strategici in italiano, stile Yoda

NO drilldown articoli, SOLO statistiche + delta.
Output JSON come da schema.
`;

    const modelConfig2 = {
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schemaPhase2,
        temperature: 0.1,
        maxOutputTokens: 8192
      }
    };

    const rawResponse2 = await retryWithBackoff(() =>
      genai.models.generateContent({
        ...modelConfig2,
        contents: promptPhase2
      })
    );

    const phase2Data = parseJsonSafely(rawResponse2) as any;

    // Phase 3 - Matrix (Theme × Intent) - numbers only
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
                  rows: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { dimension_value: { type: Type.STRING }, by_brand: { type: Type.OBJECT, properties: {} } } } }
                }
              }
            },
            key_insights: { type: Type.ARRAY, items: { type: Type.STRING } }
          }
        }
      }
    };

    const promptPhase3 = `
Dataset JSON:
${brandsJson}

Focus brand: ${focusBrand}

Genera una matrice Tema × Intent (o Formato):
- Temi: gli stessi 5-7 di prima
- Intent: Informational, Commercial, Transactional, How-to, ecc.
- Per ogni cella: count + pct per brand (SOLO NUMERI, no articoli)
- 3-5 insight strategici in italiano, stile Yoda

Output JSON come da schema.
`;

    const modelConfig3 = {
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schemaPhase3,
        temperature: 0.1,
        maxOutputTokens: 8192
      }
    };

    const rawResponse3 = await retryWithBackoff(() =>
      genai.models.generateContent({
        ...modelConfig3,
        contents: promptPhase3
      })
    );

    const phase3Data = parseJsonSafely(rawResponse3) as any;

    // Phase 4 - Pillar Content (5-7 candidates per brand)
    const schemaPhase4: Schema = {
      type: Type.OBJECT,
      properties: {
        tab4_depth_and_format: {
          type: Type.OBJECT,
          properties: {
            pillar_candidates: { type: Type.OBJECT, properties: {} },
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
                  focus_pct: { type: Type.NUMBER },
                  competitor_avg_pct: { type: Type.NUMBER },
                  gap_type: { type: Type.STRING },
                  priority: { type: Type.STRING },
                  rationale: { type: Type.STRING },
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

    const promptPhase4 = `
Dataset JSON:
${brandsJson}

Focus brand: ${focusBrand}

Genera:
1. pillar_candidates: per ogni brand, 5-7 articoli pillar (URL + title + reason)
2. theme_gaps: temi sotto-rappresentati o sovra-esposti di ${focusBrand}
3. prioritized_opportunities: top 3-5 opportunità strategiche (rank, opportunity, type, why_it_matters, suggested_angles, proof_points come stringhe)
4. key_insights: 3-5 insight in italiano, stile Yoda

Output JSON come da schema.
`;

    const modelConfig4 = {
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
        responseSchema: schemaPhase4,
        temperature: 0.1,
        maxOutputTokens: 8192
      }
    };

    const rawResponse4 = await retryWithBackoff(() =>
      genai.models.generateContent({
        ...modelConfig4,
        contents: promptPhase4
      })
    );

    const phase4Data = parseJsonSafely(rawResponse4) as any;

    // Merge all phases
    const finalResult: AnalysisResult = {
      meta: {
        focus_brand: focusBrand,
        brands: brands.map(b => b.name),
        article_counts: Object.fromEntries(brands.map(b => [b.name, b.articles.length])),
        second_dimension_used: phase3Data.tab3_dual_clustering.second_dimension_used || 'Intent'
      },
      tab1_overview: phase1Data.tab1_overview,
      tab2_theme_clustering: phase2Data.tab2_theme_clustering,
      tab3_dual_clustering: phase3Data.tab3_dual_clustering,
      tab4_depth_and_format: phase4Data.tab4_depth_and_format,
      tab5_gap_analysis: phase4Data.tab5_gap_analysis
    };

    console.log('✅ Analisi completata!');
    return finalResult;
  }
}
