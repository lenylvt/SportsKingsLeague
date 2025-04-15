import '../global.css';
import { Slot, Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Platform, Image } from 'react-native';
import { useState } from 'react';
import ExpandableMenu from './components/ExpandableMenu';

export default function RootLayout() {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />
      <View style={{ flex: 1 }}>
        {/* Header persistant avec menu */}
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          paddingTop: (Platform.OS === 'ios' ? 50 : 30) + 10,
          paddingBottom: 10,
          paddingHorizontal: 16,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            height: 48,
          }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Image 
                source={{ uri: 'https://i.ibb.co/h1275Bcb/image.png' }}
                style={{ width: 48, height: 48 }}
                resizeMode="contain"
              />
              <Text style={{ 
                color: 'white',
                fontSize: 38,
                fontWeight: '700',
                fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
                marginLeft: 8,
                includeFontPadding: false,
                textAlignVertical: 'center',
                lineHeight: 48
              }}>
                Kings
              </Text>
            </View>
            <View style={{ height: 48, justifyContent: 'center' }}>
              <ExpandableMenu isOpen={showMenu} onToggle={() => setShowMenu(!showMenu)} />
            </View>
          </View>
        </View>

        {/* Stack principal */}
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#000000' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen 
            name="tournament/[id]" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
              animationDuration: 250,
              contentStyle: { backgroundColor: '#000000' },
            }} 
          />
          <Stack.Screen 
            name="team/[id]" 
            options={{ 
              headerShown: false,
              presentation: 'modal',
              animation: 'slide_from_bottom',
              animationDuration: 250,
              contentStyle: { backgroundColor: '#000000' },
            }} 
          />
        </Stack>
      </View>
    </GestureHandlerRootView>
  );
}
