
export interface RegionalRelease {
  region: string;
  date: string;
}

export interface Game {
  id: string;
  title: string;
  console: string;
  releaseYear?: number;
  imageUrl?: string;
  description?: string;
  genre?: string;
  status: 'owned' | 'wishlist' | 'none';
  // Champs détaillés pour la fiche unique
  metacritic?: number;
  developer?: string;
  publisher?: string;
  regionalReleases?: RegionalRelease[];
  variants?: string[];
  covers?: { region: string; url: string; description: string }[];
}

export interface ConsoleStats {
  console: string;
  total: number;
  owned: number;
  wishlist: number;
}

export enum AppView {
  DEX = 'dex',
  SEARCH = 'search',
  CATALOGUE = 'catalogue',
  STATS = 'stats',
  SETTINGS = 'settings',
  DETAILS = 'details'
}

export const SUPPORTED_CONSOLES = [
  "Nintendo Switch",
  "PlayStation 5",
  "Xbox Series X/S",
  "PC",
  "Nintendo 3DS",
  "PlayStation 4",
  "Wii U",
  "PlayStation 3",
  "Xbox 360",
  "Wii",
  "Nintendo DS",
  "GameCube",
  "PlayStation 2",
  "Xbox",
  "Game Boy Advance",
  "Nintendo 64",
  "PlayStation 1",
  "Sega Saturn",
  "Super Nintendo",
  "Sega Genesis",
  "NES",
  "Game Boy Color",
  "Game Boy",
  "Master System",
  "Atari 2600"
];
