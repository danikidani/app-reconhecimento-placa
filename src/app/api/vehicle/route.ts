import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface VehicleData {
  plate: string;
  brand: string;
  model: string;
  year: string;
  stolen: boolean;
  auction: boolean;
  ipvaDebt: boolean;
  fines: boolean;
}

// Função para validar formato de placa
function isValidPlate(plate: string): boolean {
  const mercosulPattern = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
  const oldPattern = /^[A-Z]{3}[0-9]{4}$/;
  return mercosulPattern.test(plate) || oldPattern.test(plate);
}

// Função para consultar dados do veículo via BrasilAPI (gratuita)
async function consultBrasilAPI(plate: string): Promise<Partial<VehicleData>> {
  try {
    // BrasilAPI não tem endpoint de placa diretamente, mas podemos simular
    // Em produção, você usaria APIs pagas como Olho no Carro ou FipeAPI Pro
    
    // Simulação de resposta para demonstração
    // IMPORTANTE: Substitua por chamada real à API paga
    
    return {
      brand: 'Volkswagen',
      model: 'Gol',
      year: '2020',
    };
  } catch (error) {
    console.error('Erro ao consultar BrasilAPI:', error);
    throw error;
  }
}

// Função para consultar situação de roubo/furto
async function checkStolenStatus(plate: string): Promise<boolean> {
  try {
    // Em produção, consultar API oficial (ex: Olho no Carro API)
    // Simulação para demonstração
    
    // Exemplo de integração (descomente e configure quando tiver API key):
    /*
    const response = await axios.get(`https://api.olhonocarro.com.br/consulta/${plate}`, {
      headers: {
        'Authorization': `Bearer ${process.env.OLHO_NO_CARRO_API_KEY}`
      }
    });
    return response.data.stolen || false;
    */
    
    // Simulação: retorna false (não roubado)
    return false;
  } catch (error) {
    console.error('Erro ao verificar roubo/furto:', error);
    return false;
  }
}

// Função para consultar passagem por leilão
async function checkAuctionStatus(plate: string): Promise<boolean> {
  try {
    // Em produção, consultar API específica de leilões
    // Simulação para demonstração
    return false;
  } catch (error) {
    console.error('Erro ao verificar leilão:', error);
    return false;
  }
}

// Função para consultar débitos de IPVA
async function checkIPVADebt(plate: string): Promise<boolean> {
  try {
    // Em produção, consultar API estadual de IPVA
    // Simulação para demonstração
    return false;
  } catch (error) {
    console.error('Erro ao verificar IPVA:', error);
    return false;
  }
}

// Função para consultar multas pendentes
async function checkFines(plate: string): Promise<boolean> {
  try {
    // Em produção, consultar API de multas (Detran estadual)
    // Simulação para demonstração
    return false;
  } catch (error) {
    console.error('Erro ao verificar multas:', error);
    return false;
  }
}

export async function POST(request: NextRequest) {
  try {
    const { plate } = await request.json();

    if (!plate) {
      return NextResponse.json(
        { success: false, error: 'Placa não fornecida' },
        { status: 400 }
      );
    }

    const normalizedPlate = plate.toUpperCase().trim();

    if (!isValidPlate(normalizedPlate)) {
      return NextResponse.json(
        { success: false, error: 'Formato de placa inválido' },
        { status: 400 }
      );
    }

    // Consulta todas as informações em paralelo
    const [vehicleInfo, stolen, auction, ipvaDebt, fines] = await Promise.all([
      consultBrasilAPI(normalizedPlate),
      checkStolenStatus(normalizedPlate),
      checkAuctionStatus(normalizedPlate),
      checkIPVADebt(normalizedPlate),
      checkFines(normalizedPlate),
    ]);

    const vehicleData: VehicleData = {
      plate: normalizedPlate,
      brand: vehicleInfo.brand || 'Não identificado',
      model: vehicleInfo.model || 'Não identificado',
      year: vehicleInfo.year || 'Não identificado',
      stolen,
      auction,
      ipvaDebt,
      fines,
    };

    // Log da consulta (em produção, salvar no Supabase)
    console.log('Consulta realizada:', {
      plate: normalizedPlate,
      timestamp: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      data: vehicleData,
    });

  } catch (error) {
    console.error('Erro ao consultar veículo:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Erro ao consultar dados do veículo. Tente novamente.' 
      },
      { status: 500 }
    );
  }
}
