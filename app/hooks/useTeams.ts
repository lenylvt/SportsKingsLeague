import { useState, useEffect } from 'react';

// Fonctions utilitaires pour les logs
const logInfo = (message: string, data?: any) => {
  console.log(`[useTeams] 📘 ${message}`, data ? data : '');
};

const logError = (message: string, error?: any) => {
  console.error(`[useTeams] 🔴 ${message}`, error ? error : '');
  if (error?.stack) {
    console.error(`[useTeams] 🔴 Stack: ${error.stack}`);
  }
};

interface Team {
  id: number;
  name: string;
  shortName: string;
  completeName: string;
  logo: {
    url: string;
  };
  firstColorHEX: string;
  secondColorHEX: string;
}

interface UseTeamsResult {
  teams: Team[];
  isLoading: boolean;
  error: Error | null;
}

export function useTeams(competitionId: number): UseTeamsResult {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeams = async () => {
      logInfo(`Récupération des équipes pour la compétition ID: ${competitionId}`);
      try {
        setIsLoading(true);
        const apiUrl = `https://kingsleague.pro/api/v1/competition/teams/${competitionId}`;
        logInfo(`URL API appelée: ${apiUrl}`);
        
        const response = await fetch(apiUrl, {
          headers: {
            'referer': 'https://kingsleague.pro/',
            'lang': 'fr'
          }
        });
        
        logInfo(`Statut de la réponse: ${response.status}`);
        
        if (!response.ok) {
          const responseText = await response.text();
          logError(`Erreur de réponse ${response.status}`, responseText);
          throw new Error(`Erreur lors de la récupération des équipes (${response.status})`);
        }

        const data = await response.json();
        logInfo(`Données reçues pour la compétition ${competitionId}`, {
          teamsCount: data.teams?.length || 0
        });
        
        setTeams(data.teams || []);
      } catch (err) {
        logError(`Erreur lors du chargement des équipes pour la compétition ${competitionId}`, err);
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [competitionId]);

  return { teams, isLoading, error };
}

// Ajout d'une exportation par défaut
export default useTeams; 