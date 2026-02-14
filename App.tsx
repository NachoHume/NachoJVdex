
import React, { useState, useEffect, useMemo } from 'react';
import { Game, AppView, SUPPORTED_CONSOLES, ConsoleStats } from './types';
import Layout from './components/Layout';
import GameCard from './components/GameCard';
import { searchGames, getIconicGamesByConsole } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const LOCAL_STORAGE_KEY = 'gamedex_v3_data';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DEX);
  const [myGames, setMyGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partial<Game>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeConsole, setActiveConsole] = useState<string>('Tous');
  const [activeFilter, setActiveFilter] = useState<'all' | 'owned' | 'wishlist'>('all');

  useEffect(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      try {
        setMyGames(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load local storage", e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(myGames));
  }, [myGames]);

  const handleUpdateStatus = (id: string, status: Game['status']) => {
    setMyGames(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  };

  const handleRemoveGame = (id: string) => {
    if (confirm("Supprimer cet élément de votre archive ?")) {
      setMyGames(prev => prev.filter(g => g.id !== id));
    }
  };

  const handleAddFromSearch = (gameData: Partial<Game>, initialStatus: Game['status'] = 'owned') => {
    const id = `${gameData.title}-${gameData.console}`.toLowerCase().replace(/[^\w-]/g, '-');
    if (myGames.find(g => g.id === id)) return;
    
    const newGame: Game = {
      id,
      title: gameData.title || 'Inconnu',
      console: gameData.console || 'Inconnu',
      releaseYear: gameData.releaseYear,
      genre: gameData.genre,
      status: initialStatus,
      description: gameData.description
    };
    
    setMyGames(prev => [...prev, newGame]);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    const results = await searchGames(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  const handleGetConsoleGames = async (consoleName: string) => {
    setIsSearching(true);
    const results = await getIconicGamesByConsole(consoleName);
    setSearchResults(results);
    setIsSearching(false);
  };

  const consoleStats = useMemo((): ConsoleStats[] => {
    const statsMap: Record<string, { total: number; owned: number; wishlist: number }> = {};
    myGames.forEach(g => {
      if (!statsMap[g.console]) statsMap[g.console] = { total: 0, owned: 0, wishlist: 0 };
      statsMap[g.console].total++;
      if (g.status === 'owned') statsMap[g.console].owned++;
      if (g.status === 'wishlist') statsMap[g.console].wishlist++;
    });
    return Object.entries(statsMap).map(([console, counts]) => ({
      console,
      ...counts
    })).sort((a, b) => b.total - a.total);
  }, [myGames]);

  const filteredMyGames = useMemo(() => {
    return myGames.filter(g => {
      const consoleMatch = activeConsole === 'Tous' || g.console === activeConsole;
      const statusMatch = activeFilter === 'all' || g.status === activeFilter;
      return consoleMatch && statusMatch;
    });
  }, [myGames, activeConsole, activeFilter]);

  const renderDex = () => (
    <div className="space-y-10">
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">Archive</h2>
          
          <div className="flex bg-[#1c1c1e] p-1 rounded-lg">
            {(['all', 'owned', 'wishlist'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeFilter === f ? 'bg-[#3a3a3c] text-white shadow-sm' : 'text-[#8e8e93] hover:text-white'
                }`}
              >
                {f === 'all' ? 'Tout' : f === 'owned' ? 'Possédé' : 'Souhaits'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto pb-2 no-scrollbar border-b border-[#1c1c1e]">
          <button 
            onClick={() => setActiveConsole('Tous')}
            className={`text-xs font-bold whitespace-nowrap transition-colors ${activeConsole === 'Tous' ? 'text-blue-500' : 'text-[#8e8e93] hover:text-white'}`}
          >
            Toutes Consoles
          </button>
          {Array.from(new Set(myGames.map(g => g.console))).sort().map(c => (
            <button 
              key={c}
              onClick={() => setActiveConsole(c)}
              className={`text-xs font-bold whitespace-nowrap transition-colors ${activeConsole === c ? 'text-blue-500' : 'text-[#8e8e93] hover:text-white'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filteredMyGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 border border-[#1c1c1e] rounded-3xl bg-[#000000]">
          <p className="text-[#48484a] font-medium text-sm">Aucun élément archivé</p>
          <button 
            onClick={() => setView(AppView.SEARCH)}
            className="mt-4 text-blue-500 font-bold text-xs hover:underline"
          >
            Commencer une recherche
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredMyGames.map(game => (
            <GameCard 
              key={game.id} 
              game={game} 
              onUpdateStatus={handleUpdateStatus} 
              onRemove={handleRemoveGame}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-12">
      <h2 className="text-3xl font-extrabold text-white tracking-tight">Recherche</h2>

      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Titre, plateforme, franchise..."
          className="w-full bg-[#1c1c1e] rounded-2xl px-6 py-5 text-white text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-[#48484a] font-medium"
        />
        <button 
          type="submit"
          className="absolute right-3 top-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          {isSearching ? '...' : 'Chercher'}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-widest px-1">Plateformes Suggerées</h3>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_CONSOLES.slice(0, 8).map(c => (
            <button 
              key={c}
              onClick={() => handleGetConsoleGames(c)}
              className="px-4 py-2 bg-[#1c1c1e] text-[#8e8e93] hover:text-white rounded-full text-[11px] font-bold transition-all border border-transparent hover:border-[#3a3a3c]"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isSearching && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-[#3a3a3c] border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {searchResults.length > 0 && !isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((res, i) => {
            const isAdded = myGames.some(g => g.title === res.title && g.console === res.console);
            return (
              <div key={i} className="bg-[#1c1c1e] rounded-2xl p-6 flex flex-col border border-transparent hover:border-[#3a3a3c] transition-all group">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{res.console}</span>
                  <span className="text-[10px] font-medium text-[#48484a]">{res.releaseYear}</span>
                </div>
                <h4 className="text-base font-bold text-white mb-4 line-clamp-1">{res.title}</h4>
                <p className="text-[#8e8e93] text-xs leading-relaxed mb-8 line-clamp-2">
                  {res.description}
                </p>
                <div className="mt-auto flex gap-2">
                  <button 
                    disabled={isAdded}
                    onClick={() => handleAddFromSearch(res, 'owned')}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                      isAdded 
                      ? 'bg-[#2c2c2e] text-[#48484a] cursor-default' 
                      : 'bg-white text-black hover:bg-gray-200'
                    }`}
                  >
                    {isAdded ? 'Dans l\'Archive' : '+ Collection'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  const renderStats = () => (
    <div className="space-y-12">
      <h2 className="text-3xl font-extrabold text-white tracking-tight">Analyses</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1c1c1e] rounded-3xl p-8">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-10 text-[#8e8e93]">Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consoleStats} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="console" type="category" stroke="#8e8e93" width={100} fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: '#2c2c2e'}}
                  contentStyle={{ backgroundColor: '#1c1c1e', borderRadius: '12px', border: '1px solid #3a3a3c', color: '#fff' }}
                />
                <Bar dataKey="owned" fill="#ffffff" radius={[0, 4, 4, 0]} barSize={12} name="Possédés" />
                <Bar dataKey="wishlist" fill="#3a3a3c" radius={[0, 4, 4, 0]} barSize={12} name="Souhaits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-[#1c1c1e] rounded-3xl p-8 flex flex-col items-center justify-center text-center">
           <div className="relative w-40 h-40 flex items-center justify-center mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="72" stroke="#2c2c2e" strokeWidth="8" fill="transparent" />
                <circle 
                  cx="80" cy="80" r="72" stroke="#ffffff" strokeWidth="8" fill="transparent"
                  strokeDasharray={452.4}
                  strokeDashoffset={452.4 - (452.4 * (myGames.filter(g => g.status === 'owned').length / (myGames.length || 1)))}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-white">
                  {Math.round((myGames.filter(g => g.status === 'owned').length / (myGames.length || 1)) * 100)}%
                </span>
                <span className="text-[10px] text-[#8e8e93] font-bold uppercase tracking-widest mt-1">Acquis</span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4 w-full">
              <div className="text-left p-3 bg-black/30 rounded-xl">
                 <p className="text-[9px] font-bold text-[#8e8e93] uppercase mb-1">Total</p>
                 <p className="text-xl font-bold text-white">{myGames.length}</p>
              </div>
              <div className="text-left p-3 bg-black/30 rounded-xl">
                 <p className="text-[9px] font-bold text-[#8e8e93] uppercase mb-1">Possédés</p>
                 <p className="text-xl font-bold text-white">{myGames.filter(g => g.status === 'owned').length}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-12 max-w-2xl">
      <h2 className="text-3xl font-extrabold text-white tracking-tight">Paramètres</h2>

      <div className="bg-[#1c1c1e] rounded-3xl p-8 space-y-10">
        <section>
          <h3 className="text-base font-bold text-white mb-2">Gestion des Données</h3>
          <p className="text-xs text-[#8e8e93] mb-8 leading-relaxed">
            Vos données sont conservées localement. Exportez une sauvegarde pour garantir la pérennité de votre archive.
          </p>
          <div className="flex flex-wrap gap-3">
            <button 
              onClick={() => {
                const blob = new Blob([JSON.stringify(myGames, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `archive-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
              }}
              className="bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all"
            >
              Exporter JSON
            </button>
            <label className="bg-[#2c2c2e] hover:bg-[#3a3a3c] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer">
              Importer
              <input type="file" className="hidden" accept=".json" onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      try {
                        const data = JSON.parse(event.target?.result as string);
                        if (Array.isArray(data)) { setMyGames(data); alert("Importation terminée."); }
                      } catch (err) { alert("Format invalide."); }
                    };
                    reader.readAsText(file);
                  }
              }} />
            </label>
          </div>
        </section>

        <section className="pt-8 border-t border-[#2c2c2e]">
          <h3 className="text-base font-bold text-red-500 mb-2">Actions Critiques</h3>
          <button 
            onClick={() => {
              if (confirm("Réinitialiser l'archive ? Cette action est irréversible.")) {
                setMyGames([]);
                localStorage.removeItem(LOCAL_STORAGE_KEY);
              }
            }}
            className="text-red-500/60 hover:text-red-500 text-xs font-bold transition-all"
          >
            Effacer tous les contenus archivés
          </button>
        </section>
      </div>
    </div>
  );

  return (
    <Layout currentView={view} setView={setView}>
      {view === AppView.DEX && renderDex()}
      {view === AppView.SEARCH && renderSearch()}
      {view === AppView.STATS && renderStats()}
      {view === AppView.SETTINGS && renderSettings()}
    </Layout>
  );
};

export default App;
