import { Home, QrCode, Gift, User } from 'lucide-react';

interface BottomNavProps {
  currentView: 'home' | 'scan' | 'history' | 'profile' | 'rewards';
  onNavigate: (view: 'home' | 'scan' | 'history' | 'profile' | 'rewards') => void;
}

export function BottomNav({ currentView, onNavigate }: BottomNavProps) {
  const navItems = [
    { id: 'home' as const, icon: Home, label: 'Inicio' },
    { id: 'scan' as const, icon: QrCode, label: 'Escanear' },
    { id: 'rewards' as const, icon: Gift, label: 'Premios' },
    { id: 'profile' as const, icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 max-w-md mx-auto">
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="grid grid-cols-4 h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex flex-col items-center justify-center gap-1 transition-colors ${
                  isActive 
                    ?'text-emerald-600 dark:text-emerald-400' 
                    : 'text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 ${isActive ?  'fill-emerald-100 dark:fill-emerald-900' : ''}`} />
                <span className="text-xs">{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
