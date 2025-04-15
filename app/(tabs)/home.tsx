import { Stack } from 'expo-router';
import { View, Text, ScrollView, Platform, TouchableOpacity, Image } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState, useEffect } from 'react';
import useFavorites, { FavoriteLeague } from '../hooks/useFavorites';

type QuickAction = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  route: '/(tabs)/search' | '/(tabs)/league' | '/(tabs)/team';
};

// Définir l'interface pour les données de match
interface Team { // Interface pour une équipe
  name: string;
  logo: string;
}

interface Match {
  id: string;
  teamA: Team;
  teamB: Team;
  scoreA?: number; // Score optionnel (pour les matchs futurs)
  scoreB?: number; // Score optionnel
  status: string; // Ex: '3rd 8:39', 'Final', '2:00 PM'
  league: string;
}

export default function Home() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'Yesterday' | 'Today' | 'Upcoming'>('Today');
  const { favorites, isLoading: isLoadingFavorites } = useFavorites();
  const [displayedMatches, setDisplayedMatches] = useState<Match[]>([]);
  const [isLoadingMatches, setIsLoadingMatches] = useState(false);

  const quickActions: QuickAction[] = [
    { icon: 'search-outline', label: 'Recherche', route: '/(tabs)/search' },
    { icon: 'trophy-outline', label: 'Ligues', route: '/(tabs)/league' },
    { icon: 'star-outline', label: 'Équipes', route: '/(tabs)/team' },
  ];

  const tabs = ['Yesterday', 'Today', 'Upcoming'];

  const fetchMatches = async (tab: 'Yesterday' | 'Today' | 'Upcoming', favoriteLeagues: FavoriteLeague[]) => {
    setIsLoadingMatches(true);
    console.log(`Fetching matches for tab: ${tab}, Favorites:`, favoriteLeagues.map(f => f.id));
    await new Promise(resolve => setTimeout(resolve, 500));

    // Données exemples basées sur l'image (filtrées par onglet)
    let exampleData: Match[] = []; // Utiliser l'interface Match
    if (tab === 'Today') {
        exampleData = [
            { id: 'nba-1', teamA: { name: 'Warriors', logo: 'https://via.placeholder.com/40/0077c8/ffffff?text=GSW' }, teamB: { name: 'Lakers', logo: 'https://via.placeholder.com/40/552583/ffffff?text=LAL' }, scoreA: 57, scoreB: 62, status: '3rd 8:39', league: 'NBA' },
            { id: 'nwsl-1', teamA: { name: 'Angel City', logo: 'https://via.placeholder.com/40/ffc0cb/000000?text=AC' }, teamB: { name: 'Gotham FC', logo: 'https://via.placeholder.com/40/000000/ffffff?text=GFC' }, scoreA: 1, scoreB: 1, status: '63:21', league: 'NWSL'},
            { id: 'mls-1', teamA: { name: 'Miami', logo: 'https://via.placeholder.com/40/f5b9c8/000000?text=MIA' }, teamB: { name: 'LAFC', logo: 'https://via.placeholder.com/40/000000/ffffff?text=LAFC' }, scoreA: 1, scoreB: 0, status: '36:59', league: 'MLS' },
            { id: 'ncaamb-1', teamA: { name: 'UNC', logo: 'https://via.placeholder.com/40/7BAFD4/ffffff?text=UNC' }, teamB: { name: 'Duke', logo: 'https://via.placeholder.com/40/003087/ffffff?text=DUKE' }, scoreA: 38, scoreB: 41, status: '2nd 13:20', league: "Men's College Basketball" },
            { id: 'mlb-1', teamA: { name: 'Giants', logo: 'https://via.placeholder.com/40/FD5A1E/ffffff?text=SFG' }, teamB: { name: 'Dodgers', logo: 'https://via.placeholder.com/40/005A9C/ffffff?text=LAD' }, scoreA: 4, scoreB: 4, status: '▲ 8th', league: 'MLB' },
            { id: 'nhl-1', teamA: { name: 'Penguins', logo: 'https://via.placeholder.com/40/000000/ffb81c?text=PIT' }, teamB: { name: 'Maple Leafs', logo: 'https://via.placeholder.com/40/00205B/ffffff?text=TOR' }, scoreA: 3, scoreB: 2, status: 'Final', league: 'NHL' },
             { id: 'ncaawb-1', teamA: { name: 'Stanford', logo: 'https://via.placeholder.com/40/8C1515/ffffff?text=STAN' }, teamB: { name: 'Colorado', logo: 'https://via.placeholder.com/40/CFB87C/000000?text=COL' }, status: '2:00 PM', league: "Women's College Basketball" },
        ];
    } else if (tab === 'Upcoming') {
         exampleData = [
            { id: 'mls-2', teamA: { name: 'Orlando', logo: 'https://via.placeholder.com/40/633492/ffffff?text=ORL' }, teamB: { name: 'FC Dallas', logo: 'https://via.placeholder.com/40/E01F40/ffffff?text=DAL' }, status: '6:30 PM', league: 'MLS' },
         ];
    }

    // Filtrer par ligues favorites (si > 0 favorites)
    const filteredMatches: Match[] = favoriteLeagues.length > 0 // Utiliser l'interface Match
        ? exampleData.filter(match => favoriteLeagues.some(fav => fav.name === match.league || fav.splitName === match.league))
        : exampleData; // Afficher tout si aucun favori

    setDisplayedMatches(filteredMatches);
    setIsLoadingMatches(false);
  };

  useEffect(() => {
    if (!isLoadingFavorites) {
        fetchMatches(activeTab, favorites);
    }
  }, [activeTab, favorites, isLoadingFavorites]);

  const renderMatchCard = (match: Match) => { // Utiliser l'interface Match
    const isUpcoming = !match.scoreA && !match.scoreB && (match.status.includes('PM') || match.status.includes('AM') || match.status.includes(':'));
    const isLive = match.scoreA !== undefined && match.scoreB !== undefined && !match.status.toLowerCase().includes('final') && !isUpcoming;
    const isFinished = match.status.toLowerCase().includes('final');

    return (
      <TouchableOpacity
        key={match.id}
        style={{
          backgroundColor: isLive ? 'rgba(90, 90, 90, 0.3)' : 'rgba(50, 50, 50, 0.3)', // Fond différent si live
          borderRadius: 20, // Plus arrondi
          padding: 16,
          marginBottom: 12,
          borderWidth: isLive ? 1 : 0,
          borderColor: isLive ? 'rgba(255, 255, 255, 0.3)' : 'transparent'
        }}
        onPress={() => router.push(`/match/${match.id}`)} // Navigation vers la page match (si elle existe)
      >
        <Text style={{ color: 'white', fontSize: 12, opacity: 0.7, marginBottom: 10, fontWeight: '500' }}>{match.league.toUpperCase()}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          {/* Colonne Équipe A */}
          <View style={{ flex: 1, alignItems: 'center', marginRight: 8 }}>
            <Image source={{ uri: match.teamA.logo }} style={{ width: 48, height: 48, borderRadius: 24, marginBottom: 6 }} />
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', textAlign: 'center' }} numberOfLines={1}>{match.teamA.name}</Text>
            {/* Ajouter record si disponible */} 
          </View>

          {/* Colonne Score/Statut */}
          <View style={{ alignItems: 'center', marginHorizontal: 10 }}>
            {isUpcoming ? (
              <Text style={{ color: 'white', fontSize: 16, fontWeight: '600' }}>{match.status}</Text>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>{match.scoreA ?? '-'}</Text>
                <Text style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 28, fontWeight: 'bold', marginHorizontal: 8 }}>-</Text>
                <Text style={{ color: 'white', fontSize: 28, fontWeight: 'bold' }}>{match.scoreB ?? '-'}</Text>
              </View>
            )}
            <Text style={{ color: isLive ? '#FF4D4D' : 'rgba(255, 255, 255, 0.7)', fontSize: 12, fontWeight: isLive ? 'bold' : '500', marginTop: 4 }}>
                {isLive ? '● LIVE' : isUpcoming ? ' ' : match.status}
            </Text>
          </View>

          {/* Colonne Équipe B */}
          <View style={{ flex: 1, alignItems: 'center', marginLeft: 8 }}>
            <Image source={{ uri: match.teamB.logo }} style={{ width: 48, height: 48, borderRadius: 24, marginBottom: 6 }} />
            <Text style={{ color: 'white', fontSize: 14, fontWeight: '500', textAlign: 'center' }} numberOfLines={1}>{match.teamB.name}</Text>
            {/* Ajouter record si disponible */}
          </View>
        </View>
        {/* Ajouter infos supplémentaires si nécessaire (ex: diffusion) */}
      </TouchableOpacity>
    );
  }

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
            {/* <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 32 }}>
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
            </View> */}

            {/* Onglets Matchs */}
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: 20, marginTop: 16 }}>

              {/* Hier */}
              <TouchableOpacity
                onPress={() => setActiveTab('Yesterday')}
                style={{ paddingVertical: 6, paddingHorizontal: 8, marginHorizontal: 10 /* Marge réduite et égale */ }}
              >
                <Text style={{
                  color: activeTab === 'Yesterday' ? 'white' : 'rgba(235, 235, 245, 0.5)', // Opacité augmentée (alpha à 0.5)
                  fontSize: activeTab === 'Yesterday' ? 16 : 15, // Plus grand si actif
                  fontWeight: activeTab === 'Yesterday' ? '600' : '400',
                  fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif'
                }}>
                  Past
                </Text>
              </TouchableOpacity>

              {/* Aujourd'hui (centré avec marges) */}
              <TouchableOpacity
                onPress={() => setActiveTab('Today')}
                style={{ paddingVertical: 6, paddingHorizontal: 8, marginHorizontal: 10 /* Marge réduite et égale */ }}
              >
                <Text style={{
                  color: activeTab === 'Today' ? 'white' : 'rgba(235, 235, 245, 0.5)', // Opacité augmentée
                  fontSize: activeTab === 'Today' ? 16 : 15, // Plus grand si actif
                  fontWeight: activeTab === 'Today' ? '600' : '400',
                  fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif'
                }}>
                  Today
                </Text>
              </TouchableOpacity>

              {/* Prochainement */}
              <TouchableOpacity
                onPress={() => setActiveTab('Upcoming')} // Garder la clé 'Upcoming' pour la logique
                style={{ paddingVertical: 6, paddingHorizontal: 8, marginHorizontal: 10 /* Marge réduite et égale */ }}
              >
                <Text style={{
                  color: activeTab === 'Upcoming' ? 'white' : 'rgba(235, 235, 245, 0.5)', // Opacité augmentée
                  fontSize: activeTab === 'Upcoming' ? 16 : 15, // Plus grand si actif
                  fontWeight: activeTab === 'Upcoming' ? '600' : '400',
                  fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif'
                }}>
                  Next
                </Text>
              </TouchableOpacity>

            </View>

            {/* Liste des Matchs */}
            <View>
              {isLoadingMatches || isLoadingFavorites ? (
                <Text style={{ color: 'white', textAlign: 'center', marginTop: 20, opacity: 0.7 }}>Chargement...</Text>
              ) : displayedMatches.length > 0 ? (
                displayedMatches.map(renderMatchCard)
              ) : (
                <View style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  borderRadius: 12,
                  padding: 16,
                  alignItems: 'center'
                }}>
                  <Text style={{
                    color: 'white',
                    fontSize: 16,
                    opacity: 0.7,
                    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
                  }}>
                    Aucun match {activeTab === 'Yesterday' ? 'hier' : activeTab === 'Today' ? "aujourd'hui" : 'prochainement'} {favorites.length > 0 ? 'pour vos ligues favorites' : ''}.
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </View>
  );
} 