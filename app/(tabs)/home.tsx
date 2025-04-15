import { Stack } from 'expo-router';
import { View, Text, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

type QuickAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: '/(tabs)/search' | '/(tabs)/league' | '/(tabs)/team';
};

export default function Home() {
  const router = useRouter();

  const quickActions: QuickAction[] = [
    { icon: 'search-outline', label: 'Recherche', route: '/(tabs)/search' },
    { icon: 'trophy-outline', label: 'Ligues', route: '/(tabs)/league' },
    { icon: 'star-outline', label: 'Équipes', route: '/(tabs)/team' },
  ];

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
            {/* Quick Actions */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  style={{
                    flex: 1,
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    borderRadius: 16,
                    padding: 16,
                    marginHorizontal: 4,
                    alignItems: 'center',
                  }}
                  onPress={() => router.push(action.route)}
                >
                  <Ionicons name={action.icon} size={24} color="white" />
                  <Text style={{ 
                    color: 'white',
                    fontSize: 14,
                    marginTop: 8,
                    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif'
                  }}>
                    {action.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View>
              <Text style={{ 
                color: 'white', 
                fontSize: 22, 
                fontWeight: '600',
                fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
                marginBottom: 16
              }}>
                Actualités
              </Text>
              
              <View style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                borderRadius: 12,
                padding: 16
              }}>
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
      </View>
    </View>
  );
} 