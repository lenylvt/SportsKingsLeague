import { Stack } from 'expo-router';
import { View, Text, ScrollView, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';

export default function Team() {
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
      </View>
    </View>
  );
} 