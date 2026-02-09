import { Injectable } from '@angular/core';
import { GoogleGenAI } from '@google/genai';
import { AnalysisResult, BrandInput } from '../types';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  
  async analyzeContent(apiKey: string, focusBrand: string, brands: BrandInput[]): Promise<AnalysisResult> {
    // 🔑 BYOK: La chiave arriva dal browser dell'utente
    if (!apiKey || apiKey.trim() === '') {
      throw new Error('API Key mancante. Inserisci la tua Gemini API Key nel form.');
    }
    
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // ✅ LIMITE 400 ARTICOLI (mantenuto da versione 400)
    const fullBrands = brands.map(b => ({
      name: b.name,
      count: b.articles.length,
      articles: b.articles.slice(0, 400).map(a => ({ title: a.title, url: a.url }))
    }));
    const brandsJson = JSON.stringify(fullBrands, null, 2);
    
    const systemPrompt = `
      Tu sei il Maestro Jedi dell'analisi dei contenuti (Persona: Yoda).
      Il tuo compito è analizzare i dati forniti e restituire saggezza strategica.

      TONO E STILE (IMPORTANTE):
      - Parla come Yoda: "Analizzare i dati io devo", "Grande confusione nel brand c'è".
      - Usa metafore di Star Wars: "Il Lato Oscuro (competitors)", "La Forza (punti di forza)", "Giovane Padawan (utente)".
      - Lingua: ITALIANO (Stile Yoda).
      - Colore emotivo: Saggio, criptico ma utile, autorevole.

      Compiti di Analisi:
      1. Clustering temi: Raggruppa gli articoli per argomenti (MAX 8 TEMI).
      2. Share of Voice: Chi domina la galassia dei contenuti?
      3. Gap Analysis: Dove manca la Forza nel brand dell'utente? (MAX 2 GAPS).
      4. Opportunità: Quali nuovi sentieri esplorare? (MAX 2 OPPORTUNITÀ).
      5. Pillar Content: Identifica i 2 articoli pillar per ogni brand.
      
      INPUT DATI:
      Padawan Brand (Focus): ${focusBrand}
      Archivi del Tempio (Brands e Articoli):
      ${brandsJson}

      REGOLE OUTPUT JSON:
      - Restituisci SOLO JSON valido.
      - I campi testuali (insight, rationale, why, note) DEVONO ESSERE SCRITTI COME YODA.
      - **Limiti per evitare overflow**:
        * MAX 8 TEMI nella theme_share_table
        * MAX 2 articoli drilldown per tema (SOLO competitor, NON focus brand)
        * MAX 2 GAPS in theme_gaps
        * MAX 2 OPPORTUNITÀ in prioritized_opportunities
        * MAX 3 insights per sezione
        * Testi brevi e concisi (max 150 caratteri per insight)

      SCHEMA JSON OBBLIGATORIO:
      {
        "meta": {
          "language": "it-yoda",
          "focus_brand": "${focusBrand}",
          "brands": ${JSON.stringify(fullBrands.map(b => b.name))},
          "article_counts": { ${fullBrands.map(b => `"${b.name}": ${b.count}`).join(', ')} },
          "second_dimension_used": "intent"
        },
        "tab1_overview": {
          "theme_share_table": [
            {
              "theme": "Nome Tema",
              "totals": { "all_brands_count": 0 },
              "by_brand": {
                "BRAND": { "count": 0, "pct": 0.0 }
              }
            }
          ],
          "leaders": {
            "breadth_leader": { "brand": "", "why": "Yoda: Spiegazione saggia..." },
            "specialist": { "brand": "", "why": "Yoda: Spiegazione saggia..." }
          },
          "focus_brand_exposure": {
            "overexposed": [{ "theme": "", "focus_pct": 0.0, "competitor_avg_pct": 0.0, "note": "Yoda note..." }],
            "underexposed": [{ "theme": "", "focus_pct": 0.0, "competitor_avg_pct": 0.0, "note": "Yoda note..." }]
          },
          "key_insights": ["Yoda: Insight 1...", "Yoda: Insight 2...", "Yoda: Insight 3..."]
        },
        "tab2_theme_clustering": {
          "themes": [
            {
              "theme": "",
              "by_brand": { "BRAND": { "count": 0, "pct": 0.0 } },
              "drilldown_articles": {
                "BRAND": [
                  {
                    "url": "",
                    "title": "",
                    "format": "Guida|Elenco|News|Approfondimento|Comparazione",
                    "intent": "Informativo|Navigazionale|Transazionale"
                  }
                ]
              }
            }
          ],
          "key_insights": ["Yoda insight 1", "Yoda insight 2", "Yoda insight 3"]
        },
        "tab3_dual_clustering": {
          "dimension_x": "theme",
          "dimension_y": "intent",
          "matrix": [
            {
              "theme": "",
              "rows": [
                {
                  "dimension_value": "Informativo|Navigazionale|Transazionale",
                  "by_brand": { "BRAND": { "count": 0, "pct_within_brand": 0.0 } }
                }
              ]
            }
          ],
          "key_insights": ["Yoda insight tattico 1", "Yoda insight tattico 2"]
        },
        "tab4_depth_and_format": {
          "depth_metrics": { 
            "note": "Yoda: Dai dati attuali, profondità stimare non posso. Titoli solo ho ricevuto."
          },
          "pillar_candidates": {
            "BRAND": [
              { "url": "", "title": "", "reason": "Yoda: Perché pillar questo articolo è..." },
              { "url": "", "title": "", "reason": "Yoda: Perché pillar questo articolo è..." }
            ]
          },
          "key_insights": ["Yoda pillar insight 1", "Yoda pillar insight 2"]
        },
        "tab5_gap_analysis": {
          "theme_gaps": [
            {
              "theme": "",
              "competitor_avg_pct": 0.0,
              "focus_pct": 0.0,
              "gap_type": "Debole|Oscuro|Assente",
              "priority": "Alta|Media",
              "rationale": "Yoda: Spiegazione del gap...",
              "what_to_emulate": ["Consiglio Jedi 1", "Consiglio Jedi 2"],
              "what_to_avoid": ["Lato Oscuro 1", "Lato Oscuro 2"]
            }
          ],
          "prioritized_opportunities": [
            {
              "rank": 1,
              "opportunity": "Titolo Opportunità",
              "type": "Nuovo Sentiero|Espansione|Equilibrio",
              "why_it_matters": "Yoda: Perché importante è...",
              "suggested_angles": ["Angolo 1", "Angolo 2", "Angolo 3"],
              "proof_points": [
                { "brand": "", "url": "", "title": "" }
              ]
            }
          ],
          "key_insights": ["Yoda gap insight 1", "Yoda gap insight 2", "Yoda gap insight 3"]
        }
      }

      **NOTA IMPORTANTE**:
      - Nel drilldown_articles di tab2, includi SOLO articoli dei COMPETITOR, NON del focus brand.
      - Mantieni MAX 2 articoli per tema per evitare output troppo grande.
      - Pillar candidates: esattamente 2 per brand, con URL completo.
      - Gap theme_gaps: MAX 2 gaps più critici.
      - Opportunità: MAX 2 più promettenti.
    `;

    try {
      console.log('🔮 Inizio analisi con Gemini 2.5 Flash...');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',  // ✅ MODELLO CORRETTO (stesso della versione OLD)
        contents: systemPrompt,
        config: {
          responseMimeType: 'application/json'
        }
      });
      
      const text = response.text;
      if (!text) throw new Error('Risposta vuota dal Consiglio Jedi (API)');
      
      console.log('✅ Risposta ricevuta, parsing JSON...');
      const result = JSON.parse(text) as AnalysisResult;
      
      console.log('✅ Analisi completata con successo!');
      return result;
      
    } catch (e: any) {
      console.error('❌ Gemini API Error:', e);
      if (e.message?.includes('Too many') || e.message?.includes('troppi')) {
        throw new Error('Troppi dati generati o formato invalido. Prova con meno articoli.');
      }
      if (e.message?.includes('not found') || e.message?.includes('404')) {
        throw new Error('Modello Gemini non disponibile. Verifica la tua API Key o la versione della libreria @google/genai.');
      }
      throw e;
    }
  }
}
