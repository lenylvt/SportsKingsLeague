import React, { useState, useEffect, useRef } from 'react';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { View, Text, TouchableOpacity, Pressable, ScrollView, Platform, Modal, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { tournaments, TournamentSplit } from '../data/tournaments';
import { Ionicons } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

export default function TournamentDetail() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [tournament, setTournament] = useState(tournaments.find(t => t.id === Number(id)));
  const [selectedTab, setSelectedTab] = useState('Matches');
  const [isFavorite, setIsFavorite] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [currentSplit, setCurrentSplit] = useState<TournamentSplit | null>(null);
  const [currentSplitId, setCurrentSplitId] = useState<number>(Number(id));
  
  // Animation simple de fade-in
  const fadeAnim = useRef(new Animated.Value(0)).current;

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
            <View className="items-center justify-center p-6">
              <Text className="text-white text-xl mb-4">Prochains Matchs</Text>
              <Text className="text-white/70">Aucun match programmé pour le moment</Text>
            </View>
          )}

          {selectedTab === 'Classement' && (
            <View className="items-center justify-center p-6">
              <Text className="text-white text-xl mb-4">Classement</Text>
              <Text className="text-white/70">Classement non disponible</Text>
            </View>
          )}

          {selectedTab === 'Équipes' && (
            <ScrollView className="p-4">
              <Text className="text-white text-xl mb-4">Équipes</Text>
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <View key={item} className="flex-row items-center bg-black/30 rounded-lg p-3 mb-3">
                  <View className="w-10 h-10 bg-white/10 rounded-lg mr-4"></View>
                  <Text className="text-white font-medium">Équipe {item}</Text>
                </View>
              ))}
            </ScrollView>
          )}
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

// Pas besoin de StyleSheet ici car tout est animé en JS natif 