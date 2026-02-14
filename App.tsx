
import React, { useState, useEffect, useMemo } from 'react';
import { Game, AppView, SUPPORTED_CONSOLES, ConsoleStats } from './types';
import Layout from './components/Layout';
import GameCard from './components/GameCard';
import GameDetails from './components/GameDetails';
import { searchGames, getIconicGamesByConsole, getFullsetList, getGameMetadata } from './services/geminiService';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const LOCAL_STORAGE_KEY = 'gamedex_v3_data';
const THEME_STORAGE_KEY = 'gamedex_theme';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.DEX);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [myGames, setMyGames] = useState<Game[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Partial<Game>[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [activeConsole, setActiveConsole] = useState<string>('Tous');
  const [activeFilter, setActiveFilter] = useState<'all' | 'owned' | 'wishlist'>('all');

  // Selected Game State
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Catalogue State
  const [catalogueConsole, setCatalogueConsole] = useState<string>('');
  const [catalogueGames, setCatalogueGames] = useState<Partial<Game>[]>([]);
  const [isLoadingCatalogue, setIsLoadingCatalogue] = useState(false);

  useEffect(() => {
    const savedData = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedData) {
      try {
        setMyGames(JSON.parse(savedData));
      } catch (e) {
        console.error("Failed to load local storage", e);
      }
    }
    const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as 'dark' | 'light';
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(myGames));
    if (selectedGame) {
      const updated = myGames.find(g => g.id === selectedGame.id);
      if (updated && updated.status !== selectedGame.status) {
        setSelectedGame(updated);
      }
    }
  }, [myGames, selectedGame]);

  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');

  const handleUpdateStatus = (id: string, status: Game['status']) => {
    setMyGames(prev => {
      const exists = prev.find(g => g.id === id);
      if (exists) {
        return prev.map(g => g.id === id ? { ...g, status } : g);
      } else if (selectedGame && selectedGame.id === id) {
        return [...prev, { ...selectedGame, status }];
      }
      return prev;
    });
  };

  const handleSelectGame = async (gameData: Partial<Game>) => {
    setIsLoadingDetails(true);
    const id = `${gameData.title}-${gameData.console}`.toLowerCase().replace(/[^\w-]/g, '-');
    const existing = myGames.find(g => g.id === id);
    
    const metadata = await getGameMetadata(gameData.title || '', gameData.console || '');
    
    const gameToSelect: Game = {
      id,
      title: gameData.title || metadata.title || 'Inconnu',
      console: gameData.console || metadata.console || 'Inconnu',
      status: existing ? existing.status : 'none',
      description: metadata.description || gameData.description,
      releaseYear: metadata.releaseYear || gameData.releaseYear,
      genre: metadata.genre || gameData.genre,
      ...metadata
    };

    setSelectedGame(gameToSelect);
    setView(AppView.DETAILS);
    setIsLoadingDetails(false);
  };

  const handleToggleFromCatalogue = (gameData: Partial<Game>) => {
    const id = `${gameData.title}-${gameData.console}`.toLowerCase().replace(/[^\w-]/g, '-');
    const existing = myGames.find(g => g.id === id);
    
    if (existing) {
      if (existing.status === 'owned') {
        setMyGames(prev => prev.filter(g => g.id !== id));
      } else {
        setMyGames(prev => prev.map(g => g.id === id ? { ...g, status: 'owned' } : g));
      }
    } else {
      const newGame: Game = {
        id,
        title: gameData.title || 'Inconnu',
        console: gameData.console || 'Inconnu',
        releaseYear: gameData.releaseYear,
        genre: gameData.genre,
        status: 'owned'
      };
      setMyGames(prev => [...prev, newGame]);
    }
  };

  const handleRemoveGame = (id: string) => {
    if (confirm("Supprimer cet élément de votre archive ?")) {
      setMyGames(prev => prev.filter(g => g.id !== id));
      if (selectedGame?.id === id) {
        setSelectedGame(prev => prev ? { ...prev, status: 'none' } : null);
      }
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

  const loadCatalogue = async (consoleName: string) => {
    setCatalogueConsole(consoleName);
    setIsLoadingCatalogue(true);
    const results = await getFullsetList(consoleName);
    setCatalogueGames(results);
    setIsLoadingCatalogue(false);
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
      {isLoadingDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 dark:bg-black/60 backdrop-blur-sm">
           <div className="w-8 h-8 border-2 border-gray-300 dark:border-[#3a3a3c] border-t-blue-500 dark:border-t-white rounded-full animate-spin"></div>
        </div>
      )}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Archive</h2>
          
          <div className="flex bg-gray-100 dark:bg-[#1c1c1e] p-1 rounded-lg">
            {(['all', 'owned', 'wishlist'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeFilter === f ? 'bg-white dark:bg-[#3a3a3c] text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 dark:text-[#8e8e93] hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {f === 'all' ? 'Tout' : f === 'owned' ? 'Possédé' : 'Souhaits'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-6 overflow-x-auto pb-2 no-scrollbar border-b border-gray-100 dark:border-[#1c1c1e]">
          <button 
            onClick={() => setActiveConsole('Tous')}
            className={`text-xs font-bold whitespace-nowrap transition-colors ${activeConsole === 'Tous' ? 'text-blue-500' : 'text-gray-500 dark:text-[#8e8e93] hover:text-gray-900 dark:hover:text-white'}`}
          >
            Toutes Consoles
          </button>
          {Array.from(new Set(myGames.map(g => g.console))).sort().map(c => (
            <button 
              key={c}
              onClick={() => setActiveConsole(c)}
              className={`text-xs font-bold whitespace-nowrap transition-colors ${activeConsole === c ? 'text-blue-500' : 'text-gray-500 dark:text-[#8e8e93] hover:text-gray-900 dark:hover:text-white'}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {filteredMyGames.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 border border-gray-100 dark:border-[#1c1c1e] rounded-3xl bg-gray-50 dark:bg-[#000000]">
          <p className="text-gray-400 dark:text-[#48484a] font-medium text-sm">Aucun élément archivé</p>
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
            <div key={game.id} onClick={() => handleSelectGame(game)} className="cursor-pointer">
              <GameCard 
                game={game} 
                onUpdateStatus={(id, status) => { handleUpdateStatus(id, status); }} 
                onRemove={handleRemoveGame}
                theme={theme}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderCatalogue = () => (
    <div className="space-y-12">
      <div className="max-w-3xl">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Fullsets</h2>
        <p className="text-gray-500 dark:text-[#8e8e93] text-sm mt-2">Explorez les catalogues complets par console et complétez votre archive.</p>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
        {SUPPORTED_CONSOLES.map(c => (
          <button 
            key={c}
            onClick={() => loadCatalogue(c)}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border ${
              catalogueConsole === c 
              ? 'bg-blue-600 dark:bg-white text-white dark:text-black border-blue-600 dark:border-white shadow-lg' 
              : 'bg-gray-100 dark:bg-[#1c1c1e] text-gray-500 dark:text-[#8e8e93] border-transparent hover:border-gray-300 dark:hover:border-[#3a3a3c]'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {!catalogueConsole ? (
        <div className="flex flex-col items-center justify-center py-40 border border-gray-100 dark:border-[#1c1c1e] rounded-3xl">
           <p className="text-gray-400 dark:text-[#48484a] font-medium text-sm tracking-tight">Sélectionnez une plateforme pour générer le catalogue</p>
        </div>
      ) : isLoadingCatalogue ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-[#3a3a3c] border-t-blue-500 dark:border-t-white rounded-full animate-spin"></div>
          <p className="text-[10px] font-bold text-gray-400 dark:text-[#48484a] uppercase tracking-widest mt-6">Scan du catalogue en cours...</p>
        </div>
      ) : (
        <div className="space-y-8">
           <div className="bg-gray-50 dark:bg-[#1c1c1e] p-6 rounded-3xl border border-gray-200 dark:border-[#3a3a3c]/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">{catalogueConsole}</h3>
                <p className="text-xs text-gray-500 dark:text-[#8e8e93] mt-1 font-medium">{catalogueGames.length} titres suggérés pour le fullset</p>
              </div>
              <div className="flex items-center gap-4">
                 <div className="text-right">
                    <p className="text-[10px] font-bold text-gray-400 dark:text-[#8e8e93] uppercase tracking-wider">Progression</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {catalogueGames.filter(cg => myGames.some(mg => mg.title === cg.title && mg.console === cg.console && mg.status === 'owned')).length} / {catalogueGames.length}
                    </p>
                 </div>
                 <div className="w-32 h-2 bg-gray-200 dark:bg-[#2c2c2e] rounded-full overflow-hidden">
                    <div 
                      className="bg-blue-600 h-full transition-all duration-1000"
                      style={{ width: `${(catalogueGames.filter(cg => myGames.some(mg => mg.title === cg.title && mg.console === cg.console && mg.status === 'owned')).length / catalogueGames.length) * 100}%` }}
                    ></div>
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {catalogueGames.map((cg, i) => {
                const isOwned = myGames.some(mg => mg.title === cg.title && mg.console === cg.console && mg.status === 'owned');
                return (
                  <div key={i} className={`group relative flex items-center justify-between p-4 rounded-2xl border transition-all text-left ${
                      isOwned 
                      ? 'bg-blue-50 dark:bg-white/5 border-blue-100 dark:border-white/20' 
                      : 'bg-transparent border-gray-100 dark:border-[#1c1c1e] hover:border-gray-300 dark:hover:border-[#3a3a3c]'
                    }`}>
                    <div onClick={() => handleSelectGame(cg)} className="flex-1 cursor-pointer flex flex-col">
                      <span className={`text-sm font-bold tracking-tight ${isOwned ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-[#8e8e93]'}`}>{cg.title}</span>
                      <span className="text-[10px] font-medium text-gray-400 dark:text-[#48484a]">{cg.releaseYear} • {cg.genre}</span>
                    </div>
                    <button 
                      onClick={() => handleToggleFromCatalogue(cg)}
                      className={`w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                        isOwned ? 'bg-blue-600 border-blue-500' : 'border-gray-200 dark:border-[#3a3a3c] hover:border-gray-400 dark:hover:border-[#8e8e93]'
                      }`}
                    >
                       {isOwned && (
                         <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                       )}
                    </button>
                  </div>
                );
              })}
           </div>
        </div>
      )}
    </div>
  );

  const renderSearch = () => (
    <div className="space-y-12">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Recherche</h2>

      <form onSubmit={handleSearch} className="relative">
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Titre, plateforme, franchise..."
          className="w-full bg-gray-50 dark:bg-[#1c1c1e] rounded-2xl px-6 py-5 text-gray-900 dark:text-white text-lg focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all placeholder-gray-300 dark:placeholder-[#48484a] font-medium border border-gray-100 dark:border-transparent"
        />
        <button 
          type="submit"
          className="absolute right-3 top-3 bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-md active:scale-95"
        >
          {isSearching ? '...' : 'Chercher'}
        </button>
      </form>

      <div className="space-y-4">
        <h3 className="text-[10px] font-bold text-gray-400 dark:text-[#8e8e93] uppercase tracking-widest px-1">Plateformes Suggerées</h3>
        <div className="flex flex-wrap gap-2">
          {SUPPORTED_CONSOLES.slice(0, 8).map(c => (
            <button 
              key={c}
              onClick={() => handleGetConsoleGames(c)}
              className="px-4 py-2 bg-gray-100 dark:bg-[#1c1c1e] text-gray-500 dark:text-[#8e8e93] hover:text-gray-900 dark:hover:text-white rounded-full text-[11px] font-bold transition-all border border-transparent hover:border-gray-300 dark:hover:border-[#3a3a3c]"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {isSearching && (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-2 border-gray-200 dark:border-[#3a3a3c] border-t-blue-500 rounded-full animate-spin"></div>
        </div>
      )}

      {searchResults.length > 0 && !isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {searchResults.map((res, i) => {
            const isAdded = myGames.some(g => g.title === res.title && g.console === res.console);
            return (
              <div key={i} className="bg-gray-50 dark:bg-[#1c1c1e] rounded-2xl p-6 flex flex-col border border-gray-100 dark:border-transparent hover:border-gray-300 dark:hover:border-[#3a3a3c] transition-all group">
                <div onClick={() => handleSelectGame(res)} className="cursor-pointer flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">{res.console}</span>
                    <span className="text-[10px] font-medium text-gray-400 dark:text-[#48484a]">{res.releaseYear}</span>
                  </div>
                  <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4 line-clamp-1">{res.title}</h4>
                  <p className="text-gray-500 dark:text-[#8e8e93] text-xs leading-relaxed mb-8 line-clamp-2">
                    {res.description}
                  </p>
                </div>
                <div className="mt-auto flex gap-2">
                  <button 
                    disabled={isAdded}
                    onClick={() => handleAddFromSearch(res, 'owned')}
                    className={`flex-1 py-2 rounded-xl font-bold text-xs transition-all ${
                      isAdded 
                      ? 'bg-gray-200 dark:bg-[#2c2c2e] text-gray-400 dark:text-[#48484a] cursor-default' 
                      : 'bg-blue-600 dark:bg-white text-white dark:text-black hover:bg-blue-500 dark:hover:bg-gray-200 shadow-sm'
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
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Analyses</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-50 dark:bg-[#1c1c1e] rounded-3xl p-8 border border-gray-100 dark:border-transparent">
          <h3 className="text-xs font-bold uppercase tracking-widest mb-10 text-gray-400 dark:text-[#8e8e93]">Distribution</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={consoleStats} layout="vertical">
                <XAxis type="number" hide />
                <YAxis dataKey="console" type="category" stroke="#8e8e93" width={100} fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{fill: theme === 'dark' ? '#2c2c2e' : '#f3f4f6'}}
                  contentStyle={{ backgroundColor: theme === 'dark' ? '#1c1c1e' : '#fff', borderRadius: '12px', border: theme === 'dark' ? '1px solid #3a3a3c' : '1px solid #e5e7eb', color: theme === 'dark' ? '#fff' : '#000' }}
                />
                <Bar dataKey="owned" fill={theme === 'dark' ? '#ffffff' : '#2563eb'} radius={[0, 4, 4, 0]} barSize={12} name="Possédés" />
                <Bar dataKey="wishlist" fill={theme === 'dark' ? '#3a3a3c' : '#d1d5db'} radius={[0, 4, 4, 0]} barSize={12} name="Souhaits" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-50 dark:bg-[#1c1c1e] rounded-3xl p-8 flex flex-col items-center justify-center text-center border border-gray-100 dark:border-transparent">
           <div className="relative w-40 h-40 flex items-center justify-center mb-8">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="80" cy="80" r="72" stroke={theme === 'dark' ? '#2c2c2e' : '#e5e7eb'} strokeWidth="8" fill="transparent" />
                <circle 
                  cx="80" cy="80" r="72" stroke={theme === 'dark' ? '#ffffff' : '#2563eb'} strokeWidth="8" fill="transparent"
                  strokeDasharray={452.4}
                  strokeDashoffset={452.4 - (452.4 * (myGames.filter(g => g.status === 'owned').length / (myGames.length || 1)))}
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className="text-3xl font-bold text-gray-900 dark:text-white">
                  {Math.round((myGames.filter(g => g.status === 'owned').length / (myGames.length || 1)) * 100)}%
                </span>
                <span className="text-[10px] text-gray-400 dark:text-[#8e8e93] font-bold uppercase tracking-widest mt-1">Acquis</span>
              </div>
           </div>
           
           <div className="grid grid-cols-2 gap-4 w-full">
              <div className="text-left p-3 bg-white dark:bg-black/30 rounded-xl shadow-sm dark:shadow-none">
                 <p className="text-[9px] font-bold text-gray-400 dark:text-[#8e8e93] uppercase mb-1">Total</p>
                 <p className="text-xl font-bold text-gray-900 dark:text-white">{myGames.length}</p>
              </div>
              <div className="text-left p-3 bg-white dark:bg-black/30 rounded-xl shadow-sm dark:shadow-none">
                 <p className="text-[9px] font-bold text-gray-400 dark:text-[#8e8e93] uppercase mb-1">Possédés</p>
                 <p className="text-xl font-bold text-gray-900 dark:text-white">{myGames.filter(g => g.status === 'owned').length}</p>
              </div>
           </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-12 max-w-2xl">
      <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Paramètres</h2>

      <div className="bg-gray-50 dark:bg-[#1c1c1e] rounded-3xl p-8 space-y-10 border border-gray-100 dark:border-transparent">
        <section>
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Gestion des Données</h3>
          <p className="text-xs text-gray-500 dark:text-[#8e8e93] mb-8 leading-relaxed">
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
              className="bg-white dark:bg-[#2c2c2e] hover:bg-gray-100 dark:hover:bg-[#3a3a3c] text-gray-900 dark:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none"
            >
              Exporter JSON
            </button>
            <label className="bg-white dark:bg-[#2c2c2e] hover:bg-gray-100 dark:hover:bg-[#3a3a3c] text-gray-900 dark:text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border border-gray-200 dark:border-transparent shadow-sm dark:shadow-none">
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

        <section className="pt-8 border-t border-gray-200 dark:border-[#2c2c2e]">
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
    <Layout currentView={view} setView={setView} theme={theme} toggleTheme={toggleTheme}>
      {view === AppView.DEX && renderDex()}
      {view === AppView.CATALOGUE && renderCatalogue()}
      {view === AppView.SEARCH && renderSearch()}
      {view === AppView.STATS && renderStats()}
      {view === AppView.SETTINGS && renderSettings()}
      {view === AppView.DETAILS && selectedGame && (
        <GameDetails 
          game={selectedGame} 
          onBack={() => setView(AppView.DEX)} 
          onUpdateStatus={handleUpdateStatus}
          theme={theme}
        />
      )}
    </Layout>
  );
};

export default App;
