// Tipos do sistema de reconhecimento de placas

export interface VehicleInfo {
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  cor: string;
  chassi: string;
  renavam: string;
  ipva: {
    status: 'pago' | 'pendente' | 'isento';
    valor: number;
    vencimento: string;
  };
  licenciamento: {
    status: 'regular' | 'vencido' | 'pendente';
    vencimento: string;
  };
  multas: {
    quantidade: number;
    valorTotal: number;
    detalhes: Array<{
      data: string;
      infracao: string;
      valor: number;
      pontos: number;
    }>;
  };
  restricoes: string[];
  situacao: 'regular' | 'irregular' | 'bloqueado';
  rouboFurto: {
    status: 'limpo' | 'registrado' | 'recuperado';
    dataOcorrencia?: string;
    boletim?: string;
    observacoes?: string;
  };
  leilao: {
    passouPorLeilao: boolean;
    dataLeilao?: string;
    leiloeiro?: string;
    observacoes?: string;
  };
}

export interface PlateValidation {
  isValid: boolean;
  format: 'mercosul' | 'antiga' | 'invalida';
  normalized: string;
}
