import { Stack } from 'expo-router';
import { View, Text, ScrollView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import ExpandableMenu from './components/ExpandableMenu';
import { useState } from 'react';
import { LinearGradient } from 'expo-linear-gradient';

export default function Team() {
  const [showMenu, setShowMenu] = useState(false);

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
              fontSize: 18, 
              fontWeight: '400',
              fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
              opacity: 0.7,
              textAlign: 'center',
              marginTop: 40
            }}>
              Vous n'avez pas encore ajouté d'équipes favorites
            </Text>
          </ScrollView>
        </View>
      </SafeAreaView>
    </View>
  );
} 