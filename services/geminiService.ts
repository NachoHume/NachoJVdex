
import { GoogleGenAI, Type } from "@google/genai";
import { Game } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchGames = async (query: string): Promise<Partial<Game>[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Recherche de jeux vidéo pour : "${query}". 
    Retourne une liste de 12 jeux correspondants sous forme de JSON.
    Chaque objet doit avoir :
    - title: string
    - console: string
    - releaseYear: number
    - description: string (max 120 caractères)
    - genre: string`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            console: { type: Type.STRING },
            releaseYear: { type: Type.NUMBER },
            description: { type: Type.STRING },
            genre: { type: Type.STRING }
          },
          required: ["title", "console", "releaseYear"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};

export const getFullsetList = async (consoleName: string): Promise<Partial<Game>[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Agis comme un expert en rétrogaming. Liste les 50 jeux les plus importants et collectionnés pour la console ${consoleName}. 
    Inclus les blockbusters mais aussi quelques pépites rares.
    Retourne uniquement un tableau JSON d'objets avec : title, console, releaseYear, genre.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            console: { type: Type.STRING },
            releaseYear: { type: Type.NUMBER },
            genre: { type: Type.STRING }
          },
          required: ["title", "console", "releaseYear"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};

export const getGameMetadata = async (title: string, consoleName: string): Promise<Partial<Game>> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-pro-preview",
    contents: `Fournis des métadonnées détaillées pour le jeu vidéo "${title}" sur "${consoleName}". 
    Inclus le score Metacritic, le développeur, l'éditeur, les dates de sortie régionales (USA, JAP, EUR), 
    les variantes connues (Remake, Deluxe, etc.) et des descriptions pour les différentes jaquettes (Covers).
    Retourne uniquement un objet JSON.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          console: { type: Type.STRING },
          metacritic: { type: Type.NUMBER },
          developer: { type: Type.STRING },
          publisher: { type: Type.STRING },
          description: { type: Type.STRING },
          releaseYear: { type: Type.NUMBER },
          genre: { type: Type.STRING },
          regionalReleases: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                region: { type: Type.STRING },
                date: { type: Type.STRING }
              }
            }
          },
          variants: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          },
          covers: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                region: { type: Type.STRING },
                description: { type: Type.STRING }
              }
            }
          }
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return {};
  }
};

export const getIconicGamesByConsole = async (consoleName: string): Promise<Partial<Game>[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Liste les 25 jeux les plus iconiques pour la console ${consoleName}. JSON format.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            console: { type: Type.STRING },
            releaseYear: { type: Type.NUMBER },
            description: { type: Type.STRING },
            genre: { type: Type.STRING }
          },
          required: ["title", "console", "releaseYear"]
        }
      }
    }
  });

  try {
    return JSON.parse(response.text);
  } catch (e) {
    return [];
  }
};
