import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity, FlatList, Alert } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import fetch from 'cross-fetch';

// Fonction utilitaire pour les logs
const logInfo = (message: string, data?: any) => {
  console.log(`[MatchDetail] 📘 ${message}`, data ? data : '');
};

const logError = (message: string, error?: any) => {
  console.error(`[MatchDetail] 🔴 ${message}`, error ? error : '');
  if (error?.stack) {
    console.error(`[MatchDetail] 🔴 Stack: ${error.stack}`);
  }
};

// Définition des types pour les équipes et les matchs
interface Player {
  id: number;
  firstName: string;
  lastName: string;
  jerseyName: string;
  role: string;
  image: {
    url: string;
  } | null;
  jersey: number;
}

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
  players: Player[];
}

interface MatchEvent {
  id: string;
  half: number;
  second: number;
  matchSecond: number;
  teamId: number;
  playerId: number | null;
  parameterAppString: string;
}

interface TeamStats {
  teamId: number;
  teamStats: Array<{
    id: string;
    total: number;
    total1T: number;
    total2T: number;
    parameterCode: string;
  }>;
  players: Array<{
    playerId: number;
    playerStats: Array<{
      id: string;
      total: number;
      total1T: number;
      total2T: number;
      parameterCode: string;
      minutes: number;
    }>;
  }>;
}

interface Match {
  id: number;
  date: string;
  seasonId: number;
  season: {
    id: number;
    name: string;
    displayName: string;
  };
  status: string;
  currentMinute: number;
  participants: {
    homeTeamId: number;
    homeTeam: Team;
    awayTeamId: number;
    awayTeam: Team;
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
  durations: {
    duration: number | null;
    duration1T: number;
    duration2T: number;
  };
  halfs: {
    halfNumber: number;
    halfDuration: number;
  };
  stadium: {
    name: string;
    country: {
      name: string;
    };
  };
  events: MatchEvent[];
  stats: {
    homeTeam: TeamStats;
    awayTeam: TeamStats;
  };
}

// Interprétation des événements
const interpretEvent = (event: MatchEvent, match: Match): string | null => {
  const { homeTeam, awayTeam } = match.participants;
  const team = event.teamId === homeTeam.id ? homeTeam : awayTeam;
  const paramString = event.parameterAppString;
  
  let player = null;
  if (event.playerId) {
    player = team.players.find(p => p.id === event.playerId);
  }
  
  const playerName = player ? player.jerseyName : '';
  
  if (paramString.includes('GOL')) {
    return `⚽️ BUT - ${team.name} (${playerName})`;
  } else if (paramString.includes('ASS-V')) {
    return `🎯 PASSE DÉCISIVE - ${playerName}`;
  } else if (paramString.includes('CRN')) {
    return `🚩 CORNER - ${team.name}`;
  } else if (paramString.includes('FAL')) {
    return `🔶 FAUTE - ${playerName || team.name}`;
  } else if (paramString.includes('MVP')) {
    return `🏆 MVP DU MATCH - ${playerName}`;
  } else if (paramString.includes('CARD-ACT')) {
    return `🃏 CARTE - ${playerName || team.name}`;
  }
  
  return null;
};

// Formater la minute du match
const formatMatchTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}'${remainingSeconds > 0 ? remainingSeconds : ''}`;
};

