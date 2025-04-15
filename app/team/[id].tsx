import React, { useState, useEffect } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView, Image, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

// Fonction utilitaire pour les logs
const logInfo = (message: string, data?: any) => {
  console.log(`[TeamDetail] 📘 ${message}`, data ? data : '');
};

const logError = (message: string, error?: any) => {
  console.error(`[TeamDetail] 🔴 ${message}`, error ? error : '');
  if (error?.stack) {
    console.error(`[TeamDetail] 🔴 Stack: ${error.stack}`);
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
  currentSeasons: Array<{
    id: number;
    name: string;
    competition: {
      name: string;
    };
  }>;
  players: Player[];
  matches: Match[];
}

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

interface Match {
  id: number;
  date: string;
  participants: {
    homeTeamId: number;
    awayTeamId: number;
    homeTeam: {
      name: string;
      logo: {
        url: string;
      };
    };
    awayTeam: {
      name: string;
      logo: {
        url: string;
      };
    };
  };
  scores: {
    homeScore: number | null;
    awayScore: number | null;
  };
  seasonId: number;
}

export default function TeamDetail() {
  const { id, competitionId } = useLocalSearchParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [activeTab, setActiveTab] = useState<'roster' | 'matches'>('roster');

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        logInfo(`Récupération des détails de l'équipe avec l'ID: ${id}, competitionId: ${competitionId || 'non spécifié'}`);
        setIsLoading(true);
        
        const apiCompetitionId = competitionId ? Number(competitionId) : 21;
        const apiUrl = `https://kingsleague.pro/api/v1/teams/${id}?competition=${apiCompetitionId}`;
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
          throw new Error(`Erreur lors de la récupération des détails de l'équipe (${response.status})`);
        }

        const data = await response.json();
        logInfo(`Données reçues pour l'équipe ${id}`, {
          name: data?.name,
          players: data?.players?.length || 0,
          matches: data?.matches?.length || 0
        });
        
        setTeam(data);
      } catch (err) {
        logError(`Erreur lors du chargement de l'équipe ${id}`, err);
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTeamDetails();
    } else {
      logError("ID de l'équipe non défini");
      setIsLoading(false);
    }
  }, [id, competitionId]);

  const goToMatchDetail = (match: Match) => {
    try {
      const matchCompetitionId = 21; // Kings League
      logInfo(`Navigation vers les détails du match ${match.id}, competitionId: ${matchCompetitionId}`);
      router.push({
        pathname: "/match/[id]",
        params: { 
          id: match.id.toString(), 
          competitionId: matchCompetitionId.toString() 
        }
      });
    } catch (error) {
      logError(`Erreur lors de la navigation vers le match ${match.id}`, error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#FFC107" />
      </View>
    );
  }

  if (error || !team) {
    return (
      <View style={{ flex: 1, backgroundColor: '#000000', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ color: 'white', textAlign: 'center' }}>
          {error?.message || 'Équipe introuvable'}
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={[team.firstColorHEX || '#FFC107', '#000000']}
        style={{ height: 300, position: 'absolute', top: 0, left: 0, right: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView style={{ flex: 1, maxWidth: 767, width: '100%', marginHorizontal: 'auto' }}>
        <Stack.Screen 
          options={{ 
            headerShown: false,
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }} 
        />

        <View style={{ paddingHorizontal: 16, marginTop: 16 }}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
              width: 40,
              height: 40,
              borderRadius: 20,
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 24
            }}
          >
            <Ionicons name="close" size={24} color="white" />
          </TouchableOpacity>

          <View style={{ alignItems: 'center', marginBottom: 32 }}>
            {team.logo?.url ? (
              <Image
                source={{ uri: team.logo.url }}
                style={{
                  width: 120,
                  height: 120,
                  marginBottom: 16,
                  borderRadius: 16
                }}
                resizeMode="contain"
              />
            ) : (
              <View
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 16,
                  backgroundColor: team.firstColorHEX || '#FFC107',
                  marginBottom: 16
                }}
              />
            )}
            <Text style={{
              color: 'white',
              fontSize: 28,
              fontWeight: '600',
              marginBottom: 8,
              textAlign: 'center',
              fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif'
            }}>
              {team.name}
            </Text>
            <Text style={{
              color: 'rgba(255, 255, 255, 0.7)',
              fontSize: 16,
              textAlign: 'center',
              fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif'
            }}>
              {team.shortName}
            </Text>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 32 }}>
              <Text style={{
                color: 'white',
                fontSize: 20,
                fontWeight: '600',
                marginBottom: 16,
                fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif'
              }}>
                Compétitions
              </Text>
              {team.currentSeasons.map((season) => (
                <TouchableOpacity
                  key={season.id}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12
                  }}
                  onPress={() => router.push(`/tournament/${season.id}`)}
                >
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '500',
                    marginBottom: 4,
                    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif'
                  }}>
                    {season.competition.name}
                  </Text>
                  <Text style={{
                    color: 'rgba(255, 255, 255, 0.6)',
                    fontSize: 14,
                    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif'
                  }}>
                    {season.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {activeTab === 'matches' && (
            <View>
              {team.matches && team.matches.length > 0 ? (
                team.matches.map((match) => (
                  <TouchableOpacity
                    key={match.id}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.05)',
                      borderRadius: 12,
                      padding: 12,
                      marginBottom: 8
                    }}
                    onPress={() => goToMatchDetail(match)}
                    activeOpacity={0.7}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 10 }}>
                        {match.participants.homeTeam?.logo && (
                          <View style={{ width: 24, height: 24, marginBottom: 4 }}>
                            <Image 
                              source={{ uri: match.participants.homeTeam.logo.url }} 
                              style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                            />
                          </View>
                        )}
                        <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                          {match.participants.homeTeam?.name || `Équipe ${match.participants.homeTeamId}`}
                        </Text>
                      </View>
                      <View style={{ marginHorizontal: 12, alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>
                          {match.scores.homeScore !== null ? `${match.scores.homeScore} - ${match.scores.awayScore}` : 'vs'}
                        </Text>
                        <Text style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: 12 }}>
                          {new Date(match.date).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Text>
                      </View>
                      <View style={{ flex: 1, paddingLeft: 10 }}>
                        {match.participants.awayTeam?.logo && (
                          <View style={{ width: 24, height: 24, marginBottom: 4 }}>
                            <Image 
                              source={{ uri: match.participants.awayTeam.logo.url }} 
                              style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
                            />
                          </View>
                        )}
                        <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
                          {match.participants.awayTeam?.name || `Équipe ${match.participants.awayTeamId}`}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center', padding: 20 }}>
                  Aucun match disponible
                </Text>
              )}
            </View>
          )}
        </View>
      </SafeAreaView>
    </View>
  );
} 