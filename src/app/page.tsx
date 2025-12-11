"use client";

import { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, Keyboard, Scan, AlertCircle, Loader2, CheckCircle, XCircle, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [captureMode, setCaptureMode] = useState<'none' | 'camera' | 'upload' | 'manual'>('none');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [manualPlate, setManualPlate] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const processPlate = async (plate: string) => {
    setIsProcessing(true);
    setError(null);

    try {
      const response = await fetch('/api/vehicle', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plate }),
      });

      const data = await response.json();

      if (data.success) {
        sessionStorage.setItem('vehicleData', JSON.stringify(data.data));
        router.push('/results');
      } else {
        setError(data.error || 'Erro ao consultar veículo');
      }
    } catch (err) {
      setError('Erro ao processar consulta. Tente novamente.');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCapture = async () => {
    if (!webcamRef.current) {
      setError('Câmera não está pronta. Aguarde um momento.');
      return;
    }

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError('Não foi possível capturar a imagem. Tente novamente.');
        return;
      }

      setIsProcessing(true);
      setError(null);

      const response = await fetch('/api/ocr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageSrc }),
      });

      const data = await response.json();

      if (data.success && data.plate) {
        await processPlate(data.plate);
      } else {
        setError(data.error || 'Não foi possível reconhecer a placa. Tente novamente ou digite manualmente.');
        setIsProcessing(false);
      }
    } catch (err) {
      setError('Erro ao processar imagem. Tente novamente.');
      console.error(err);
      setIsProcessing(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Por favor, selecione uma imagem válida');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 10MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      const imageSrc = e.target?.result as string;
      setUploadedImage(imageSrc);
      setCaptureMode('upload');
      setIsProcessing(true);
      setError(null);

      try {
        const response = await fetch('/api/ocr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageSrc }),
        });

        const data = await response.json();

        if (data.success && data.plate) {
          await processPlate(data.plate);
        } else {
          setError(data.error || 'Não foi possível reconhecer a placa. Tente novamente ou digite manualmente.');
          setIsProcessing(false);
        }
      } catch (err) {
        setError('Erro ao processar imagem. Tente novamente.');
        console.error(err);
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleManualSubmit = () => {
    const plate = manualPlate.trim().toUpperCase();
    const plateRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;

    if (!plateRegex.test(plate)) {
      setError('Formato de placa inválido. Use: ABC1D23 ou ABC1234');
      return;
    }

    processPlate(plate);
  };

  const resetCapture = () => {
    setCaptureMode('none');
    setUploadedImage(null);
    setError(null);
    setManualPlate('');
    setIsProcessing(false);
    setIsCameraReady(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleCameraClick = () => {
    setError(null);
    setCaptureMode('camera');
    setIsCameraReady(false);
  };

  const handleUploadClick = () => {
    setError(null);
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-900">
      {/* Header com logo estilizada */}
      <div className="bg-[#0F4C75] backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center justify-center gap-3">
            {/* Logo com lupa estilizada */}
            <div className="w-12 h-12 bg-[#0F4C75] rounded-2xl flex items-center justify-center shadow-2xl relative">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g transform="translate(24, 24)">
                  <circle cx="-2" cy="-2" r="8" stroke="white" stroke-width="2" fill="none"/>
                  <line x1="-2" y1="-6" x2="-2" y2="2" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                  <line x1="-6" y1="-2" x2="2" y2="-2" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                  <line x1="4" y1="4" x2="10" y2="10" stroke="white" stroke-width="2" stroke-linecap="round"/>
                </g>
              </svg>
            </div>
            <h1 className="text-4xl font-bold text-white tracking-tight">REVELA</h1>
          </div>
          <p className="text-center text-blue-200 mt-2 text-sm">
            Consulta Inteligente de Veículos
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {captureMode === 'none' && (
          <>
            {/* Hero Section */}
            <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
              <h2 className="text-3xl font-bold text-white mb-4">
                Revele Informações do Veículo
              </h2>
              <p className="text-blue-100 text-lg mb-6">
                Capture a placa, faça upload de uma foto ou digite manualmente para consultar dados públicos do veículo
              </p>
              <div className="flex items-center justify-center gap-2 text-yellow-300 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>Certifique-se de que a placa esteja bem iluminada e legível</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid sm:grid-cols-3 gap-4">
              <button
                onClick={handleCameraClick}
                className="group bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white p-8 rounded-2xl shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Camera className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Usar Câmera</h3>
                <p className="text-sm text-blue-100">Capture em tempo real</p>
              </button>

              <button
                onClick={handleUploadClick}
                className="group bg-gradient-to-br from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white p-8 rounded-2xl shadow-2xl hover:shadow-purple-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Upload className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Carregar Foto</h3>
                <p className="text-sm text-purple-100">Escolha da galeria</p>
              </button>

              <button
                onClick={() => setCaptureMode('manual')}
                className="group bg-gradient-to-br from-green-600 to-teal-600 hover:from-green-700 hover:to-teal-700 text-white p-8 rounded-2xl shadow-2xl hover:shadow-green-500/50 transition-all duration-300 transform hover:scale-105"
              >
                <Keyboard className="w-12 h-12 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                <h3 className="text-xl font-bold mb-2">Digitar Placa</h3>
                <p className="text-sm text-green-100">Inserir manualmente</p>
              </button>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Tips */}
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Iluminação</h3>
                <p className="text-sm text-blue-100">Evite sombras e reflexos</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Ângulo</h3>
                <p className="text-sm text-blue-100">Capture de frente</p>
              </div>
              <div className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                <CheckCircle className="w-6 h-6 text-green-400 mb-2" />
                <h3 className="font-semibold text-white mb-1">Qualidade</h3>
                <p className="text-sm text-blue-100">Imagem nítida e clara</p>
              </div>
            </div>
          </>
        )}

        {/* Camera Mode */}
        {captureMode === 'camera' && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              {!isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
                  <div className="text-center">
                    <Loader2 className="w-12 h-12 text-white animate-spin mx-auto mb-4" />
                    <p className="text-white font-semibold">Iniciando câmera...</p>
                  </div>
                </div>
              )}
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                className="w-full h-full object-cover"
                videoConstraints={{
                  facingMode: 'environment',
                  width: { ideal: 1920 },
                  height: { ideal: 1080 },
                }}
                onUserMedia={() => setIsCameraReady(true)}
                onUserMediaError={(err) => {
                  console.error('Erro ao acessar câmera:', err);
                  setError('Não foi possível acessar a câmera. Verifique as permissões.');
                  setIsCameraReady(false);
                }}
              />
              {isCameraReady && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="border-4 border-blue-500 rounded-2xl w-80 h-32 shadow-2xl">
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                      Posicione a placa aqui
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 bg-gray-50 space-y-4">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900">Erro</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleCapture}
                  disabled={isProcessing || !isCameraReady}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Processando...
                    </>
                  ) : !isCameraReady ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Aguarde...
                    </>
                  ) : (
                    <>
                      <Camera className="w-5 h-5" />
                      Capturar e Revelar
                    </>
                  )}
                </button>
                <button
                  onClick={resetCapture}
                  disabled={isProcessing}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Upload Mode */}
        {captureMode === 'upload' && uploadedImage && (
          <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="relative aspect-video bg-gray-900">
              <img src={uploadedImage} alt="Imagem carregada" className="w-full h-full object-contain" />
            </div>

            <div className="p-6 bg-gray-50 space-y-4">
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900">Erro</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4 flex items-center gap-3">
                  <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                  <p className="text-blue-900 font-semibold">Processando imagem...</p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={resetCapture}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  <Upload className="w-5 h-5" />
                  Nova Captura
                </button>
                <button
                  onClick={resetCapture}
                  disabled={isProcessing}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Manual Input Mode */}
        {captureMode === 'manual' && (
          <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6">
            <div className="text-center">
              <Keyboard className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
              <h3 className="text-3xl font-bold text-gray-900 mb-2">Digite a Placa</h3>
              <p className="text-gray-600">Formato: ABC1D23 (Mercosul) ou ABC1234 (antiga)</p>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="plate-input" className="block text-sm font-bold text-gray-700 mb-2">
                  Placa do Veículo
                </label>
                <input
                  id="plate-input"
                  type="text"
                  value={manualPlate}
                  onChange={(e) => {
                    const value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                    if (value.length <= 7) {
                      setManualPlate(value);
                      setError(null);
                    }
                  }}
                  placeholder="ABC1D23"
                  maxLength={7}
                  className="w-full px-6 py-5 text-3xl font-bold text-center uppercase border-2 border-gray-300 rounded-xl focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100 outline-none transition-all"
                />
                <p className="text-sm text-gray-500 mt-2 text-center">
                  {manualPlate.length}/7 caracteres
                </p>
              </div>

              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 flex items-start gap-3">
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-red-900">Erro</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={handleManualSubmit}
                  disabled={manualPlate.length !== 7 || isProcessing}
                  className="flex-1 bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-bold hover:from-green-700 hover:to-teal-700 transition-all duration-300 shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Consultando...
                    </>
                  ) : (
                    <>
                      <Scan className="w-5 h-5" />
                      Revelar Veículo
                    </>
                  )}
                </button>
                <button
                  onClick={resetCapture}
                  disabled={isProcessing}
                  className="px-6 py-4 bg-gray-200 text-gray-700 rounded-xl font-bold hover:bg-gray-300 transition-all disabled:opacity-50"
                >
                  Voltar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
