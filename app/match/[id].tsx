import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity, FlatList, Dimensions } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
  
  // Le competitionId doit venir des paramètres et non d'une valeur fixe
  const initialCompetitionId = params.competitionId ? Number(params.competitionId) : undefined;

  // Initialiser les états
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'resume' | 'stats' | 'lineups'>('resume');
  const [competitionId, setCompetitionId] = useState<number | undefined>(initialCompetitionId);
  
  const MAX_RETRIES = 3;
  
  // Pour la démonstration, utiliser directement les données fournies
  useEffect(() => {
    // Simuler un chargement court
    setTimeout(() => {
      // Utiliser des données mockées pour la démo
      const mockData = {
        "id": 1704,
        "date": "2025-04-06T14:00:00.000Z",
        "seasonId": 35,
        "season": {
          "id": 35,
          "competitionId": 21,
          "seasonClusterId": 2,
          "name": "Kings League France 2024/25 Split 1",
          "displayName": "Split 1",
          "start": "2025-03-23T00:00:00.000Z",
          "finish": "2025-05-22T00:00:00.000Z",
          "finished": false,
          "isCurrent": true
        },
        "status": "ended",
        "currentMinute": 44,
        "participants": {
          "homeTeamId": 174,
          "homeTeam": {
            "id": 174,
            "name": "Wolf Pack FC",
            "shortName": "WPF",
            "completeName": "Wolf Pack FC",
            "firstColorHEX": "#aedeff",
            "secondColorHEX": "#071d33",
            "logo": {
              "url": "https://kingsleague-cdn.kama.football/account/production/club/4dba9bd0-6054-49eb-9fe4-467eae48dac3/899809778.png"
            },
            "players": [
              {
                "id": 76180,
                "shortName": "Oscar Le Guillou",
                "firstName": "Oscar",
                "lastName": "Le Guillou",
                "jerseyName": "Le Guillou",
                "role": "forward",
                "jersey": 23,
                "image": {
                  "url": "https://kingsleague-cdn.kama.football/account/production/player/image/158742325.png"
                }
              },
              {
                "id": 76636,
                "shortName": "Thibaut Pereira",
                "firstName": "Thibaut",
                "lastName": "Pereira",
                "jerseyName": "Pereira",
                "role": "goalkeeper",
                "jersey": 16,
                "image": {
                  "url": "https://kingsleague-cdn.kama.football/account/production/player/image/332145829.png"
                }
              },
              {
                "id": 71857,
                "shortName": "Jordan Boli",
                "firstName": "Jordan",
                "lastName": "Boli",
                "jerseyName": "Jbb",
                "role": "defender",
                "jersey": 14,
                "image": {
                  "url": "https://kingsleague-cdn.kama.football/account/production/player/image/102960098.png"
                }
              }
            ]
          },
          "awayTeamId": 175,
          "awayTeam": {
            "id": 175,
            "name": "PANAM ALL STARZ",
            "shortName": "PAS",
            "completeName": "PANAM ALL STARZ",
            "firstColorHEX": "#011d3b",
            "secondColorHEX": "#d92038",
            "logo": {
              "url": "https://kingsleague-cdn.kama.football/account/production/club/d47580eb-c28b-475c-b0b6-3326472d6d52/965968627.png"
            },
            "players": [
              {
                "id": 73042,
                "shortName": "Adama Wagui",
                "firstName": "Adama",
                "lastName": "Wagui",
                "jerseyName": "Wagui",
                "role": "goalkeeper",
                "jersey": 30,
                "image": {
                  "url": "https://kingsleague-cdn.kama.football/account/production/player/image/143126253.png"
                }
              },
              {
                "id": 77704,
                "shortName": "José Pereira Do Amaral",
                "firstName": "José",
                "lastName": "Pereira Do Amaral",
                "jerseyName": "Amaral",
                "role": "defender",
                "jersey": 3,
                "image": {
                  "url": "https://kingsleague-cdn.kama.football/account/production/player/image/223958897.png"
                }
              },
              {
                "id": 75128,
                "shortName": "Idir Ahmin",
                "firstName": "Idir",
                "lastName": "Ahmin",
                "jerseyName": "Ahmin",
                "role": "midfielder",
                "jersey": 95,
                "image": {
                  "url": "https://kingsleague-cdn.kama.football/account/production/player/image/310033948.png"
                }
              }
            ]
          }
        },
        "scores": {
          "homeScore": 2,
          "awayScore": 5,
          "homeScore1T": 1,
          "awayScore1T": 2,
          "homeScore2T": 1,
          "awayScore2T": 3,
          "homeScore3T": null,
          "awayScore3T": null,
          "homeScoreP": null,
          "awayScoreP": null
        },
        "durations": {
          "duration": null,
          "duration1T": 20,
          "duration2T": 20
        },
        "halfs": {
          "halfNumber": 2,
          "halfDuration": 20
        },
        "stadium": {
          "name": "KL France Arena",
          "country": {
            "name": "France"
          }
        },
        "events": [
          {
            "id": "KL_1704_4068979476998783031",
            "matchId": 1704,
            "half": 1,
            "second": 434,
            "matchSecond": 434,
            "teamId": 175,
            "playerId": 77704,
            "parameterAppString": ",FAL,"
          },
          {
            "id": "KL_1704_388148893923265547",
            "matchId": 1704,
            "half": 2,
            "second": 2196,
            "matchSecond": 2581,
            "teamId": 175,
            "playerId": 76345,
            "parameterAppString": ",MVP,"
          }
        ],
        "stats": {
          "homeTeam": {
            "teamId": 174,
            "teamStats": [
              {
                "id": "KL_1704_174_TIR",
                "total": 17,
                "total1T": 8,
                "total2T": 9,
                "parameterCode": "TIR"
              },
              {
                "id": "KL_1704_174_TIR_S",
                "total": 10,
                "total1T": 4,
                "total2T": 6,
                "parameterCode": "TIR-S"
              },
              {
                "id": "KL_1704_174_PAS",
                "total": 192,
                "total1T": 94,
                "total2T": 98,
                "parameterCode": "PAS"
              },
              {
                "id": "KL_1704_174_PAS_X",
                "total": 86.98,
                "total1T": 89.36,
                "total2T": 84.69,
                "parameterCode": "PAS-X"
              },
              {
                "id": "KL_1704_174_CRN",
                "total": 4,
                "total1T": 1,
                "total2T": 3,
                "parameterCode": "CRN"
              },
              {
                "id": "KL_1704_174_FAL",
                "total": 7,
                "total1T": 4,
                "total2T": 3,
                "parameterCode": "FAL"
              }
            ],
            "players": []
          },
          "awayTeam": {
            "teamId": 175,
            "teamStats": [
              {
                "id": "KL_1704_175_TIR",
                "total": 23,
                "total1T": 12,
                "total2T": 11,
                "parameterCode": "TIR"
              },
              {
                "id": "KL_1704_175_TIR_S",
                "total": 15,
                "total1T": 7,
                "total2T": 8,
                "parameterCode": "TIR-S"
              },
              {
                "id": "KL_1704_175_PAS",
                "total": 215,
                "total1T": 105,
                "total2T": 110,
                "parameterCode": "PAS"
              },
              {
                "id": "KL_1704_175_PAS_X",
                "total": 92.12,
                "total1T": 91.45,
                "total2T": 92.73,
                "parameterCode": "PAS-X"
              },
              {
                "id": "KL_1704_175_CRN",
                "total": 6,
                "total1T": 3,
                "total2T": 3,
                "parameterCode": "CRN"
              },
              {
                "id": "KL_1704_175_FAL",
                "total": 5,
                "total1T": 2,
                "total2T": 3,
                "parameterCode": "FAL"
              }
            ],
            "players": []
          }
        }
      };
      
      setMatch(mockData as Match);
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleRetry = () => {
    logInfo("Tentative manuelle de récupération des données");
    setError(null);
    setRetryCount(0);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#f5793a" />
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
            backgroundColor: '#f5793a', 
            paddingVertical: 12, 
            paddingHorizontal: 24, 
            borderRadius: 12,
            marginTop: 16
          }}
        >
          <Text style={{ color: 'white', fontWeight: '600' }}>Réessayer</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.1)', 
            paddingVertical: 12, 
            paddingHorizontal: 24, 
            borderRadius: 12,
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

  // Ajouter des visualisations graphiques pour les statistiques
  const StatBar = ({ home, away, label }: { home: number, away: number, label: string }) => {
    const total = home + away;
    const homePercent = total > 0 ? (home / total) * 100 : 50;
    const awayPercent = total > 0 ? (away / total) * 100 : 50;
    
    // On utilise les couleurs des équipes ou des couleurs par défaut
    const homeColor = match?.participants.homeTeam.firstColorHEX || '#f5793a'; // Orange par défaut
    const awayColor = match?.participants.awayTeam.firstColorHEX || '#1e3799'; // Bleu sombre par défaut
    
    return (
      <View style={{ marginBottom: 22 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{home}</Text>
          <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 15 }}>{label}</Text>
          <Text style={{ color: 'white', fontWeight: '600', fontSize: 16 }}>{away}</Text>
        </View>
        <View style={{ 
          flexDirection: 'row', 
          height: 10, 
          borderRadius: 10, 
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.1)'
        }}>
          <View 
            style={{ 
              width: `${homePercent}%`, 
              backgroundColor: homeColor,
              borderTopLeftRadius: 10,
              borderBottomLeftRadius: 10
            }} 
          />
          <View 
            style={{ 
              width: `${awayPercent}%`, 
              backgroundColor: awayColor,
              borderTopRightRadius: 10,
              borderBottomRightRadius: 10
            }} 
          />
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <LinearGradient
        colors={['#f5793a', '#1e3799']} // Orange vers bleu sombre
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0.5 }}
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
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
          paddingTop: 10, 
          alignItems: 'center', 
          maxWidth: 767, 
          width: '100%', 
          marginHorizontal: 'auto' 
        }}>
          
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%',
            marginBottom: 32,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderRadius: 24,
            padding: 16
          }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              {homeTeam.logo && (
                <Image 
                  source={{ uri: homeTeam.logo.url }} 
                  style={{ 
                    width: 90, 
                    height: 90, 
                    resizeMode: 'contain', 
                    marginBottom: 10,
                    backgroundColor: '#f5793a',
                    borderRadius: 45,
                    padding: 8
                  }}
                />
              )}
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
                {homeTeam.name}
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}>
                {/*homeTeam.record || "0-0"*/}
              </Text>
            </View>

            <View style={{ 
              paddingHorizontal: 20, 
              paddingVertical: 16, 
              alignItems: 'center',
              minWidth: 120
            }}>
              {match.status === 'ended' ? (
                <Text style={{ color: 'white', fontSize: 36, fontWeight: 'bold' }}>
                  {match.scores.homeScore} - {match.scores.awayScore}
                </Text>
              ) : (
                <Text style={{ color: 'white', fontSize: 32, fontWeight: 'bold' }}>VS</Text>
              )}
              
              {match.status === 'ended' && (
                <View style={{ 
                  marginTop: 10, 
                  backgroundColor: 'rgba(255, 255, 255, 0.15)', 
                  paddingHorizontal: 12, 
                  paddingVertical: 4, 
                  borderRadius: 12 
                }}>
                  <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>TERMINÉ</Text>
                </View>
              )}
              
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 15, marginTop: 12 }}>
                {formattedDate}
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: 15 }}>
                {formattedTime}
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: 'center' }}>
              {awayTeam.logo && (
                <Image 
                  source={{ uri: awayTeam.logo.url }} 
                  style={{ 
                    width: 90, 
                    height: 90, 
                    resizeMode: 'contain', 
                    marginBottom: 10,
                    backgroundColor: '#1e3799',
                    borderRadius: 45,
                    padding: 8
                  }}
                />
              )}
              <Text style={{ color: 'white', fontSize: 20, fontWeight: '700', textAlign: 'center' }}>
                {awayTeam.name}
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}>
                {/*awayTeam.record || "0-0"*/}
              </Text>
            </View>
          </View>

          {/* Navigation tabs */}
          <View style={{ 
            flexDirection: 'row', 
            width: '100%', 
            backgroundColor: 'rgba(0, 0, 0, 0.4)', 
            borderRadius: 16,
            marginBottom: 20,
            padding: 4
          }}>
            {['resume', 'stats', 'lineups'].map((tab) => (
              <TouchableOpacity 
                key={tab}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                  borderRadius: 14,
                  alignItems: 'center'
                }}
                onPress={() => setActiveTab(tab as 'resume' | 'stats' | 'lineups')}
              >
                <Text style={{ 
                  color: 'white',
                  fontWeight: activeTab === tab ? '600' : '400',
                  fontSize: 16
                }}>
                  {tab === 'resume' ? 'Résumé' : tab === 'stats' ? 'Statistiques' : 'Formations'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            borderRadius: 24, 
            paddingVertical: 20, 
            paddingHorizontal: 16,
            width: '100%',
            flex: 1
          }}>
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 80 }}
              showsVerticalScrollIndicator={false}
            >
              {activeTab === 'resume' && (
                <>
                  <Text style={{ 
                    color: 'white', 
                    fontSize: 22, 
                    fontWeight: 'bold', 
                    marginBottom: 20, 
                    paddingLeft: 4 
                  }}>
                    Résumé du match
                  </Text>

                  {match.status === 'ended' && (
                    <View style={{ 
                      marginBottom: 28, 
                      backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                      padding: 20, 
                      borderRadius: 20 
                    }}>
                      <Text style={{ color: 'white', fontSize: 18, marginBottom: 16, fontWeight: '600' }}>
                        Score par période
                      </Text>
                      
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between', 
                        paddingBottom: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(255, 255, 255, 0.1)'
                      }}>
                        <Text style={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          flex: 3,
                          fontSize: 15
                        }}>
                          Équipe
                        </Text>
                        <Text style={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          flex: 1, 
                          textAlign: 'center',
                          fontSize: 15
                        }}>
                          1T
                        </Text>
                        <Text style={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          flex: 1, 
                          textAlign: 'center',
                          fontSize: 15
                        }}>
                          2T
                        </Text>
                        <Text style={{ 
                          color: 'rgba(255, 255, 255, 0.8)', 
                          flex: 1, 
                          textAlign: 'center',
                          fontSize: 15
                        }}>
                          Total
                        </Text>
                      </View>
                      
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between',
                        paddingVertical: 12,
                        borderBottomWidth: 1,
                        borderBottomColor: 'rgba(255, 255, 255, 0.1)'
                      }}>
                        <View style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center',
                          flex: 3
                        }}>
                          <View style={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: 8, 
                            backgroundColor: '#f5793a',
                            marginRight: 8
                          }} />
                          <Text style={{ 
                            color: 'white', 
                            fontWeight: '500',
                            fontSize: 16
                          }}>
                            {homeTeam.name}
                          </Text>
                        </View>
                        <Text style={{ 
                          color: 'white', 
                          fontWeight: '500', 
                          flex: 1, 
                          textAlign: 'center',
                          fontSize: 16
                        }}>
                          {match.scores.homeScore1T || 0}
                        </Text>
                        <Text style={{ 
                          color: 'white', 
                          fontWeight: '500', 
                          flex: 1, 
                          textAlign: 'center',
                          fontSize: 16
                        }}>
                          {match.scores.homeScore2T || 0}
                        </Text>
                        <Text style={{ 
                          color: 'white', 
                          fontWeight: '700', 
                          flex: 1, 
                          textAlign: 'center',
                          fontSize: 16
                        }}>
                          {match.scores.homeScore || 0}
                        </Text>
                      </View>
                      
                      <View style={{ 
                        flexDirection: 'row', 
                        justifyContent: 'space-between',
                        paddingVertical: 12
                      }}>
                        <View style={{ 
                          flexDirection: 'row', 
                          alignItems: 'center',
                          flex: 3
                        }}>
                          <View style={{ 
                            width: 16, 
                            height: 16, 
                            borderRadius: 8, 
                            backgroundColor: '#1e3799',
                            marginRight: 8
                          }} />
                          <Text style={{ 
                            color: 'white', 
                            fontWeight: '500',
                            fontSize: 16
                          }}>
                            {awayTeam.name}
                          </Text>
                        </View>
                        <Text style={{ 
                          color: 'white', 
                          fontWeight: '500', 
                          flex: 1, 
                          textAlign: 'center',
                          fontSize: 16
                        }}>
                          {match.scores.awayScore1T || 0}
                        </Text>
                        <Text style={{ 
                          color: 'white', 
                          fontWeight: '500', 
                          flex: 1, 
                          textAlign: 'center',
                          fontSize: 16
                        }}>
                          {match.scores.awayScore2T || 0}
                        </Text>
                        <Text style={{ 
                          color: 'white', 
                          fontWeight: '700', 
                          flex: 1, 
                          textAlign: 'center',
                          fontSize: 16
                        }}>
                          {match.scores.awayScore || 0}
                        </Text>
                      </View>
                    </View>
                  )}

                  <Text style={{ 
                    color: 'white', 
                    fontSize: 18, 
                    marginBottom: 16, 
                    fontWeight: '600', 
                    paddingLeft: 4 
                  }}>
                    Événements clés
                  </Text>
                  
                  {keyEvents.length > 0 ? (
                    keyEvents.map((event, index) => (
                      <View 
                        key={event.id} 
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          backgroundColor: index % 2 === 0 ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.04)',
                          borderRadius: 14,
                          marginBottom: 6
                        }}
                      >
                        <View style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.15)',
                          paddingVertical: 4,
                          paddingHorizontal: 8,
                          borderRadius: 8,
                          marginRight: 12
                        }}>
                          <Text style={{ 
                            color: 'white', 
                            fontWeight: '600',
                            fontSize: 14
                          }}>
                            {formatMatchTime(event.matchSecond)}
                          </Text>
                        </View>
                        <Text style={{ 
                          color: 'white', 
                          flex: 1,
                          fontSize: 15
                        }}>
                          {event.description}
                        </Text>
                      </View>
                    ))
                  ) : (
                    <View style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.05)', 
                      padding: 20, 
                      borderRadius: 16, 
                      alignItems: 'center' 
                    }}>
                      <Text style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        textAlign: 'center',
                        fontSize: 16
                      }}>
                        Aucun événement clé disponible
                      </Text>
                    </View>
                  )}
                </>
              )}

              {activeTab === 'stats' && (
                <>
                  <Text style={{ 
                    color: 'white', 
                    fontSize: 22, 
                    fontWeight: 'bold', 
                    marginBottom: 20, 
                    paddingLeft: 4 
                  }}>
                    Statistiques du match
                  </Text>

                  <View style={{ 
                    marginBottom: 28, 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    padding: 20, 
                    borderRadius: 20 
                  }}>
                    <View style={{ 
                      flexDirection: 'row', 
                      justifyContent: 'space-between', 
                      marginBottom: 20 
                    }}>
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center' 
                      }}>
                        <View style={{ 
                          width: 14, 
                          height: 14, 
                          borderRadius: 7, 
                          backgroundColor: '#f5793a',
                          marginRight: 8
                        }} />
                        <Text style={{ 
                          color: 'white', 
                          fontWeight: '600',
                          fontSize: 16
                        }}>
                          {homeTeam.shortName || homeTeam.name}
                        </Text>
                      </View>
                      
                      <View style={{ 
                        flexDirection: 'row', 
                        alignItems: 'center' 
                      }}>
                        <Text style={{ 
                          color: 'white', 
                          fontWeight: '600',
                          fontSize: 16
                        }}>
                          {awayTeam.shortName || awayTeam.name}
                        </Text>
                        <View style={{ 
                          width: 14, 
                          height: 14, 
                          borderRadius: 7, 
                          backgroundColor: '#1e3799',
                          marginLeft: 8
                        }} />
                      </View>
                    </View>
                    
                    {/* Tirs */}
                    <Text style={{ 
                      color: 'white', 
                      fontSize: 18, 
                      marginBottom: 16, 
                      fontWeight: '600' 
                    }}>
                      Tirs
                    </Text>
                    
                    {(() => {
                      const homeTirs = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'TIR')?.total || 0;
                      const awayTirs = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'TIR')?.total || 0;
                      const homeTirsS = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'TIR-S')?.total || 0;
                      const awayTirsS = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'TIR-S')?.total || 0;
                      
                      return (
                        <>
                          <StatBar home={homeTirs} away={awayTirs} label="Tirs" />
                          <StatBar home={homeTirsS} away={awayTirsS} label="Tirs cadrés" />
                        </>
                      );
                    })()}
                    
                    {/* Possession */}
                    <Text style={{ 
                      color: 'white', 
                      fontSize: 18, 
                      marginTop: 28, 
                      marginBottom: 16, 
                      fontWeight: '600' 
                    }}>
                      Possession
                    </Text>
                    
                    {(() => {
                      const homePas = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'PAS')?.total || 0;
                      const awayPas = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'PAS')?.total || 0;
                      const homePasX = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'PAS-X')?.total || 0;
                      const awayPasX = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'PAS-X')?.total || 0;
                      
                      // Calculer les pourcentages de possession
                      const totalPas = homePas + awayPas;
                      const homePossession = totalPas > 0 ? Math.round((homePas / totalPas) * 100) : 50;
                      const awayPossession = totalPas > 0 ? 100 - homePossession : 50;
                      
                      return (
                        <>
                          <StatBar home={homePossession} away={awayPossession} label="Possession (%)" />
                          <StatBar home={homePas} away={awayPas} label="Passes" />
                          <StatBar home={homePasX} away={awayPasX} label="Précision des passes (%)" />
                        </>
                      );
                    })()}
                    
                    {/* Fautes et corners */}
                    <Text style={{ 
                      color: 'white', 
                      fontSize: 18, 
                      marginTop: 28, 
                      marginBottom: 16, 
                      fontWeight: '600' 
                    }}>
                      Fautes et corners
                    </Text>
                    
                    {(() => {
                      const homeFal = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'FAL')?.total || 0;
                      const awayFal = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'FAL')?.total || 0;
                      const homeCrn = match.stats.homeTeam.teamStats.find(stat => stat.parameterCode === 'CRN')?.total || 0;
                      const awayCrn = match.stats.awayTeam.teamStats.find(stat => stat.parameterCode === 'CRN')?.total || 0;
                      
                      return (
                        <>
                          <StatBar home={homeFal} away={awayFal} label="Fautes" />
                          <StatBar home={homeCrn} away={awayCrn} label="Corners" />
                        </>
                      );
                    })()}
                  </View>
                </>
              )}

              {activeTab === 'lineups' && (
                <>
                  <Text style={{ 
                    color: 'white', 
                    fontSize: 22, 
                    fontWeight: 'bold', 
                    marginBottom: 20, 
                    paddingLeft: 4 
                  }}>
                    Compositions
                  </Text>
                  
                  {/* Équipe domicile */}
                  <View style={{ 
                    marginBottom: 28, 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    padding: 20, 
                    borderRadius: 20 
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 16
                    }}>
                      <View style={{ 
                        width: 14, 
                        height: 14, 
                        borderRadius: 7, 
                        backgroundColor: '#f5793a',
                        marginRight: 8
                      }} />
                      <Text style={{ 
                        color: 'white', 
                        fontSize: 18, 
                        fontWeight: '600'
                      }}>
                        {homeTeam.name}
                      </Text>
                    </View>
                    
                    {homeTeam.players && homeTeam.players.length > 0 ? (
                      <FlatList
                        data={homeTeam.players.filter(p => p.role && p.jersey)}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(255, 255, 255, 0.1)'
                          }}>
                            <View style={{ 
                              width: 36, 
                              height: 36, 
                              borderRadius: 18, 
                              backgroundColor: 'rgba(245, 121, 58, 0.8)', // Orange with transparency
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 16
                            }}>
                              <Text style={{ 
                                color: 'white', 
                                fontSize: 16, 
                                fontWeight: '600' 
                              }}>
                                {item.jersey}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ 
                                color: 'white', 
                                fontWeight: '500',
                                fontSize: 16
                              }}>
                                {item.jerseyName}
                              </Text>
                              <Text style={{ 
                                color: 'rgba(255, 255, 255, 0.7)', 
                                fontSize: 14,
                                marginTop: 2
                              }}>
                                {item.role === 'goalkeeper' ? 'Gardien' : 
                                 item.role === 'defender' ? 'Défenseur' :
                                 item.role === 'midfielder' ? 'Milieu' : 'Attaquant'}
                              </Text>
                            </View>
                          </View>
                        )}
                      />
                    ) : (
                      <Text style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        textAlign: 'center', 
                        padding: 16,
                        fontSize: 16
                      }}>
                        Composition non disponible
                      </Text>
                    )}
                  </View>
                  
                  {/* Équipe extérieur */}
                  <View style={{ 
                    marginBottom: 28, 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                    padding: 20, 
                    borderRadius: 20 
                  }}>
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginBottom: 16
                    }}>
                      <View style={{ 
                        width: 14, 
                        height: 14, 
                        borderRadius: 7, 
                        backgroundColor: '#1e3799',
                        marginRight: 8
                      }} />
                      <Text style={{ 
                        color: 'white', 
                        fontSize: 18, 
                        fontWeight: '600'
                      }}>
                        {awayTeam.name}
                      </Text>
                    </View>
                    
                    {awayTeam.players && awayTeam.players.length > 0 ? (
                      <FlatList
                        data={awayTeam.players.filter(p => p.role && p.jersey)}
                        keyExtractor={(item) => item.id.toString()}
                        scrollEnabled={false}
                        renderItem={({ item }) => (
                          <View style={{ 
                            flexDirection: 'row', 
                            alignItems: 'center',
                            paddingVertical: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: 'rgba(255, 255, 255, 0.1)'
                          }}>
                            <View style={{ 
                              width: 36, 
                              height: 36, 
                              borderRadius: 18, 
                              backgroundColor: 'rgba(30, 55, 153, 0.8)', // Blue with transparency
                              alignItems: 'center',
                              justifyContent: 'center',
                              marginRight: 16
                            }}>
                              <Text style={{ 
                                color: 'white', 
                                fontSize: 16, 
                                fontWeight: '600' 
                              }}>
                                {item.jersey}
                              </Text>
                            </View>
                            <View style={{ flex: 1 }}>
                              <Text style={{ 
                                color: 'white', 
                                fontWeight: '500',
                                fontSize: 16
                              }}>
                                {item.jerseyName}
                              </Text>
                              <Text style={{ 
                                color: 'rgba(255, 255, 255, 0.7)', 
                                fontSize: 14,
                                marginTop: 2
                              }}>
                                {item.role === 'goalkeeper' ? 'Gardien' : 
                                 item.role === 'defender' ? 'Défenseur' :
                                 item.role === 'midfielder' ? 'Milieu' : 'Attaquant'}
                              </Text>
                            </View>
                          </View>
                        )}
                      />
                    ) : (
                      <Text style={{ 
                        color: 'rgba(255, 255, 255, 0.7)', 
                        textAlign: 'center', 
                        padding: 16,
                        fontSize: 16
                      }}>
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
