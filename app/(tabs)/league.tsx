import { Stack, useRouter } from 'expo-router';
import { View, Text, ScrollView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { useFavorites } from '../hooks/useFavorites';
import { Ionicons } from '@expo/vector-icons';

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

export default function League() {
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#FFC107', 'transparent']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          height: '30%',
        }}
      />
      
      <View style={{ flex: 1, maxWidth: 767, width: '100%', marginHorizontal: 'auto', paddingTop: 120 }}>
        <Stack.Screen 
          options={{ 
            headerShown: false,
          }} 
        />
        
        <View style={{ paddingHorizontal: 16 }}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {isLoading ? (
              <ActivityIndicator size="large" color="#FFC107" style={{ marginTop: 40 }} />
            ) : favorites.length === 0 ? (
              <View style={{ alignItems: 'center', marginTop: 40 }}>
                <Text style={{ 
                  color: 'white', 
                  fontSize: 18, 
                  fontWeight: '400',
                  fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
                  opacity: 0.7,
                  textAlign: 'center',
                  marginBottom: 24
                }}>
                  Vous n'avez pas encore ajouté de ligues favorites
                </Text>
                <TouchableOpacity
                  onPress={() => router.push('/(tabs)/search')}
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    paddingHorizontal: 20,
                    paddingVertical: 12,
                    borderRadius: 12,
                    flexDirection: 'row',
                    alignItems: 'center'
                  }}
                >
                  <Ionicons name="search-outline" size={20} color="white" style={{ marginRight: 8 }} />
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    fontWeight: '500',
                    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
                  }}>
                    Parcourir les ligues
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
                {favorites.map((league) => (
                  <TouchableOpacity 
                    key={league.id}
                    style={{
                      width: '31%',
                      marginBottom: 24,
                      alignItems: 'center'
                    }}
                    onPress={() => router.push(`/tournament/${league.id}`)}
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
                        {countryToEmoji[league.category.alpha2 || ''] || '🏆'}
                      </Text>
                    </View>
                    <Text style={{
                      color: 'white',
                      textAlign: 'center',
                      fontWeight: '600',
                      fontSize: 14,
                      marginBottom: 4
                    }}>
                      {league.name}
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
                        {league.splitName}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => removeFavorite(league.id)}
                      style={{
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: 12,
                        padding: 6
                      }}
                    >
                      <Ionicons name="heart" size={16} color="#FFC107" />
                    </TouchableOpacity>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </View>
  );
} 