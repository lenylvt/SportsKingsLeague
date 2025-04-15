import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Image, TouchableOpacity } from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Définition des types pour les équipes et les matchs
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
  players?: Array<{
    id: number;
    firstName: string;
    lastName: string;
    jerseyName: string;
    image: {
      url: string;
    } | null;
    role: string;
  }>;
}

interface Match {
  id: number;
  date: string;
  seasonId: number;
  status: string;
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
  };
  events: Array<{
    id: string;
    half: number;
    second: number;
    teamId: number;
    playerId: number | null;
    parameterAppString: string;
  }>;
}

export default function MatchDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [match, setMatch] = useState<Match | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMatchDetails = async () => {
      try {
        setIsLoading(true);
        // Récupération des détails du match
        const response = await fetch(`https://kingsleague.pro/api/v1/competition/matches/${id}?live=false`, {
          headers: {
            'referer': 'https://kingsleague.pro/',
            'lang': 'fr'
          }
        });
        
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des détails du match');
        }

        const data = await response.json();
        setMatch(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchMatchDetails();
    }
  }, [id]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#000' }}>
        <ActivityIndicator size="large" color="#FFC107" />
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
          <View style={{ 
            flexDirection: 'row', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            width: '100%',
            marginBottom: 40
          }}>
            <View style={{ flex: 1, alignItems: 'center' }}>
              {homeTeam.logo && (
                <Image 
                  source={{ uri: homeTeam.logo.url }} 
                  style={{ width: 80, height: 80, resizeMode: 'contain', marginBottom: 8 }}
                />
              )}
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
                {homeTeam.name}
              </Text>
            </View>

            <View style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.05)', 
              paddingHorizontal: 16, 
              paddingVertical: 8, 
              borderRadius: 12,
              alignItems: 'center'
            }}>
              {match.status === 'ended' ? (
                <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
                  {match.scores.homeScore} - {match.scores.awayScore}
                </Text>
              ) : (
                <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold' }}>VS</Text>
              )}
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14, marginTop: 4 }}>
                {formattedDate}
              </Text>
              <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 14 }}>
                {formattedTime}
              </Text>
            </View>

            <View style={{ flex: 1, alignItems: 'center' }}>
              {awayTeam.logo && (
                <Image 
                  source={{ uri: awayTeam.logo.url }} 
                  style={{ width: 80, height: 80, resizeMode: 'contain', marginBottom: 8 }}
                />
              )}
              <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', textAlign: 'center' }}>
                {awayTeam.name}
              </Text>
            </View>
          </View>

          <View style={{ 
            backgroundColor: 'rgba(0, 0, 0, 0.5)', 
            borderRadius: 16, 
            paddingVertical: 16, 
            paddingHorizontal: 8,
            width: '100%',
            maxHeight: 500
          }}>
            <ScrollView 
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 40 }}
              showsVerticalScrollIndicator={true}
            >
              <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', marginBottom: 16, paddingLeft: 8 }}>
                Résumé du match
              </Text>

              {match.status === 'ended' && (
                <View style={{ marginBottom: 20, paddingHorizontal: 16 }}>
                  <Text style={{ color: 'white', fontSize: 16, marginBottom: 8, fontWeight: '600' }}>Score par période</Text>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 1 }}>Mi-temps 1</Text>
                    <Text style={{ color: 'white', fontWeight: '500' }}>
                      {match.scores.homeScore1T} - {match.scores.awayScore1T}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: 'rgba(255, 255, 255, 0.7)', flex: 1 }}>Mi-temps 2</Text>
                    <Text style={{ color: 'white', fontWeight: '500' }}>
                      {match.scores.homeScore2T} - {match.scores.awayScore2T}
                    </Text>
                  </View>
                </View>
              )}

              {/* Ici, on pourrait ajouter d'autres sections comme les statistiques du match, 
                  les événements clés, etc. selon les données disponibles */}
            </ScrollView>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}
