import { useState, useEffect } from 'react';

interface Team {
  id: number;
  name: string;
  shortName: string;
  completeName: string;
  countryId: number;
  firstColorHEX: string;
  secondColorHEX: string;
  logo: {
    url: string;
  };
  inverseLogo: null;
  heroImage: null;
  heroVideo: null;
  metaInformation: any;
  gender: string;
  players: any[];
}

interface Match {
  id: number;
  date: string;
  seasonId: number;
  phaseId: number;
  groupId: number;
  turnId: number;
  status: string | null;
  stadiumId: number | null;
  currentMinute: number | null;
  participants: {
    homeTeamId: number;
    awayTeamId: number;
  };
  scores: {
    homeScore: number | null;
    awayScore: number | null;
    homeScore1T: number | null;
    awayScore1T: number | null;
    homeScore2T: number | null;
    awayScore2T: number | null;
    homeScore3T: number | null;
    awayScore3T: number | null;
    homeScoreP: number | null;
    awayScoreP: number | null;
  };
}

interface Turn {
  id: number;
  name: string;
  shortName: string;
  mvpName: string;
  start: string;
  finish: string;
  mvpPlayerId: number | null;
  player: any | null;
  matches: Match[];
}

interface Standing {
  id: number;
  team: Team;
  rank: number;
  points: number;
  gameTotal: number;
  gameWon: number;
  gameExtraTimeWon: number | null;
  gamePenaltyWon: number;
  gameDraw: number;
  gameLost: number;
  gameExtraTimeLost: number | null;
  gamePenaltyLost: number;
  goalPro: number;
  goalAgainst: number;
  penalty: number;
  positionLegend: {
    color: string;
    placement: string;
  } | null;
  secondaryPositionLegend: any | null;
}

interface CompetitionSeason {
  id: number;
  competitionId: number;
  competition: {
    id: number;
    name: string;
    countryId: number;
    image: {
      url: string;
    };
    logo: null;
    gender: string;
    type: string;
    international: boolean;
    category: any;
    competitionType: string;
    visible: boolean;
  };
  seasonClusterId: number;
  name: string;
  displayName: string;
  start: string;
  finish: string;
  finished: boolean;
  image: {
    url: string;
  };
  isCurrent: boolean;
  metaInformation: {
    position_legend: string;
  };
  winnerTeamId: number | null;
  phases: Array<{
    id: number;
    name: string;
    groups: Array<{
      id: number;
      name: string;
      turns: Turn[];
    }>;
  }>;
  hasStandings: boolean;
  teams: Team[];
  standings: Standing[];
}

interface UseCompetitionSeasonResult {
  season: CompetitionSeason | null;
  isLoading: boolean;
  error: Error | null;
}

export function useCompetitionSeason(seasonId: number): UseCompetitionSeasonResult {
  const [season, setSeason] = useState<CompetitionSeason | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchSeason = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://kingsleague.pro/api/v1/competition/seasons/${seasonId}`, {
          headers: {
            'referer': 'https://kingsleague.pro/',
            'lang': 'fr'
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des données de la saison');
        }

        const data = await response.json();
        setSeason(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchSeason();
  }, [seasonId]);

  return { season, isLoading, error };
} 