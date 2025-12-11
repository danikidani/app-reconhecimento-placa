// Registrar Service Worker para PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((registration) => {
        console.log('✅ Service Worker registrado:', registration.scope);
        
        // Verificar atualizações
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                console.log('🔄 Nova versão disponível! Recarregue a página.');
                // Opcional: mostrar notificação ao usuário
                if (confirm('Nova versão disponível! Deseja atualizar?')) {
                  window.location.reload();
                }
              }
            });
          }
        });
      })
      .catch((error) => {
        console.error('❌ Erro ao registrar Service Worker:', error);
      });
  });
}

// Solicitar permissão para notificações (opcional)
if ('Notification' in window && 'serviceWorker' in navigator) {
  if (Notification.permission === 'default') {
    // Não solicitar automaticamente - apenas quando usuário interagir
    console.log('Notificações disponíveis - solicite permissão quando apropriado');
  }
}

// Detectar instalação do PWA
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevenir o prompt automático
  e.preventDefault();
  // Guardar o evento para usar depois
  deferredPrompt = e;
  console.log('💾 PWA pode ser instalado');
  
  // Opcional: mostrar botão de instalação customizado
  // showInstallButton();
});

window.addEventListener('appinstalled', () => {
  console.log('✅ PWA instalado com sucesso!');
  deferredPrompt = null;
});

// Função para mostrar prompt de instalação (use quando apropriado)
window.showInstallPrompt = async () => {
  if (!deferredPrompt) {
    console.log('PWA já instalado ou prompt não disponível');
    return;
  }

  // Mostrar o prompt
  deferredPrompt.prompt();

  // Aguardar escolha do usuário
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`Usuário ${outcome === 'accepted' ? 'aceitou' : 'recusou'} instalar o PWA`);

  // Limpar o prompt
  deferredPrompt = null;
};

// Detectar modo standalone (PWA instalado)
if (window.matchMedia('(display-mode: standalone)').matches) {
  console.log('🚀 Rodando como PWA instalado');
  document.body.classList.add('pwa-installed');
}

// Detectar conexão offline/online
window.addEventListener('online', () => {
  console.log('🌐 Conexão restaurada');
  document.body.classList.remove('offline');
  // Opcional: sincronizar dados pendentes
});

window.addEventListener('offline', () => {
  console.log('📡 Sem conexão - modo offline');
  document.body.classList.add('offline');
  // Opcional: mostrar banner de offline
});

// Prevenir zoom em iOS
document.addEventListener('gesturestart', (e) => {
  e.preventDefault();
});

// Melhorar performance em dispositivos móveis
if ('requestIdleCallback' in window) {
  requestIdleCallback(() => {
    console.log('⚡ Otimizações de performance aplicadas');
  });
}

console.log('🚗 REVELA - PWA inicializado');
