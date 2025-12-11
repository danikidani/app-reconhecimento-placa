// Serviço de OCR usando Tesseract.js com otimizações para placas brasileiras

import { createWorker } from 'tesseract.js';
import { cleanPlateText, validateBrazilianPlate } from './plate-validator';

export async function recognizePlate(imageData: string): Promise<{
  success: boolean;
  plate?: string;
  confidence?: number;
  error?: string;
}> {
  try {
    // Criar worker com configurações otimizadas
    const worker = await createWorker('eng', 1, {
      logger: (m) => console.log(m),
    });

    // Configurações otimizadas para reconhecimento de placas
    await worker.setParameters({
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
      tessedit_pageseg_mode: '7', // Tratar imagem como uma única linha de texto
      preserve_interword_spaces: '0',
    });

    // Processar imagem
    const { data } = await worker.recognize(imageData);
    await worker.terminate();

    console.log('Texto reconhecido:', data.text);
    console.log('Confiança:', data.confidence);

    // Limpar texto removendo espaços e caracteres especiais
    let rawText = data.text.replace(/\s+/g, '').toUpperCase();
    
    // Tentar encontrar padrão de placa no texto (Mercosul ou antiga)
    // Mercosul: ABC1D23
    const mercosulPattern = /[A-Z]{3}[0-9][A-Z][0-9]{2}/g;
    // Antiga: ABC1234
    const oldPattern = /[A-Z]{3}[0-9]{4}/g;
    
    // Buscar padrões
    let matches = rawText.match(mercosulPattern);
    if (!matches || matches.length === 0) {
      matches = rawText.match(oldPattern);
    }

    if (matches && matches.length > 0) {
      const bestMatch = matches[0];
      const validation = validateBrazilianPlate(bestMatch);
      
      if (validation.isValid) {
        return {
          success: true,
          plate: validation.normalized,
          confidence: data.confidence,
        };
      }
    }

    // Se não encontrou padrão, tentar limpar e validar o texto completo
    const cleanedText = cleanPlateText(rawText);
    const validation = validateBrazilianPlate(cleanedText);

    if (validation.isValid) {
      return {
        success: true,
        plate: validation.normalized,
        confidence: data.confidence,
      };
    }

    // Tentar correções comuns de OCR
    const correctedText = applyOCRCorrections(rawText);
    const correctedValidation = validateBrazilianPlate(correctedText);

    if (correctedValidation.isValid) {
      return {
        success: true,
        plate: correctedValidation.normalized,
        confidence: data.confidence * 0.9, // Reduzir confiança por ter feito correção
      };
    }

    return {
      success: false,
      error: 'Não foi possível identificar uma placa válida. Tente novamente com melhor iluminação ou digite manualmente.',
    };
  } catch (error) {
    console.error('Erro no OCR:', error);
    return {
      success: false,
      error: 'Erro ao processar a imagem. Tente novamente ou digite a placa manualmente.',
    };
  }
}

// Aplicar correções comuns de erros de OCR
function applyOCRCorrections(text: string): string {
  let corrected = text;
  
  // Correções comuns de caracteres confundidos pelo OCR
  const corrections: { [key: string]: string } = {
    '0': 'O', // Zero pode ser confundido com O nas primeiras 3 letras
    '1': 'I', // 1 pode ser confundido com I
    '5': 'S', // 5 pode ser confundido com S
    '8': 'B', // 8 pode ser confundido com B
    'Q': '0', // Q pode ser confundido com 0 nos números
    'O': '0', // O pode ser confundido com 0 nos números
    'I': '1', // I pode ser confundido com 1 nos números
    'Z': '2', // Z pode ser confundido com 2
    'S': '5', // S pode ser confundido com 5 nos números
    'B': '8', // B pode ser confundido com 8 nos números
  };

  // Aplicar correções nas primeiras 3 posições (devem ser letras)
  for (let i = 0; i < 3 && i < corrected.length; i++) {
    const char = corrected[i];
    if (/[0-9]/.test(char)) {
      // Se for número nas primeiras 3 posições, tentar converter para letra
      if (char === '0') corrected = replaceAt(corrected, i, 'O');
      else if (char === '1') corrected = replaceAt(corrected, i, 'I');
      else if (char === '5') corrected = replaceAt(corrected, i, 'S');
      else if (char === '8') corrected = replaceAt(corrected, i, 'B');
    }
  }

  // Aplicar correções nas posições de números (posição 3, 5, 6 para Mercosul ou 3-6 para antiga)
  if (corrected.length >= 7) {
    // Posição 3 deve ser número
    if (/[A-Z]/.test(corrected[3])) {
      if (corrected[3] === 'O') corrected = replaceAt(corrected, 3, '0');
      else if (corrected[3] === 'I') corrected = replaceAt(corrected, 3, '1');
      else if (corrected[3] === 'S') corrected = replaceAt(corrected, 3, '5');
      else if (corrected[3] === 'B') corrected = replaceAt(corrected, 3, '8');
    }
    
    // Posições 5 e 6 devem ser números
    for (let i = 5; i < 7 && i < corrected.length; i++) {
      if (/[A-Z]/.test(corrected[i])) {
        if (corrected[i] === 'O') corrected = replaceAt(corrected, i, '0');
        else if (corrected[i] === 'I') corrected = replaceAt(corrected, i, '1');
        else if (corrected[i] === 'S') corrected = replaceAt(corrected, i, '5');
        else if (corrected[i] === 'B') corrected = replaceAt(corrected, i, '8');
      }
    }
  }

  return corrected;
}

function replaceAt(str: string, index: number, replacement: string): string {
  return str.substring(0, index) + replacement + str.substring(index + 1);
}
