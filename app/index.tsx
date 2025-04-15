import { Stack } from 'expo-router';
import { TouchableOpacity, Text, View, TextInput, ScrollView, Dimensions, TouchableWithoutFeedback, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useRef } from 'react';
import { AntDesign } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { tournaments } from './data/tournaments';
import { StatusBar } from 'expo-status-bar';
import ExpandableMenu from './components/ExpandableMenu';


export default function Home() {
  const router = useRouter();
  const [showMenu, setShowMenu] = useState(false);
  const screenHeight = Dimensions.get('window').height;

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  // Mapping des pays aux émojis de drapeaux
  const countryToEmoji = {
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

  // Pour chaque tournoi, on prend le split le plus récent
  const getLatestSplits = () => {
    const result = [];
    
    for (const tournament of tournaments) {
      if (tournament.splits && tournament.splits.length > 0) {
        // On groupe par année pour trouver le plus récent
        const yearGroups = {};
        tournament.splits.forEach(split => {
          if (!yearGroups[split.year] || 
              split.id > yearGroups[split.year].id) {
            yearGroups[split.year] = split;
          }
        });
        
        // On prend le split de l'année la plus récente
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

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', position: 'relative', overflow: Platform.OS === "web" ? 'scroll' : undefined }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#FFC107', 'transparent']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: screenHeight * 0.3,
        }}
      />
      
      <SafeAreaView className={`flex-1 max-w-[767px] mx-auto w-full`}>
        <Stack.Screen 
          options={{ 
            headerShown: false,
          }} 
        />
        
        <View className="px-4 pt-2 relative">
          <View className="flex-row items-center justify-between mb-4 relative" style={{ zIndex: 10 }}>
            <View className="flex-row items-center">
              <Text style={{ 
                color: 'white', 
                fontSize: 38, 
                fontWeight: '700', 
                fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
                paddingTop: 8
              }}>
                Kings
              </Text>
            </View>

            <ExpandableMenu isOpen={showMenu} onToggle={toggleMenu} />
          </View>

          <View className="mb-4">
            <View className="bg-white/10 flex-row items-center px-4 py-2.5 rounded-xl border border-white/5">
              <Ionicons name="search" size={20} color="white" style={{opacity: 0.7, marginRight: 8}} />
              <TextInput 
                placeholder="Ligues et Équipes"
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="flex-1 text-white text-base"
                style={{
                  fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
                  fontWeight: '400',
                  fontSize: 16
                }}
              />
              <TouchableOpacity>
                <Ionicons name="mic-outline" size={20} color="white" style={{opacity: 0.7}} />
              </TouchableOpacity>
            </View>
          </View>
        
          <ScrollView showsVerticalScrollIndicator={false} className={`space-y-4 ${showMenu ? '-z-10' : ''}`}>
            <Text style={{ 
              color: 'white', 
              fontSize: 22, 
              fontWeight: '600',
              fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
              marginBottom: 16
            }}>
              Naviguer les Compétitions
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {latestSplits.map((item) => (
                <TouchableOpacity 
                  key={item.id}
                  className="w-[31%] mb-6 items-center"
                  onPress={() => router.push(`/tournament/${item.id}` as any)}
                >
                  <View className="w-20 h-20 rounded-2xl items-center justify-center mb-2 bg-white/10">
                    <Text style={{ fontSize: 40 }}>
                      {countryToEmoji[item.category.alpha2 || '']}
                    </Text>
                  </View>
                  <Text className="text-white text-center font-semibold text-sm mb-1">{item.name}</Text>
                  <View className="bg-white/10 rounded-full px-2 py-0.5">
                    <Text className="text-gray-400 text-center text-xs">{item.splitName}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
}
