import { Tabs } from 'expo-router';

export default function TabsLayout() {
  return (
    <Tabs screenOptions={{ 
      headerShown: false, // Pas d'en-tête par défaut pour les écrans d'onglets
      tabBarShowLabel: false, // Cache les labels
      tabBarStyle: { display: 'none' } // Cache complètement la barre d'onglets
    }}>
      {/* Définir les écrans ici si une configuration spécifique est nécessaire,
          sinon Expo Router les détecte automatiquement. 
          Laisser vide pour la détection automatique. */}
      {/* <Tabs.Screen name="home" /> */}
      {/* <Tabs.Screen name="search" /> */}
      {/* <Tabs.Screen name="league" /> */}
      {/* <Tabs.Screen name="team" /> */}
    </Tabs>
  );
} 