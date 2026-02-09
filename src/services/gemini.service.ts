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
      - Parla come Yoda SOLO nei campi: rationale, why, note, why_it_matters, reason
      - Gli INSIGHTS devono essere scritti in italiano normale, professionale, dettagliato (~250 parole ciascuno)
      - Usa metafore di Star Wars: "Il Lato Oscuro (competitors)", "La Forza (punti di forza)", "Giovane Padawan (utente)".
      - Lingua: ITALIANO.

      Compiti di Analisi:
      1. Clustering temi: Raggruppa gli articoli per argomenti (MAX 10 TEMI).
      2. Share of Voice: Chi domina la galassia dei contenuti?
      3. Gap Analysis: Dove manca la Forza nel brand dell'utente? (MAX 2 GAPS).
      4. Opportunità: Quali nuovi sentieri esplorare? (MAX 4 OPPORTUNITÀ).
      5. Pillar Content: Identifica i 3 articoli pillar più forti per ogni brand (focus incluso).
      
      INPUT DATI:
      Padawan Brand (Focus): ${focusBrand}
      Archivi del Tempio (Brands e Articoli):
      ${brandsJson}

      REGOLE OUTPUT JSON:
      - Restituisci SOLO JSON valido.
      - **Insights**: Scritti in italiano professionale, dettagliati, circa 250 parole ciascuno, con analisi approfondita.
      - **Altri campi testuali** (rationale, why, note, why_it_matters, reason): DEVONO ESSERE SCRITTI COME YODA.
      - **Limiti per evitare overflow**:
        * MAX 10 TEMI nella theme_share_table
        * MAX 2 articoli drilldown per tema per OGNI brand (INCLUSO il focus brand)
        * MAX 2 GAPS in theme_gaps
        * MAX 4 OPPORTUNITÀ in prioritized_opportunities
        * 3 insights per sezione (ogni insight ~250 parole)
        * 3 pillar per brand (invece di 2)

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
          "key_insights": [
            "Insight professionale dettagliato di circa 250 parole che analizza in profondità i pattern emersi dall'analisi, fornendo contesto, implicazioni strategiche e raccomandazioni concrete basate sui dati osservati...",
            "Secondo insight professionale...",
            "Terzo insight professionale..."
          ]
        },
        "tab2_theme_clustering": {
          "themes": [
            {
              "theme": "",
              "by_brand": { "BRAND": { "count": 0, "pct": 0.0 } },
              "drilldown_articles": {
                "BRAND": [
                  {
                    "title": "",
                    "format": "Guida|Elenco|News|Approfondimento|Comparazione",
                    "intent": "Informativo|Navigazionale|Transazionale"
                  }
                ]
              }
            }
          ],
          "key_insights": [
            "Insight professionale dettagliato di circa 250 parole sui cluster tematici...",
            "Secondo insight...",
            "Terzo insight..."
          ]
        },
        "tab3_dual_clustering": null,
        "tab4_depth_and_format": {
          "depth_metrics": { 
            "note": "Yoda: Dai dati attuali, profondità stimare non posso. Titoli solo ho ricevuto."
          },
          "pillar_candidates": {
            "BRAND": [
              { "url": "", "title": "", "reason": "Yoda: Perché pillar questo articolo è..." },
              { "url": "", "title": "", "reason": "Yoda: Perché pillar questo articolo è..." },
              { "url": "", "title": "", "reason": "Yoda: Perché pillar questo articolo è..." }
            ]
          },
          "key_insights": [
            "Insight professionale dettagliato di circa 250 parole sui contenuti pillar...",
            "Secondo insight...",
            "Terzo insight..."
          ]
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
                { "brand": "", "title": "" }
              ]
            },
            {
              "rank": 2,
              "opportunity": "Titolo Opportunità",
              "type": "Nuovo Sentiero|Espansione|Equilibrio",
              "why_it_matters": "Yoda: Perché importante è...",
              "suggested_angles": ["Angolo 1", "Angolo 2", "Angolo 3"],
              "proof_points": [
                { "brand": "", "title": "" }
              ]
            },
            {
              "rank": 3,
              "opportunity": "Titolo Opportunità",
              "type": "Nuovo Sentiero|Espansione|Equilibrio",
              "why_it_matters": "Yoda: Perché importante è...",
              "suggested_angles": ["Angolo 1", "Angolo 2", "Angolo 3"],
              "proof_points": [
                { "brand": "", "title": "" }
              ]
            },
            {
              "rank": 4,
              "opportunity": "Titolo Opportunità",
              "type": "Nuovo Sentiero|Espansione|Equilibrio",
              "why_it_matters": "Yoda: Perché importante è...",
              "suggested_angles": ["Angolo 1", "Angolo 2", "Angolo 3"],
              "proof_points": [
                { "brand": "", "title": "" }
              ]
            }
          ],
          "key_insights": [
            "Insight professionale dettagliato di circa 250 parole sui gap e opportunità...",
            "Secondo insight...",
            "Terzo insight..."
          ]
        }
      }

      **NOTA IMPORTANTE**:
      - Nel drilldown_articles di tab2, includi 2 articoli per OGNI brand (INCLUSO il focus brand).
      - Pillar candidates: esattamente 3 per brand, con URL completo.
      - Gap theme_gaps: MAX 2 gaps più critici.
      - Opportunità: MAX 4 più promettenti (ordinate per rank 1-4).
      - Insights: Scritti in italiano professionale, dettagliati, circa 250 parole ciascuno.
      - tab3_dual_clustering deve essere null (non implementato).
    `;

    try {
      console.log('🔮 Inizio analisi con Gemini 2.5 Flash...');
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
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
