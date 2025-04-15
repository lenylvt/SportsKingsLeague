import React, { useState, useEffect } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, ScrollView, Image, Platform, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

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
}

export default function TeamDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchTeamDetails = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`https://kingsleague.pro/api/v1/team/${id}`, {
          headers: {
            'referer': 'https://kingsleague.pro/',
            'lang': 'fr'
          }
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des détails de l\'équipe');
        }

        const data = await response.json();
        setTeam(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Une erreur est survenue'));
      } finally {
        setIsLoading(false);
      }
    };

    if (id) {
      fetchTeamDetails();
    }
  }, [id]);

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
        </View>
      </SafeAreaView>
    </View>
  );
} 