import '../global.css';

import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#000000' }}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: '#000000' },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
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
      </Stack> 
    </GestureHandlerRootView>
  );
}
