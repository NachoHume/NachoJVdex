
import React from 'react';
import { Game } from '../types';

interface GameDetailsProps {
  game: Game;
  onBack: () => void;
  onUpdateStatus: (id: string, status: Game['status']) => void;
  theme?: 'dark' | 'light';
}

const GameDetails: React.FC<GameDetailsProps> = ({ game, onBack, onUpdateStatus, theme = 'dark' }) => {
  const isOwned = game.status === 'owned';
  const isWishlist = game.status === 'wishlist';

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      <button 
        onClick={onBack}
        className={`flex items-center gap-2 transition-colors text-xs font-bold uppercase tracking-widest ${theme === 'light' ? 'text-gray-400 hover:text-gray-900' : 'text-[#8e8e93] hover:text-white'}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Retour
      </button>

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left: Hero Info & Actions */}
        <div className="lg:w-1/3 space-y-8">
          <div className={`aspect-[3/4] rounded-3xl flex items-center justify-center border shadow-2xl overflow-hidden relative group transition-colors duration-300 ${theme === 'light' ? 'bg-gray-100 border-gray-200' : 'bg-[#1c1c1e] border-[#3a3a3c]/30'}`}>
             {/* Dynamic Placeholder or Image */}
             <div className="text-center p-8">
                <span className="text-4xl block mb-4">💿</span>
                <h2 className={`text-xl font-bold tracking-tight ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{game.title}</h2>
                <p className={`text-xs mt-2 uppercase font-black tracking-widest ${theme === 'light' ? 'text-gray-400' : 'text-[#8e8e93]'}`}>{game.console}</p>
             </div>
             <div className="absolute inset-0 bg-gradient-to-t from-black/20 dark:from-black/60 to-transparent"></div>
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => onUpdateStatus(game.id, isOwned ? 'none' : 'owned')}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all border ${
                isOwned 
                ? theme === 'light' ? 'bg-blue-600 text-white border-blue-600 shadow-lg' : 'bg-white text-black border-white shadow-lg' 
                : theme === 'light' ? 'bg-white border-gray-200 text-gray-900 hover:bg-gray-50' : 'bg-[#1c1c1e] border-[#3a3a3c] text-white hover:bg-[#2c2c2e]'
              }`}
            >
              {isOwned ? 'Possédé dans l\'archive' : 'Ajouter à ma collection'}
            </button>
            <button 
              onClick={() => onUpdateStatus(game.id, isWishlist ? 'none' : 'wishlist')}
              className={`w-full py-4 rounded-2xl font-bold text-sm transition-all border ${
                isWishlist 
                ? 'bg-blue-600 text-white border-blue-600 shadow-lg' 
                : theme === 'light' ? 'bg-transparent border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-900' : 'bg-transparent border-[#3a3a3c] text-[#8e8e93] hover:text-white hover:border-[#8e8e93]'
              }`}
            >
              {isWishlist ? 'Dans ma liste de souhaits' : 'Mettre en liste de souhaits'}
            </button>
          </div>
        </div>

        {/* Right: Technical Metadata */}
        <div className="lg:w-2/3 space-y-10">
          <div>
            <div className="flex items-center justify-between mb-4">
               <h1 className={`text-4xl font-extrabold tracking-tight ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{game.title}</h1>
               {game.metacritic && (
                 <div className={`px-4 py-2 rounded-xl text-lg font-black ${
                   game.metacritic >= 75 ? 'bg-green-500/20 text-green-600 dark:text-green-400' : 
                   game.metacritic >= 50 ? 'bg-yellow-500/20 text-yellow-600 dark:text-yellow-400' : 'bg-red-500/20 text-red-600 dark:text-red-400'
                 }`}>
                   {game.metacritic}
                 </div>
               )}
            </div>
            <div className={`flex gap-4 text-xs font-bold uppercase tracking-widest border-b pb-6 transition-colors duration-300 ${theme === 'light' ? 'text-gray-400 border-gray-100' : 'text-[#8e8e93] border-[#1c1c1e]'}`}>
               <span>{game.genre}</span>
               <span>•</span>
               <span>{game.developer}</span>
               <span>•</span>
               <span>{game.releaseYear}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <section className="space-y-4">
                <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'light' ? 'text-gray-300' : 'text-[#48484a]'}`}>Dates de Sortie</h3>
                <div className={`rounded-2xl p-6 space-y-4 border transition-colors duration-300 ${theme === 'light' ? 'bg-white border-gray-100 shadow-sm' : 'bg-[#1c1c1e] border-[#3a3a3c]/10'}`}>
                   {game.regionalReleases?.map((rel, i) => (
                     <div key={i} className="flex justify-between items-center text-sm">
                        <span className={`font-medium ${theme === 'light' ? 'text-gray-500' : 'text-[#8e8e93]'}`}>{rel.region}</span>
                        <span className={`font-bold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}>{rel.date}</span>
                     </div>
                   ))}
                   {!game.regionalReleases && <p className="text-xs text-gray-300 dark:text-[#48484a]">Chargement des dates...</p>}
                </div>
             </section>

             <section className="space-y-4">
                <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'light' ? 'text-gray-300' : 'text-[#48484a]'}`}>Variantes & Editions</h3>
                <div className="flex flex-wrap gap-2">
                   {game.variants?.map((v, i) => (
                     <span key={i} className={`px-4 py-2 border rounded-xl text-xs font-medium transition-colors duration-300 ${theme === 'light' ? 'bg-white border-gray-200 text-gray-700' : 'bg-[#1c1c1e] border-[#3a3a3c]/30 text-white'}`}>
                        {v}
                     </span>
                   ))}
                   {!game.variants && <p className="text-xs text-gray-300 dark:text-[#48484a]">Standard Edition</p>}
                </div>
             </section>
          </div>

          <section className="space-y-4">
             <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'light' ? 'text-gray-300' : 'text-[#48484a]'}`}>Description de l'Archive</h3>
             <p className={`text-sm leading-relaxed font-medium transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-[#8e8e93]'}`}>
                {game.description || "Aucune description détaillée disponible dans l'archive locale pour le moment."}
             </p>
          </section>

          <section className="space-y-4">
             <h3 className={`text-[10px] font-bold uppercase tracking-[0.2em] ${theme === 'light' ? 'text-gray-300' : 'text-[#48484a]'}`}>Jaquettes Régionales (Covers)</h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {game.covers?.map((c, i) => (
                  <div key={i} className={`rounded-2xl p-4 border transition-all duration-300 ${theme === 'light' ? 'bg-white border-gray-200 shadow-sm' : 'bg-[#1c1c1e] border-[#3a3a3c]/30'}`}>
                     <p className="text-[9px] font-black text-blue-500 uppercase tracking-widest">{c.region}</p>
                     <p className={`text-[11px] leading-snug transition-colors duration-300 ${theme === 'light' ? 'text-gray-600' : 'text-[#8e8e93]'}`}>{c.description}</p>
                  </div>
                ))}
             </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default GameDetails;
