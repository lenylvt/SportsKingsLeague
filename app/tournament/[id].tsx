import React, { useState, useEffect, useRef } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Pressable, ScrollView, Platform, Modal, Animated, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { tournaments, TournamentSplit } from '../data/tournaments';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';
import TeamList from '../components/TeamList';
import { useTeams } from '../hooks/useTeams';
import { useCompetitionSeason } from '../hooks/useCompetitionSeason';
import StandingsTable from '../components/StandingsTable';

interface MatchProps {
  match: {
    id: number;
    date: string;
    participants: {
      homeTeamId: number;
      awayTeamId: number;
    };
    scores: {
      homeScore: number | null;
      awayScore: number | null;
    };
  };
  teams: Array<{
    id: number;
    name: string;
    logo?: {
      url: string;
    };
  }>;
}

// Nouveau composant pour les détails de match
const MatchCard = ({ match, teams }: MatchProps) => {
  const router = useRouter();
  const homeTeam = teams?.find(t => t.id === match.participants.homeTeamId);
  const awayTeam = teams?.find(t => t.id === match.participants.awayTeamId);
  
  return (
    <TouchableOpacity 
      key={match.id}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8
      }}
      onPress={() => router.push(`/match/${match.id}`)}
      activeOpacity={0.7}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View style={{ flex: 1, alignItems: 'flex-end', paddingRight: 10 }}>
          {homeTeam?.logo && (
            <View style={{ width: 24, height: 24, marginBottom: 4 }}>
              <Image 
                source={{ uri: homeTeam.logo.url }} 
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
              />
            </View>
          )}
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
            {homeTeam?.name || `Équipe ${match.participants.homeTeamId}`}
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
          {awayTeam?.logo && (
            <View style={{ width: 24, height: 24, marginBottom: 4 }}>
              <Image 
                source={{ uri: awayTeam.logo.url }} 
                style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
              />
            </View>
          )}
          <Text style={{ color: 'white', fontSize: 14, fontWeight: '500' }}>
            {awayTeam?.name || `Équipe ${match.participants.awayTeamId}`}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default function TournamentDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [tournament, setTournament] = useState(() => {
    const mainTournament = tournaments.find(t => t.splits?.some(split => split.id === Number(id)));
    return mainTournament || null;
  });
  const [selectedTab, setSelectedTab] = useState('Matches');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [currentSplit, setCurrentSplit] = useState<TournamentSplit | null>(null);
  const [currentSplitId, setCurrentSplitId] = useState<number>(Number(id));
  
  // Animation simple de fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const { teams, isLoading: teamsLoading, error: teamsError } = useTeams(currentSplitId);
  const { season, isLoading: seasonLoading, error: seasonError } = useCompetitionSeason(currentSplitId);

  useEffect(() => {
    // Animation d'entrée
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true,
    }).start();

    // Trouver le tournoi principal
    const mainTournament = tournaments.find(t =>
      t.splits?.some(split => split.id === Number(id))
    );
    if (mainTournament) {
      setTournament(mainTournament);
      const split = mainTournament.splits?.find(s => s.id === Number(id));
      if (split) {
        setCurrentSplit(split);
        setCurrentSplitId(Number(id));
      }
    }
  }, [id]);

  const handleChangeSplit = (splitId: number) => {
    if (splitId === currentSplitId) {
      setShowPicker(false);
      return;
    }
    setShowPicker(false);
    
    // Mettre à jour l'URL silencieusement sans recharger la page
    router.setParams({ id: splitId.toString() });
    
    // Mettre à jour localement le split actuel
    if (tournament && tournament.splits) {
      const newSplit = tournament.splits.find(s => s.id === splitId);
      if (newSplit) {
        setCurrentSplit(newSplit);
        setCurrentSplitId(splitId);
      }
    }
  };

  if (!tournament) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center">
        <Text className="text-white">Compétition introuvable</Text>
      </SafeAreaView>
    );
  }

  const countryToEmoji: Record<string, string> = {
    'ES': '🇪🇸',
    'IT': '🇮🇹',
    'FR': '🇫🇷',
    'DE': '🇩🇪',
    'GB': '🇬🇧',
    'PT': '🇵🇹',
    'BR': '🇧🇷',
    'AM': '🌎',
    'CL': '🏆',
    'NT': '🌍'
  };

  const tabs = ['Matches', 'Classement', 'Équipes'];

  return (
    <Animated.View 
      style={{ 
        flex: 1, 
        backgroundColor: '#000000', 
        position: 'relative',
        opacity: fadeAnim
      }}
    >
      <LinearGradient
        colors={['#FFC107', '#000000']}
        style={{ height: 300, position: 'absolute', top: 0, left: 0, right: 0 }}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
      />

      <SafeAreaView className="flex-1 max-w-[767px] mx-auto w-full mt-4">
        <View className="flex-row justify-between px-4">
          <TouchableOpacity
            onPress={() => router.back()}
            className="bg-black/30 rounded-full w-10 h-10 justify-center items-center"
          >
            <Ionicons name="close" size={26} color="white" />
          </TouchableOpacity>

          <View className="flex-1 items-center">
            <View className="w-16 h-16 rounded-2xl items-center justify-center mb-2">
              <Text style={{ fontSize: 48 }}>
                {countryToEmoji[tournament.category.alpha2 || '']}
              </Text>
            </View>
            <Text className="text-white text-2xl font-semibold">{tournament.name}</Text>
            {/* Bouton split minimaliste */}
            <TouchableOpacity
              onPress={() => setShowPicker(true)}
              style={{ alignItems: 'center', marginTop: 8, paddingVertical: 2, paddingHorizontal: 10, borderRadius: 12, backgroundColor: 'rgba(255,255,255,0.07)', flexDirection: 'column', minWidth: 90 }}
              activeOpacity={0.8}
            >
              <Text className="text-white text-base font-medium" numberOfLines={1}>
                {currentSplit ? currentSplit.name : tournament.category.name}
              </Text>
            </TouchableOpacity>
            {/* Modal Picker natif */}
            {showPicker && (
              <Modal
                visible={showPicker}
                transparent
                animationType="fade"
                onRequestClose={() => setShowPicker(false)}
              >
                <TouchableOpacity
                  style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)' }}
                  activeOpacity={1}
                  onPress={() => setShowPicker(false)}
                />
                <View style={{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#181818', borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingBottom: Platform.OS === 'ios' ? 24 : 0 }}>
                  <Picker
                    selectedValue={currentSplitId}
                    onValueChange={handleChangeSplit}
                    style={{ color: 'white', width: '100%' }}
                    itemStyle={{ color: 'white', fontSize: 17 }}
                    dropdownIconColor="#aaa"
                  >
                    {tournament.splits && tournament.splits.map((split) => (
                      <Picker.Item
                        key={split.id}
                        label={`${split.name} (${split.year})`}
                        value={split.id}
                      />
                    ))}
                  </Picker>
                </View>
              </Modal>
            )}
          </View>

          <TouchableOpacity
            onPress={() => setIsFavorite(!isFavorite)}
            className="bg-black/30 rounded-full w-10 h-10 justify-center items-center"
          >
            <Ionicons
              name={isFavorite ? 'star' : 'star-outline'}
              size={20}
              color="white"
            />
          </TouchableOpacity>
        </View>

        <View className="mx-4 mt-4 bg-black/40 rounded-xl overflow-hidden">
          <View className="p-1 flex-row border-b border-white/10">
            {tabs.map((tab) => (
              <Pressable
                key={tab}
                onPress={() => setSelectedTab(tab)}
                className={`flex-1 py-2 px-4 ${selectedTab === tab ? 'bg-[#FFC107]/20 rounded-lg' : ''}`}
              >
                <Text
                  className={`text-center text-base ${
                    selectedTab === tab
                      ? 'text-white font-semibold'
                      : 'text-white/60'
                  }`}
                >
                  {tab}
                </Text>
              </Pressable>
            ))}
          </View>

          {selectedTab === 'Matches' && (
            <ScrollView 
              className="p-4"
              contentContainerStyle={{ paddingBottom: 100 }}
              showsVerticalScrollIndicator={true}
            >
              {seasonLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#FFC107" />
                </View>
              ) : seasonError ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                    Une erreur est survenue lors du chargement des matchs
                  </Text>
                </View>
              ) : season && season.phases[0]?.groups[0]?.turns ? (
                season.phases[0].groups[0].turns.map((turn) => (
                  <View key={turn.id} style={{ marginBottom: 24 }}>
                    <Text style={{ color: 'white', fontSize: 18, fontWeight: '600', marginBottom: 12 }}>
                      {turn.name}
                    </Text>
                    {turn.matches.map((match) => (
                      <MatchCard key={match.id} match={match} teams={season.teams} />
                    ))}
                  </View>
                ))
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                    Aucun match programmé pour le moment
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          {selectedTab === 'Classement' && (
            <ScrollView className="p-4">
              {seasonLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#FFC107" />
                </View>
              ) : seasonError ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                    Une erreur est survenue lors du chargement du classement
                  </Text>
                </View>
              ) : season && season.standings ? (
                <StandingsTable standings={season.standings} />
              ) : (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                    Classement non disponible
                  </Text>
                </View>
              )}
            </ScrollView>
          )}

          {selectedTab === 'Équipes' && (
            <ScrollView className="p-4">
              {teamsLoading ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <ActivityIndicator size="large" color="#FFC107" />
                </View>
              ) : teamsError ? (
                <View style={{ padding: 20, alignItems: 'center' }}>
                  <Text style={{ color: 'rgba(255, 255, 255, 0.7)', textAlign: 'center' }}>
                    Une erreur est survenue lors du chargement des équipes
                  </Text>
                </View>
              ) : (
                <TeamList teams={teams} competitionId={currentSplitId} />
              )}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

// Pas besoin de StyleSheet ici car tout est animé en JS natif 