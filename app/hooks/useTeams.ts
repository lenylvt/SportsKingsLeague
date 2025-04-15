import { useState, useEffect } from 'react';

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
      try {
        setIsLoading(true);
        const response = await fetch(`https://kingsleague.pro/api/v1/competition/teams/${competitionId}`, {
          headers: {
            'referer': 'https://kingsleague.pro/',
            'lang': 'fr'
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des équipes');
        }

        const data = await response.json();
        setTeams(data.teams || []);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeams();
  }, [competitionId]);

  return { teams, isLoading, error };
} 