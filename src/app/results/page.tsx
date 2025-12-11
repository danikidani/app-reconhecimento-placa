"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Car, CheckCircle, XCircle, AlertTriangle, Calendar, Shield, DollarSign, FileText, ArrowLeft, Loader2 } from 'lucide-react';

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

export default function ResultsPage() {
  const [vehicleData, setVehicleData] = useState<VehicleData | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const data = sessionStorage.getItem('vehicleData');
    if (data) {
      setVehicleData(JSON.parse(data));
      setLoading(false);
    } else {
      router.push('/');
    }
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-4" />
          <p className="text-white text-xl">Carregando resultados...</p>
        </div>
      </div>
    );
  }

  if (!vehicleData) return null;

  const StatusCard = ({ 
    icon: Icon, 
    title, 
    status, 
    positive 
  }: { 
    icon: any; 
    title: string; 
    status: boolean; 
    positive?: boolean 
  }) => {
    const isGood = positive ? status : !status;
    return (
      <div className={`bg-white rounded-2xl p-6 shadow-xl border-2 ${isGood ? 'border-green-200' : 'border-red-200'}`}>
        <div className="flex items-start justify-between mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isGood ? 'bg-green-100' : 'bg-red-100'}`}>
            <Icon className={`w-6 h-6 ${isGood ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          {isGood ? (
            <CheckCircle className="w-8 h-8 text-green-500" />
          ) : (
            <XCircle className="w-8 h-8 text-red-500" />
          )}
        </div>
        <h3 className="font-bold text-gray-900 text-lg mb-2">{title}</h3>
        <p className={`text-2xl font-bold ${isGood ? 'text-green-600' : 'text-red-600'}`}>
          {status ? 'Sim' : 'Não'}
        </p>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/30 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white hover:text-blue-300 transition-colors mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold">Nova Consulta</span>
          </button>
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Resultados da Consulta</h1>
            <p className="text-blue-200">Informações públicas do veículo</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
        {/* Vehicle Info Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-8 shadow-2xl text-white">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Car className="w-10 h-10" />
            </div>
            <div>
              <h2 className="text-3xl font-bold">{vehicleData.brand} {vehicleData.model}</h2>
              <p className="text-blue-100 text-lg">Ano: {vehicleData.year}</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 inline-block">
            <p className="text-sm text-blue-100 mb-1">Placa</p>
            <p className="text-3xl font-bold tracking-wider">{vehicleData.plate}</p>
          </div>
        </div>

        {/* Status Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatusCard
            icon={Shield}
            title="Roubo/Furto"
            status={vehicleData.stolen}
            positive={false}
          />
          <StatusCard
            icon={AlertTriangle}
            title="Passagem por Leilão"
            status={vehicleData.auction}
            positive={false}
          />
          <StatusCard
            icon={DollarSign}
            title="Débitos de IPVA"
            status={vehicleData.ipvaDebt}
            positive={false}
          />
          <StatusCard
            icon={FileText}
            title="Multas Pendentes"
            status={vehicleData.fines}
            positive={false}
          />
        </div>

        {/* Summary Card */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-indigo-600" />
            Resumo da Situação
          </h3>
          <div className="space-y-4">
            {!vehicleData.stolen && !vehicleData.auction && !vehicleData.ipvaDebt && !vehicleData.fines ? (
              <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6 flex items-start gap-4">
                <CheckCircle className="w-8 h-8 text-green-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-green-900 text-xl mb-2">Veículo Regular</h4>
                  <p className="text-green-700">
                    Este veículo não possui pendências identificadas nas bases consultadas. 
                    Todos os indicadores estão positivos.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 flex items-start gap-4">
                <AlertTriangle className="w-8 h-8 text-yellow-600 flex-shrink-0" />
                <div>
                  <h4 className="font-bold text-yellow-900 text-xl mb-2">Atenção Necessária</h4>
                  <p className="text-yellow-700 mb-4">
                    Este veículo possui uma ou mais pendências. Verifique os detalhes acima.
                  </p>
                  <ul className="space-y-2">
                    {vehicleData.stolen && (
                      <li className="flex items-center gap-2 text-red-700 font-semibold">
                        <XCircle className="w-5 h-5" />
                        Consta como roubado/furtado
                      </li>
                    )}
                    {vehicleData.auction && (
                      <li className="flex items-center gap-2 text-orange-700 font-semibold">
                        <XCircle className="w-5 h-5" />
                        Possui histórico de leilão
                      </li>
                    )}
                    {vehicleData.ipvaDebt && (
                      <li className="flex items-center gap-2 text-red-700 font-semibold">
                        <XCircle className="w-5 h-5" />
                        Possui débitos de IPVA
                      </li>
                    )}
                    {vehicleData.fines && (
                      <li className="flex items-center gap-2 text-red-700 font-semibold">
                        <XCircle className="w-5 h-5" />
                        Possui multas pendentes
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <p className="text-sm text-blue-100 text-center">
            <strong className="text-white">Aviso:</strong> As informações apresentadas são baseadas em consultas a bases públicas 
            e podem não refletir a situação mais atualizada do veículo. Para informações oficiais, 
            consulte os órgãos competentes (Detran, Polícia Federal, etc.).
          </p>
        </div>

        {/* Action Button */}
        <div className="text-center">
          <button
            onClick={() => {
              sessionStorage.removeItem('vehicleData');
              router.push('/');
            }}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Fazer Nova Consulta
          </button>
        </div>
      </div>
    </div>
  );
}
