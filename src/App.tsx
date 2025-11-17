import { useState, useEffect } from 'react';

import { StatusBar, Style } from '@capacitor/status-bar';
import { Home } from './components/Usuario/Home';
import { QRScanner } from './components/Usuario/QRScanner';
import { History } from './components/Usuario/History';
import { Profile } from './components/Usuario/Profile';
import { Rewards, Reward } from './components/Usuario/Rewards';
import { BottomNav } from './components/Usuario/BottomNav';
import { Toaster } from './components/ui/sonner';
import Login from './components/Login';
import PushNotificationsHandler from './components/PushNotificationsHandler';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isCheckingLogin, setIsCheckingLogin] = useState(true);
  const [currentView, setCurrentView] = useState<'home' | 'scan' | 'history' | 'profile' | 'rewards'>('home');
  const [balance, setBalance] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
  const configureStatusBar = async () => {
    try {
      if (typeof StatusBar !== 'undefined') {
        await StatusBar.setOverlaysWebView({ overlay: false });
        
        if (theme === 'light') {
          // Modo claro: texto oscuro sobre fondo claro
          await StatusBar.setStyle({ style: Style.Dark });
          await StatusBar.setBackgroundColor({ color: '#a4a4a4ff' });
        } else {
          // Modo oscuro: texto claro sobre fondo oscuro  
          await StatusBar.setStyle({ style: Style.Light });
          await StatusBar.setBackgroundColor({ color: '#121f2f' });
        }
      }
    } catch (error) {
      console.log('StatusBar not available in web environment');
    }
  };

  configureStatusBar();
}, [theme]);

  useEffect(() => {
    const detectSystemTheme = () => {
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
      } else {
        setTheme('light');
      }
    };

    detectSystemTheme();

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleThemeChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handleThemeChange);

    return () => mediaQuery.removeEventListener('change', handleThemeChange);
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      // Actualizar theme-color para meta tags
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#121f2f');
    } else {
      document.documentElement.classList.remove('dark');
      const metaTheme = document.querySelector('meta[name="theme-color"]');
      if (metaTheme) metaTheme.setAttribute('content', '#c6d4cc');
    }
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const usuarioId = localStorage.getItem("usuario_id");
    if (usuarioId) setIsLoggedIn(true);
    setIsCheckingLogin(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("usuario_id");
    setIsLoggedIn(false);
  };

  const handleRedeem = (reward: Reward) => {
    setBalance(prev => prev - reward.points);
  };

  const handleScanSuccess = (transaction: { type: 'scan'; points: number; description: string; location?: string }) => {
    setBalance(prev => prev + transaction.points);
  };

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <Home onNavigateToRewards={() => setCurrentView('rewards')} />;
      case 'scan':
        return <QRScanner onScanSuccess={handleScanSuccess} />;
      case 'history':
        return <History />;
      case 'profile':
        return (
          <Profile
            onLogout={handleLogout}
            theme={theme}
            onToggleTheme={handleToggleTheme}
          />
        );
      case 'rewards':
        return <Rewards balance={balance} onRedeem={handleRedeem} />;
      default:
        return <Home onNavigateToRewards={() => setCurrentView('rewards')} />;
    }
  };

  if (isCheckingLogin)
    return (
      <div className="flex items-center justify-center h-screen text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-900 safe-area-inset-top safe-area-inset-bottom">
        Cargando...
      </div>
    );

  if (!isLoggedIn)
    return (
      <Login
        onLoginSuccess={(usuarioId: string) => {
          localStorage.setItem("usuario_id", usuarioId);
          setIsLoggedIn(true);
        }}
      />
    );

  return (
    <>
      {/* Estilos optimizados para safe areas */}
      <style>
        {`
          /* Reset seguro para altura completa */
          html, body, #root {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
          }
          
          /* Contenedor principal que respeta safe areas */
          .app-main-container {
            height: 100vh;
            height: 100dvh; /* Altura dinámica para móviles */
            
            flex-direction: column;
            padding-top: env(safe-area-inset-top);
            padding-bottom: env(safe-area-inset-bottom);
            padding-left: env(safe-area-inset-left);
            padding-right: env(safe-area-inset-right);
          }
          
          /* Contenido scrollable que ocupa el espacio disponible */
          .scrollable-container {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none; /* Firefox */
            -ms-overflow-style: none; /* IE/Edge */
          }
          
          .scrollable-container::-webkit-scrollbar {
            display: none; /* Chrome/Safari */
          }
          
          /* Navigation bar fija que respeta safe area inferior */
          .nav-container {
            padding-bottom: env(safe-area-inset-bottom);
            background: inherit;
          }
          
          /* Asegurar que el contenido no se esconda bajo notch */
          .safe-top {
            padding-top: env(safe-area-inset-top);
          }
          
          .safe-bottom {
            padding-bottom: env(safe-area-inset-bottom);
          }
        `}
      </style>

      <div className="app-main-container bg-gradient-to-b from-emerald-50 dark:from-gray-900 dark:to-gray-800">
        <PushNotificationsHandler />

        <div className="max-w-md mx-auto h-full flex flex-col shadow-xl dark:shadow-gray-900 bg-white dark:bg-gray-900 relative">
          {/* Contenido principal CON scroll y safe area superior */}
          <div className="scrollable-container safe-top">
            {renderView()}
          </div>

          {/* Navigation bar fija con safe area inferior */}
          <div className="nav-container bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <BottomNav currentView={currentView} onNavigate={setCurrentView} />
          </div>
        </div>

        <Toaster />
      </div>
    </>
  );
}