// Définir le composant comme une expression de fonction pour Expo Router
const MatchDetail = () => {
  // Utiliser les hooks React en haut du composant
  const params = useLocalSearchParams();
  const router = useRouter();
  const id = params.id as string;
  // Utiliser le competitionId par défaut de la Kings League (21)
  const initialCompetitionId = params.competitionId ? Number(params.competitionId) : 21;

  // Initialiser les états
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'resume' | 'stats' | 'lineups'>('resume');
  const [competitionId, setCompetitionId] = useState<number>(initialCompetitionId);
  
  const MAX_RETRIES = 3;
  
  // Récupérer le competitionId des paramètres
  useEffect(() => {
    if (params.competitionId) {
      const receivedCompetitionId = Number(params.competitionId);
      logInfo(`CompetitionId reçu dans les paramètres: ${receivedCompetitionId}`);
      setCompetitionId(receivedCompetitionId);
    } else {
      logInfo(`CompetitionId non trouvé dans les paramètres, utilisation de la valeur par défaut: 21 (Kings League)`);
    }
  }, [params.competitionId]);
  
  // Charger les données du match
  useEffect(() => {
    // Toujours procéder au chargement car competitionId est maintenant initialisé correctement
    const fetchMatchDetails = async () => {
      try {
        logInfo(`Récupération des détails du match avec l'ID: ${id} (essai ${retryCount + 1}/${MAX_RETRIES})`);
        setIsLoading(true);
        
        const apiUrl = `https://kingsleague.pro/api/v1/competition/matches/${id}?live=false&competitionId=${competitionId}`;
        logInfo(`URL API appelée: ${apiUrl}`);
        
        // Ajout d'un timeout pour éviter les requêtes qui bloquent indéfiniment
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 secondes timeout
        
        // Récupération des détails du match
        const response = await fetch(apiUrl, {
          headers: {
            'referer': 'https://kingsleague.pro/',
            'lang': 'fr',
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        logInfo(`Statut de la réponse: ${response.status}`);
        
        if (!response.ok) {
          const responseText = await response.text();
          logError(`Erreur de réponse ${response.status}`, responseText);
          throw new Error(`Erreur lors de la récupération des détails du match (${response.status})`);
        }

        // Vérifier si la réponse est du JSON valide
        let data;
        try {
          const text = await response.text();
          data = JSON.parse(text);
          logInfo(`Données reçues pour le match ${id}`, {
            homeTeam: data?.participants?.homeTeam?.name,
            awayTeam: data?.participants?.awayTeam?.name,
            status: data?.status
          });
        } catch (parseError) {
          logError(`Erreur lors du parsing JSON`, parseError);
          throw new Error('Format de réponse invalide');
        }
        
        setMatch(data);
      } catch (err: any) {
        logError(`Erreur lors du chargement du match ${id}`, err);
        
        // Si c'est une erreur d'abandon (timeout), on le signale
        if (err.name === 'AbortError') {
          logError('La requête a été abandonnée (timeout)');
        }
        
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
        
        // Retry logic
        if (retryCount < MAX_RETRIES - 1) {
          logInfo(`Nouvel essai (${retryCount + 2}/${MAX_RETRIES})...`);
          setRetryCount(prev => prev + 1);
          // Ne pas sortir de l'état de chargement si on va réessayer
          return;
        }
      } finally {
        if (retryCount >= MAX_RETRIES - 1) {
          setIsLoading(false);
        }
      }
    };

    if (id) {
      fetchMatchDetails();
    } else {
      logError("ID du match non défini");
      setIsLoading(false);
    }
  }, [id, retryCount, competitionId]);

  const handleRetry = () => {
    logInfo("Tentative manuelle de récupération des données");
    setError(null);
    setRetryCount(0);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FFC107" />
        {retryCount > 0 && (
          <Text style={{ color: 'white', marginTop: 16 }}>
            Nouvelle tentative... ({retryCount}/{MAX_RETRIES})
          </Text>
        )}
      </View>
    );
  }

  if (error || !match) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <Text style={{ color: 'white', textAlign: 'center', padding: 20 }}>
          {error ? error.message : "Impossible de trouver ce match"}
        </Text>
        <TouchableOpacity
          onPress={handleRetry}
          style={{ 
            backgroundColor: '#FFC107', 
            paddingVertical: 10, 
            paddingHorizontal: 20, 
            borderRadius: 8,
            marginTop: 16
          }}
        >
          <Text style={{ color: 'black', fontWeight: '600' }}>Réessayer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            paddingVertical: 10, 
            paddingHorizontal: 20, 
            borderRadius: 8,
            marginTop: 16
          }}
        >
          <Text style={{ color: 'white' }}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { homeTeam, awayTeam } = match.participants;
  const matchDate = new Date(match.date);
  const formattedDate = matchDate.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
  const formattedTime = matchDate.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Filtrer les événements importants
  const keyEvents = match.events
    .filter(event => 
      event.parameterAppString.includes('GOL') || 
      event.parameterAppString.includes('ASS-V') || 
      event.parameterAppString.includes('CRN') || 
      event.parameterAppString.includes('FAL') ||
      event.parameterAppString.includes('MVP') ||
      event.parameterAppString.includes('CARD-ACT')
    )
    .map(event => ({
      ...event,
      description: interpretEvent(event, match)
    }))
    .filter(event => event.description !== null)
    .sort((a, b) => a.matchSecond - b.matchSecond);

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <LinearGradient
        colors={['#FFC107', '#000000']}
        style={{ height: 250, position: 'absolute', top: 0, left: 0, right: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1 }}>
        <Stack.Screen
          options={{
            headerShown: false,
          }}
        />

        <View style={{ padding: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              width: 36,
              height: 36,
              borderRadius: 18,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 16
            }}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={{ 
          paddingHorizontal: 16, 
          paddingTop: 20, 
          alignItems: 'center', 
          maxWidth: 767, 
          width: '100%', 
          marginHorizontal: 'auto' 
        }}>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', marginBottom: 8, fontSize: 14 }}>
            {match.season.name} • {match.stadium.name}
          </Text>
          
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%',
            marginBottom: 32
          }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              {homeTeam.logo && (
                <Image 
                  source={{ uri: homeTeam.logo.url }} 
                  style={{ 
                    width: 80, 
                    height: 80, 
                    resizeMode: 'contain', 
                    marginBottom: 8,
                    backgroundColor: homeTeam.firstColorHEX,
                    borderRadius: 40,
                    padding: 8
                  }}
                />
              )}
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
                {homeTeam.name}
              </Text>
            </View>

            <View style={{ 
              backgroundColor: 'rgba(0, 0, 0, 0.5)', 
              paddingHorizontal: 20, 
              paddingVertical: 16, 
              borderRadius: 12,
              alignItems: 'center',
              minWidth: 120
            }}>
              {match.status === 'ended' ? (
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>
                  {match.scores.homeScore} - {match.scores.awayScore}
                </Text>
              ) : (
                <Text style={{ color: 'white', fontSize: 22, fontWeight: 'bold' }}>VS</Text>
              )}
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, marginTop: 8 }}>
                {formattedDate}
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}>
                {formattedTime}
              </Text>
              {match.status === 'ended' && (
                <View style={{ marginTop: 8, backgroundColor: 'rgba(255, 255, 255, 0.1)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4 }}>
                  <Text style={{ color: 'white', fontSize: 12 }}>TERMINÉ</Text>
                </View>
              )}
            </View>

            <View style={{ flex: 1, alignItems: 'center' }}>
              {awayTeam.logo && (
                <Image 
                  source={{ uri: awayTeam.logo.url }} 
                  style={{ 
                    width: 80, 
                    height: 80, 
                    resizeMode: 'contain', 
                    marginBottom: 8,
                    backgroundColor: awayTeam.firstColorHEX,
                    borderRadius: 40,
                    padding: 8
                  }}
                />
              )}
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
                {awayTeam.name}
              </Text>
            </View>
          </View>

          {/* Navigation tabs */}
          <View style={{ 
            flexDirection: 'row', 
            width: '100%', 
            backgroundColor: 'rgba(0, 0, 0, 0.3)', 
            borderRadius: 12,
            marginBottom: 16
          }}>
            {['resume', 'stats', 'lineups'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: activeTab === tab ? 'rgba(255, 193, 7, 0.2)' : 'transparent',
                  borderRadius: activeTab === tab ? 12 : 0,
                  alignItems: 'center'
                }}
                onPress={() => setActiveTab(tab as 'resume' | 'stats' | 'lineups')}
              >
                <Text style={{ 
                  color: activeTab === tab ? 'white' : 'rgba(255, 255, 255, 0.6)',
                  fontWeight: activeTab === tab ? '600' : '400'
                }}>
                  {tab === 'resume' ? 'Résumé' : tab === 'stats' ? 'Statistiques' : 'Formations'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            borderRadius: 16, 
            paddingVertical: 16, 
            paddingHorizontal: 12,
            width: '100%',
            flex: 1
          }}>
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={true}
            >
              {activeTab === 'resume' && (
                <>
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16, paddingLeft: 4 }}>
                    Résumé du match
                  </Text>

                  {match.status === 'ended' && (
                    <View style={{ marginBottom: 24, backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 16, borderRadius: 12 }}>
                      <Text style={{ color: 'white', fontSize: 16, marginBottom: 12, fontWeight: '600' }}>Score par période</Text>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 2 }}>Mi-temps 1 ({match.durations.duration1T}min)</Text>
                        <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                          {match.scores.homeScore1T}
                        </Text>
                        <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                          {match.scores.awayScore1T}
                        </Text>
                      </View>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 2 }}>Mi-temps 2 ({match.durations.duration2T}min)</Text>
                        <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                          {match.scores.homeScore2T}
                        </Text>
                        <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                          {match.scores.awayScore2T}
                        </Text>
                      </View>
                    </View>
                  )}

                  <Text style={{ color: 'white', fontSize: 16, marginBottom: 12, fontWeight: '600', paddingLeft: 4 }}>Événements clés</Text>
                  {keyEvents.length > 0 ? (
                    keyEvents.map((event, index) => (
                      <View 
                        key={event.id} 
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 10,
                          paddingHorizontal: 12,
                          backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                          borderRadius: 8,
                          marginBottom: 2
                        }}
                      >
                        <Text style={{ color: 'rgba(255, 255, 255, 0.7)', width: 50 }}>
                          {formatMatchTime(event.matchSecond)}
                        </Text>
                        <Text style={{ color: 'white', flex: 1 }}>
                          {event.description}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <Text style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: 20 }}>
                      Aucun événement clé disponible
                    </Text>
                  )}
                </>
              )}

              {activeTab === 'stats' && (
                <>
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16, paddingLeft: 4 }}>
                    Statistiques du match
                  </Text>

                  <View style={{ marginBottom: 24, backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 16, borderRadius: 12 }}>
                    {/* Tirs */}
                    <Text style={{ color: 'white', fontSize: 16, marginBottom: 16, fontWeight: '600' }}>Tirs</Text>
                    
                    {/* Trouver les stats de tirs pour chaque équipe */}
                    {(() => {
                      const homeTirs = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'TIR')?.total || 0;
                      const awayTirs = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'TIR')?.total || 0;
                      const homeTirsS = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'TIR-S')?.total || 0;
                      const awayTirsS = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'TIR-S')?.total || 0;
                      
                      return (
                        <>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {homeTirs}
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 2, textAlign: 'center' }}>
                              Tirs
                            </Text>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {awayTirs}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {homeTirsS}
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 2, textAlign: 'center' }}>
                              Tirs cadrés
                            </Text>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {awayTirsS}
                            </Text>
                          </View>
                        </>
                      );
                    })()}
                    
                    {/* Possession */}
                    <Text style={{ color: 'white', fontSize: 16, marginTop: 24, marginBottom: 16, fontWeight: '600' }}>Possession</Text>
                    
                    {(() => {
                      const homePas = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'PAS')?.total || 0;
                      const awayPas = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'PAS')?.total || 0;
                      const homePasR = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'PAS-R')?.total || 0;
                      const awayPasR = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'PAS-R')?.total || 0;
                      const homePasX = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'PAS-X')?.total || 0;
                      const awayPasX = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'PAS-X')?.total || 0;
                      
                      // Calculer les pourcentages de possession
                      const totalPas = homePas + awayPas;
                      const homePossession = totalPas > 0 ? Math.round((homePas / totalPas) * 100) : 50;
                      const awayPossession = totalPas > 0 ? 100 - homePossession : 50;
                      
                      return (
                        <>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {homePossession}%
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 2, textAlign: 'center' }}>
                              Possession
                            </Text>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {awayPossession}%
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {homePas}
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 2, textAlign: 'center' }}>
                              Passes
                            </Text>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {awayPas}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {homePasX}%
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 2, textAlign: 'center' }}>
                              Précision des passes
                            </Text>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {awayPasX}%
                            </Text>
                          </View>
                        </>
                      );
                    })()}
                    
                    {/* Fautes et corners */}
                    <Text style={{ color: 'white', fontSize: 16, marginTop: 24, marginBottom: 16, fontWeight: '600' }}>Fautes et corners</Text>
                    
                    {(() => {
                      const homeFal = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'FAL')?.total || 0;
                      const awayFal = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'FAL')?.total || 0;
                      const homeCrn = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'CRN')?.total || 0;
                      const awayCrn = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'CRN')?.total || 0;
                      
                      return (
                        <>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {homeFal}
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 2, textAlign: 'center' }}>
                              Fautes
                            </Text>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {awayFal}
                            </Text>
                          </View>
                          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {homeCrn}
                            </Text>
                            <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 2, textAlign: 'center' }}>
                              Corners
                            </Text>
                            <Text style={{ color: 'white', fontWeight: '500', flex: 1, textAlign: 'center' }}>
                              {awayCrn}
                            </Text>
                          </View>
                        </>
                      );
                    })()}
                  </View>
                </>
              )}

              {activeTab === 'lineups' && (
                <>
                  <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16, paddingLeft: 4 }}>
                    Compositions
                  </Text>
                  
                  {/* Équipe domicile */}
                  <View style={{ marginBottom: 24, backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 16, borderRadius: 12 }}>
                    <Text style={{ color: 'white', fontSize: 16, marginBottom: 12, fontWeight: '600', textAlign: 'center' }}>
                      {homeTeam.name}
                    </Text>
                    
                    {homeTeam.players && homeTeam.players.length > 0 ? (
                      <FlatList
                        data={homeTeam.players.filter(p => p.role && p.jersey)}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            paddingVertical: 8,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(255, 255, 255, 0.1)'
                          }}>
                            <View style={{ 
                              width: 28, 
                              height: 28, 
                              borderRadius: 14, 
                              backgroundColor: homeTeam.firstColorHEX,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>{item.jersey}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: 'white', fontWeight: '500' }}>{item.jerseyName}</Text>
                              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}>
                                {item.role === 'goalkeeper' ? 'Gardien' : 
                                 item.role === 'defender' ? 'Défenseur' :
                                 item.role === 'midfielder' ? 'Milieu' : 'Attaquant'}
                              </Text>
                            </View>
                          </View>
                        )}
                      />
                    ) : (
                      <Text style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: 12 }}>
                        Composition non disponible
                      </Text>
                    )}
                  </View>
                  
                  {/* Équipe extérieur */}
                  <View style={{ marginBottom: 24, backgroundColor: 'rgba(255, 255, 255, 0.05)', padding: 16, borderRadius: 12 }}>
                    <Text style={{ color: 'white', fontSize: 16, marginBottom: 12, fontWeight: '600', textAlign: 'center' }}>
                      {awayTeam.name}
                    </Text>
                    
                    {awayTeam.players && awayTeam.players.length > 0 ? (
                      <FlatList
                        data={awayTeam.players.filter(p => p.role && p.jersey)}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            paddingVertical: 8,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(255, 255, 255, 0.1)'
                          }}>
                            <View style={{ 
                              width: 28, 
                              height: 28, 
                              borderRadius: 14, 
                              backgroundColor: awayTeam.firstColorHEX,
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 12
                            }}>
                              <Text style={{ color: 'white', fontSize: 12, fontWeight: '600' }}>{item.jersey}</Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ color: 'white', fontWeight: '500' }}>{item.jerseyName}</Text>
                              <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}>
                                {item.role === 'goalkeeper' ? 'Gardien' : 
                                 item.role === 'defender' ? 'Défenseur' :
                                 item.role === 'midfielder' ? 'Milieu' : 'Attaquant'}
                              </Text>
                            </View>
                          </View>
                        )}
                      />
                    ) : (
                      <Text style={{ color: 'rgba(255, 255, 255, 0.5)', textAlign: 'center', padding: 12 }}>
                        Composition non disponible
                      </Text>
                    )}
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
};

// Exportation par défaut pour Expo Router
export default MatchDetail;
