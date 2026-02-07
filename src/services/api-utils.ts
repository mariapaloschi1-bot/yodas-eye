/**
 * Esegue una funzione asincrona con tentativi di retry esponenziali.
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  retries = 3, 
  delay = 5000,
  backoff = 2
): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    // 1. Check for Fatal Errors (Auth, etc)
    const msg = error.message || '';
    if (msg.includes('API key') || msg.includes('403') || msg.includes('INVALID_ARGUMENT')) {
      throw error;
    }

    if (retries <= 0) {
      console.error("[API Utils] Retries exhausted.");
      throw error;
    }

    // 2. Handle Rate Limiting (429) extraction
    let waitTime = delay;
    
    // Check if error message contains "retry in Xs" (Gemini standard error message)
    // Format usually: "Please retry in 41.240346486s."
    const match = msg.match(/retry in ([0-9.]+)s/);
    if (match && match[1]) {
      const seconds = parseFloat(match[1]);
      console.warn(`[API Limit] Rate Limit detected. Waiting explicitly for ${seconds}s...`);
      // Wait slightly longer than requested to be safe
      waitTime = (seconds * 1000) + 2000; 
    } else if (error.status === 429) {
      waitTime = 60000; // Default 60s for generic 429 without time
    }

    console.warn(`[API Retry] Error occurred. Retrying in ${Math.ceil(waitTime/1000)}s... (Retries left: ${retries})`);
    
    await new Promise(r => setTimeout(r, waitTime));
    
    // Recursive retry
    return retryWithBackoff(fn, retries - 1, delay * backoff, backoff);
  }
}

/**
 * Pulisce la stringa rimuovendo markdown.
 */
export function sanitizeJsonString(text: string): string {
  if (!text) return "";
  let clean = text.replace(/```json\s*|```/g, '');
  
  // Rimuovi commenti JS stile // se presenti (Gemini a volte li lascia se glieli metti nel prompt)
  clean = clean.replace(/\/\/.*$/gm, '');

  const firstBrace = clean.indexOf('{');
  if (firstBrace !== -1) {
    clean = clean.substring(firstBrace);
  }
  return clean.trim();
}

/**
 * Tenta di riparare un JSON troncato in modo intelligente.
 */
function bestJsonRepair(jsonString: string): string {
  let modified = jsonString.trim();
  
  // 1. Rimuovi virgole finali spurie (comuni nei troncamenti)
  // Esempio: "key": "value",
  if (modified.endsWith(',')) {
    modified = modified.slice(0, -1);
  }

  // 2. Analisi dello stack per chiudere parentesi
  let inString = false;
  let isEscaped = false;
  const stack: string[] = []; 

  for (let i = 0; i < modified.length; i++) {
    const char = modified[i];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }
    if (char === '\\') {
      isEscaped = true;
      continue;
    }
    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (!inString) {
      if (char === '{') stack.push('}');
      else if (char === '[') stack.push(']');
      else if (char === '}' || char === ']') {
        if (stack.length > 0 && stack[stack.length - 1] === char) {
          stack.pop();
        }
      }
    }
  }

  // 3. Se il troncamento è avvenuto DENTRO una stringa (es: "descrizi...)
  if (inString) {
    modified += '"';
    // Dopo aver chiuso la stringa, potremmo dover chiudere property/array
  }

  // 4. Chiudiamo lo stack rimanente
  while (stack.length > 0) {
    modified += stack.pop();
  }

  return modified;
}

export function parseJsonSafely<T>(text: string): T {
  if (!text) {
    throw new Error("Risposta vuota dall'Oracolo (API).");
  }

  try {
    return JSON.parse(text);
  } catch (e: any) {
    console.warn("JSON Parse standard fallito. Avvio protocollo riparazione...");
    
    try {
      const fixed = bestJsonRepair(text);
      const parsed = JSON.parse(fixed);
      console.log("JSON Riparato con successo.");
      return parsed;
    } catch (fixErr) {
      console.error("JSON Irreparabile.");
      // Fallback: se fallisce, restituiamo un errore gestito
      throw new Error("Troppi dati generati o formato invalido. Riprova con meno articoli.");
    }
  }
}