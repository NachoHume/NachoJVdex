
import React from 'react';
import { AppView } from '../types';

interface LayoutProps {
  currentView: AppView;
  setView: (view: AppView) => void;
  children: React.ReactNode;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const Layout: React.FC<LayoutProps> = ({ currentView, setView, children, theme, toggleTheme }) => {
  return (
    <div className={`flex flex-col md:flex-row min-h-screen transition-colors duration-300 ${theme === 'light' ? 'bg-white text-gray-900' : 'bg-black text-white'}`}>
      {/* Sidebar - Apple Navigation Style */}
      <nav className={`w-full md:w-64 border-r p-6 flex flex-col gap-10 sticky top-0 h-auto md:h-screen z-20 transition-colors duration-300 ${theme === 'light' ? 'bg-[#f5f5f7] border-gray-200' : 'glass border-[#38383a]'}`}>
        <div className="px-2 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Archive
          </h1>
          
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-all ${theme === 'light' ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'bg-[#1c1c1e] text-[#8e8e93] hover:text-white'}`}
            title={theme === 'light' ? 'Passer en mode sombre' : 'Passer en mode clair'}
          >
            {theme === 'light' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 9H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
            )}
          </button>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          <NavItem 
            active={currentView === AppView.DEX} 
            onClick={() => setView(AppView.DEX)} 
            icon={<path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 14a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />}
            label="Collection" 
            theme={theme}
          />
          <NavItem 
            active={currentView === AppView.CATALOGUE} 
            onClick={() => setView(AppView.CATALOGUE)} 
            icon={<path d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />}
            label="Catalogues" 
            theme={theme}
          />
          <NavItem 
            active={currentView === AppView.SEARCH} 
            onClick={() => setView(AppView.SEARCH)} 
            icon={<path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />}
            label="Découvrir" 
            theme={theme}
          />
          <NavItem 
            active={currentView === AppView.STATS} 
            onClick={() => setView(AppView.STATS)} 
            icon={<path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />}
            label="Analyses" 
            theme={theme}
          />
        </div>

        <div className={`pt-4 border-t transition-colors duration-300 ${theme === 'light' ? 'border-gray-200' : 'border-[#38383a]'}`}>
           <button 
            onClick={() => setView(AppView.SETTINGS)}
            className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-all ${
              currentView === AppView.SETTINGS 
              ? theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-[#3a3a3c] text-white' 
              : theme === 'light' ? 'text-gray-500 hover:text-gray-900' : 'text-[#8e8e93] hover:text-white'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            <span className="font-medium text-xs">Paramètres</span>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-12">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
};

const NavItem: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string; theme: 'dark' | 'light' }> = ({ 
  active, onClick, icon, label, theme 
}) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all text-left ${
      active 
      ? 'bg-blue-600 text-white shadow-lg' 
      : theme === 'light' 
        ? 'text-gray-500 hover:bg-gray-200 hover:text-gray-900' 
        : 'text-[#8e8e93] hover:bg-[#2c2c2e] hover:text-white'
    }`}
  >
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      {icon}
    </svg>
    <span className="font-semibold text-sm tracking-tight">{label}</span>
  </button>
);

export default Layout;
