
import React from 'react';
import { Game } from '../types';

interface GameCardProps {
  game: Game;
  onUpdateStatus: (id: string, status: Game['status']) => void;
  onRemove?: (id: string) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, onUpdateStatus, onRemove }) => {
  const isOwned = game.status === 'owned';
  const isWishlist = game.status === 'wishlist';

  return (
    <div className="group relative flex flex-col bg-[#1c1c1e] rounded-2xl transition-all duration-300 hover:bg-[#2c2c2e] overflow-hidden border border-[#3a3a3c]/30">
      {/* Subtle status dot */}
      <div className="absolute top-4 right-4 z-10">
        {isOwned ? (
          <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
        ) : isWishlist ? (
          <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]"></div>
        ) : null}
      </div>

      <div className="p-5 flex-1 flex flex-col">
        <div className="mb-1 flex justify-between items-start">
          <span className="text-[10px] font-bold text-[#8e8e93] uppercase tracking-wide">{game.console}</span>
        </div>
        
        <h3 className="text-base font-bold text-white leading-snug mb-3 tracking-tight">
          {game.title}
        </h3>
        
        <div className="flex gap-2 mb-6">
          {game.releaseYear && (
            <span className="text-[10px] text-[#8e8e93] font-medium">{game.releaseYear}</span>
          )}
          {game.genre && (
             <span className="text-[10px] text-[#8e8e93] font-medium opacity-60">• {game.genre}</span>
          )}
        </div>

        <div className="mt-auto flex items-center justify-between gap-2 pt-4 border-t border-[#3a3a3c]/50">
          <div className="flex gap-1">
            <button 
              onClick={() => onUpdateStatus(game.id, isOwned ? 'none' : 'owned')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                isOwned 
                ? 'bg-white text-black border-white' 
                : 'bg-transparent border-[#3a3a3c] text-[#8e8e93] hover:text-white hover:border-[#8e8e93]'
              }`}
            >
              Possédé
            </button>
            <button 
              onClick={() => onUpdateStatus(game.id, isWishlist ? 'none' : 'wishlist')}
              className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${
                isWishlist 
                ? 'bg-blue-600 border-blue-600 text-white' 
                : 'bg-transparent border-[#3a3a3c] text-[#8e8e93] hover:text-white hover:border-[#8e8e93]'
              }`}
            >
              Souhait
            </button>
          </div>
          
          {onRemove && (
            <button 
              onClick={() => onRemove(game.id)}
              className="p-1.5 text-[#48484a] hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default GameCard;
