import { Stack } from 'expo-router';
import { View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ExpandableMenu from './components/ExpandableMenu';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

export default function Home() {
  const [showMenu, setShowMenu] = useState(false);
  const router = useRouter();

  const quickActions = [
    { icon: 'search-outline', label: 'Rechercher', route: '/search' },
    { icon: 'trophy', label: 'Mes Ligues', route: '/league' },
    { icon: 'star', label: 'Mes Équipes', route: '/team' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#000000', position: 'relative' }}>
      <StatusBar style="light" />
      <LinearGradient
        colors={['#FFC107', 'transparent']}
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '30%',
        }}
      />
      
      <SafeAreaView className="flex-1 max-w-[767px] mx-auto w-full">
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

            <ExpandableMenu isOpen={showMenu} onToggle={() => setShowMenu(!showMenu)} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} className={`space-y-4 ${showMenu ? '-z-10' : ''}`}>
            <Text style={{ 
              color: 'white', 
              fontSize: 22, 
              fontWeight: '600',
              fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
              marginBottom: 16
            }}>
              Actions Rapides
            </Text>

            <View className="flex-row flex-wrap justify-between">
              {quickActions.map((action, index) => (
                <TouchableOpacity 
                  key={index}
                  className="w-[31%] mb-6 items-center"
                  onPress={() => router.push(action.route as any)}
                >
                  <View className="w-20 h-20 rounded-2xl items-center justify-center mb-2 bg-white/10">
                    <Ionicons name={action.icon as any} size={32} color="white" />
                  </View>
                  <Text className="text-white text-center font-semibold text-sm">{action.label}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View className="mt-8">
              <Text style={{ 
                color: 'white', 
                fontSize: 22, 
                fontWeight: '600',
                fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
                marginBottom: 16
              }}>
                Actualités
              </Text>
              
              <View className="bg-white/10 rounded-xl p-4">
                <Text style={{ 
                  color: 'white', 
                  fontSize: 16, 
                  fontWeight: '400',
                  fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
                  opacity: 0.7,
                  textAlign: 'center'
                }}>
                  Aucune actualité pour le moment
                </Text>
              </View>
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
} 