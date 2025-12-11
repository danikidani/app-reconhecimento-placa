import { NextRequest, NextResponse } from 'next/server';
import Tesseract from 'tesseract.js';

// Função para normalizar caracteres comuns de OCR
function normalizePlate(text: string): string {
  // Remove espaços e caracteres especiais
  let normalized = text.replace(/[^A-Z0-9]/g, '').toUpperCase();
  
  // Correções comuns de OCR
  const corrections: { [key: string]: string } = {
    'O': '0',
    'I': '1',
    'L': '1',
    'S': '5',
    'Z': '2',
    'B': '8',
    'G': '6',
  };

  // Aplica correções baseadas na posição
  // Posições 0-2: devem ser letras
  // Posição 3: deve ser número
  // Posição 4: pode ser letra ou número (Mercosul)
  // Posições 5-6: devem ser números
  
  if (normalized.length >= 7) {
    let result = '';
    for (let i = 0; i < normalized.length && i < 7; i++) {
      let char = normalized[i];
      
      if (i < 3) {
        // Primeiras 3 posições: forçar letras
        if (/[0-9]/.test(char)) {
          // Converter números em letras similares
          const numToLetter: { [key: string]: string } = {
            '0': 'O', '1': 'I', '2': 'Z', '5': 'S', '6': 'G', '8': 'B'
          };
          char = numToLetter[char] || char;
        }
      } else if (i === 3 || i >= 5) {
        // Posições 3, 5, 6: forçar números
        if (/[A-Z]/.test(char)) {
          char = corrections[char] || char;
        }
      }
      // Posição 4: pode ser letra ou número (Mercosul)
      
      result += char;
    }
    return result;
  }
  
  return normalized;
}

// Função para validar formato de placa
function isValidPlate(plate: string): boolean {
  // Placa Mercosul: ABC1D23
  const mercosulPattern = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
  // Placa antiga: ABC1234
  const oldPattern = /^[A-Z]{3}[0-9]{4}$/;
  
  return mercosulPattern.test(plate) || oldPattern.test(plate);
}

// Função para extrair placa de texto OCR
function extractPlate(text: string): string | null {
  const lines = text.split('\n');
  
  for (const line of lines) {
    const normalized = normalizePlate(line);
    
    // Tenta encontrar sequência de 7 caracteres
    if (normalized.length >= 7) {
      const candidate = normalized.substring(0, 7);
      if (isValidPlate(candidate)) {
        return candidate;
      }
    }
  }
  
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const { image } = await request.json();

    if (!image) {
      return NextResponse.json(
        { success: false, error: 'Imagem não fornecida' },
        { status: 400 }
      );
    }

    // Verifica se é uma imagem base64 válida
    if (!image.startsWith('data:image/')) {
      return NextResponse.json(
        { success: false, error: 'Formato de imagem inválido' },
        { status: 400 }
      );
    }

    // Processa a imagem com Tesseract.js
    const result = await Tesseract.recognize(
      image,
      'eng',
      {
        logger: (m) => {
          if (m.status === 'recognizing text') {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      }
    );

    const text = result.data.text;
    console.log('OCR Raw Text:', text);

    // Extrai a placa do texto
    const plate = extractPlate(text);

    if (!plate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Não foi possível identificar a placa. Tente uma imagem mais nítida ou digite manualmente.' 
        },
        { status: 400 }
      );
    }

    console.log('Placa identificada:', plate);

    return NextResponse.json({
      success: true,
      plate: plate,
      confidence: result.data.confidence,
    });

  } catch (error) {
    console.error('Erro no OCR:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao processar imagem. Tente novamente ou digite a placa manualmente.' 
      },
      { status: 500 }
    );
  }
}
