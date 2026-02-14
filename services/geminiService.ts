
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
    - console: string (plateforme principale)
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
    console.error("Failed to parse Gemini response", e);
    return [];
  }
};

export const getIconicGamesByConsole = async (consoleName: string): Promise<Partial<Game>[]> => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Liste les 25 jeux les plus iconiques et essentiels pour la console ${consoleName}. 
    Retourne uniquement un tableau JSON d'objets.`,
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
    console.error("Failed to parse console games", e);
    return [];
  }
};
