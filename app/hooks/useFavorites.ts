import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface FavoriteLeague {
  id: number;
  name: string;
  splitName: string;
  category: {
    alpha2?: string;
  };
}

const STORAGE_KEY = '@kings_app_favorite_leagues';

export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteLeague[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les favoris au démarrage
  useEffect(() => {
    loadFavorites();
  }, []);

  // Charger les favoris depuis AsyncStorage
  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem(STORAGE_KEY);
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des favoris:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Sauvegarder les favoris dans AsyncStorage
  const saveFavorites = async (newFavorites: FavoriteLeague[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des favoris:', error);
    }
  };

  // Ajouter une ligue aux favoris
  const addFavorite = async (league: FavoriteLeague) => {
    const newFavorites = [...favorites, league];
    await saveFavorites(newFavorites);
  };

  // Retirer une ligue des favoris
  const removeFavorite = async (leagueId: number) => {
    const newFavorites = favorites.filter(fav => fav.id !== leagueId);
    await saveFavorites(newFavorites);
  };

  // Vérifier si une ligue est dans les favoris
  const isFavorite = (leagueId: number) => {
    return favorites.some(fav => fav.id === leagueId);
  };

  return {
    favorites,
    isLoading,
    addFavorite,
    removeFavorite,
    isFavorite
  };
} 