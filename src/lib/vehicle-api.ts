// Cliente API para consulta de informações do veículo

import { VehicleInfo } from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export async function getVehicleInfo(plate: string): Promise<VehicleInfo> {
  try {
    const response = await fetch(`${API_BASE_URL}/vehicle/${plate}`);
    
    if (!response.ok) {
      throw new Error('Erro ao consultar informações do veículo');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro na API:', error);
    
    // Retornar dados mockados para demonstração
    return getMockVehicleData(plate);
  }
}

// Dados mockados para demonstração (quando backend não está disponível)
function getMockVehicleData(plate: string): VehicleInfo {
  const hasTheft = Math.random() > 0.85;
  const hasAuction = Math.random() > 0.75;
  
  const mockData: VehicleInfo = {
    placa: plate,
    modelo: 'CIVIC',
    marca: 'HONDA',
    ano: 2022,
    cor: 'PRATA',
    chassi: '93HGJ8150MZ******',
    renavam: '00123456789',
    ipva: {
      status: Math.random() > 0.5 ? 'pago' : 'pendente',
      valor: 2450.00,
      vencimento: '2024-03-31',
    },
    licenciamento: {
      status: Math.random() > 0.3 ? 'regular' : 'vencido',
      vencimento: '2024-12-31',
    },
    multas: {
      quantidade: Math.floor(Math.random() * 5),
      valorTotal: Math.random() * 1000,
      detalhes: [
        {
          data: '2024-01-15',
          infracao: 'Excesso de velocidade',
          valor: 195.23,
          pontos: 5,
        },
        {
          data: '2024-02-20',
          infracao: 'Estacionamento irregular',
          valor: 130.16,
          pontos: 3,
        },
      ],
    },
    restricoes: Math.random() > 0.7 ? ['Alienação Fiduciária'] : [],
    situacao: Math.random() > 0.8 ? 'irregular' : 'regular',
    rouboFurto: {
      status: hasTheft ? 'registrado' : 'limpo',
      dataOcorrencia: hasTheft ? '2023-08-15' : undefined,
      boletim: hasTheft ? 'BO-2023-08-15-001234' : undefined,
      observacoes: hasTheft ? 'Veículo registrado como roubado em 15/08/2023. Não adquira este veículo.' : undefined,
    },
    leilao: {
      passouPorLeilao: hasAuction,
      dataLeilao: hasAuction ? '2021-05-20' : undefined,
      leiloeiro: hasAuction ? 'Leiloeiro Oficial SP' : undefined,
      observacoes: hasAuction ? 'Veículo adquirido em leilão público. Documentação regularizada.' : undefined,
    },
  };

  return mockData;
}
