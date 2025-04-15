import { Stack } from 'expo-router';
import { TouchableOpacity, Text, View, TextInput, ScrollView, Dimensions, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { tournaments, Tournament as ImportedTournament } from '../data/tournaments';
import { StatusBar } from 'expo-status-bar';
import { useFavorites } from '../hooks/useFavorites';

interface Split {
  id: number;
  year: string;
  name: string;
}

interface Tournament {
  splits: Split[];
  name: string;
  category: {
    alpha2?: string;
  };
}

export default function Search() {
  const router = useRouter();
  const screenHeight = Dimensions.get('window').height;
  const { addFavorite, removeFavorite, isFavorite } = useFavorites();

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

  const getLatestSplits = () => {
    const result = [];
    
    for (const tournament of tournaments) {
      if (tournament.splits && tournament.splits.length > 0) {
        const yearGroups: Record<string, Split> = {};
        tournament.splits.forEach(split => {
          if (!yearGroups[split.year] || 
              split.id > yearGroups[split.year].id) {
            yearGroups[split.year] = split;
          }
        });
        
        const years = Object.keys(yearGroups).sort().reverse();
        const latestSplit = yearGroups[years[0]];
        
        result.push({
          id: latestSplit.id,
          name: tournament.name,
          category: tournament.category,
          splitName: latestSplit.name,
          year: latestSplit.year
        });
      }
    }
    
    return result;
  };

  const latestSplits = getLatestSplits();

  const handleToggleFavorite = (league: any) => {
    if (isFavorite(league.id)) {
      removeFavorite(league.id);
    } else {
      addFavorite(league);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#FFC107', 'transparent']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: screenHeight * 0.3,
        }}
      />
      
      <View style={{ flex: 1, maxWidth: 767, width: '100%', marginHorizontal: 'auto', paddingTop: 120 }}>
        <Stack.Screen 
          options={{ 
            headerShown: false,
          }} 
        />
        
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ marginBottom: 16 }}>
            <View style={{ 
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              flexDirection: 'row',
              alignItems: 'center',
              paddingHorizontal: 16,
              paddingVertical: 10,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: 'rgba(255, 255, 255, 0.05)'
            }}>
              <Ionicons name="search" size={20} color="white" style={{opacity: 0.7, marginRight: 8}} />
              <TextInput 
                placeholder="Ligues et Équipes"
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={{
                  flex: 1,
                  color: 'white',
                  fontSize: 16,
                  fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
                  fontWeight: '400'
                }}
              />
              <TouchableOpacity>
                <Ionicons name="mic-outline" size={20} color="white" style={{opacity: 0.7}} />
              </TouchableOpacity>
            </View>
          </View>
        
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={{ 
              color: 'white', 
              fontSize: 22, 
              fontWeight: '600',
              fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
              marginBottom: 16
            }}>
              Naviguer les Compétitions
            </Text>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
              {latestSplits.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  style={{
                    width: '31%',
                    marginBottom: 24,
                    alignItems: 'center'
                  }}
                  onPress={() => router.push(`/tournament/${item.id}`)}
                >
                  <View style={{
                    width: 80,
                    height: 80,
                    borderRadius: 16,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)'
                  }}>
                    <Text style={{ fontSize: 40 }}>
                      {countryToEmoji[item.category.alpha2 || ''] || '🏆'}
                    </Text>
                  </View>
                  <Text style={{
                    color: 'white',
                    textAlign: 'center',
                    fontWeight: '600',
                    fontSize: 14,
                    marginBottom: 4
                  }}>
                    {item.name}
                  </Text>
                  <View style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 12,
                    paddingHorizontal: 8,
                    paddingVertical: 2,
                    marginBottom: 8
                  }}>
                    <Text style={{
                      color: 'rgba(255, 255, 255, 0.6)',
                      textAlign: 'center',
                      fontSize: 12
                    }}>
                      {item.splitName}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => {
                      e.stopPropagation();
                      handleToggleFavorite(item);
                    }}
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.1)',
                      borderRadius: 12,
                      padding: 6
                    }}
                  >
                    <Ionicons 
                      name={isFavorite(item.id) ? "heart" : "heart-outline"} 
                      size={16} 
                      color={isFavorite(item.id) ? "#FFC107" : "white"} 
                    />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
}