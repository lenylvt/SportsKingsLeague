import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet, Platform } from 'react-native';
import { useRouter } from 'expo-router';

interface Team {
  id: number;
  name: string;
  shortName: string;
  completeName: string;
  logo: {
    url: string;
  };
  firstColorHEX: string;
  secondColorHEX: string;
}

interface TeamListProps {
  teams: Team[];
  competitionId: number;
}

export default function TeamList({ teams, competitionId }: TeamListProps) {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {teams.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Aucune équipe disponible pour le moment</Text>
        </View>
      ) : (
        teams.map((team) => (
          <TouchableOpacity
            key={team.id}
            style={styles.teamCard}
            onPress={() => router.push(`/team/${team.id}`)}
          >
            <View style={styles.logoContainer}>
              {team.logo?.url ? (
                <Image
                  source={{ uri: team.logo.url }}
                  style={styles.teamLogo}
                  resizeMode="contain"
                />
              ) : (
                <View style={[styles.placeholderLogo, { backgroundColor: team.firstColorHEX || '#FFC107' }]} />
              )}
            </View>
            <View style={styles.teamInfo}>
              <Text style={styles.teamName} numberOfLines={1}>
                {team.name}
              </Text>
              <Text style={styles.teamShortName} numberOfLines={1}>
                {team.shortName}
              </Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 16,
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
  },
  teamCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  logoContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: 12,
  },
  teamLogo: {
    width: '100%',
    height: '100%',
  },
  placeholderLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
  },
  teamShortName: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 14,
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
  },
}); 