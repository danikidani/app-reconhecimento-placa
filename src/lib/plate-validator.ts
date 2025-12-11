// Validação de placas brasileiras (Mercosul e formato antigo)

import { PlateValidation } from './types';

export function validateBrazilianPlate(plate: string): PlateValidation {
  // Remove espaços e caracteres especiais
  const normalized = plate.toUpperCase().replace(/[^A-Z0-9]/g, '');

  // Padrão Mercosul: ABC1D23 (3 letras, 1 número, 1 letra, 2 números)
  const mercosulPattern = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;
  
  // Padrão antigo: ABC1234 (3 letras, 4 números)
  const oldPattern = /^[A-Z]{3}[0-9]{4}$/;

  if (mercosulPattern.test(normalized)) {
    return {
      isValid: true,
      format: 'mercosul',
      normalized: formatPlate(normalized, 'mercosul')
    };
  }

  if (oldPattern.test(normalized)) {
    return {
      isValid: true,
      format: 'antiga',
      normalized: formatPlate(normalized, 'antiga')
    };
  }

  return {
    isValid: false,
    format: 'invalida',
    normalized
  };
}

function formatPlate(plate: string, format: 'mercosul' | 'antiga'): string {
  if (format === 'mercosul') {
    // ABC1D23 -> ABC-1D23
    return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  } else {
    // ABC1234 -> ABC-1234
    return `${plate.slice(0, 3)}-${plate.slice(3)}`;
  }
}

export function cleanPlateText(text: string): string {
  // Remove caracteres comuns de OCR incorreto
  return text
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .replace(/O/g, '0') // O -> 0
    .replace(/I/g, '1') // I -> 1
    .replace(/S/g, '5') // S -> 5 (em alguns casos)
    .replace(/Z/g, '2') // Z -> 2 (em alguns casos)
    .trim();
}
