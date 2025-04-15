import React from 'react';
import { View, Text, Image, StyleSheet, Platform } from 'react-native';

interface Standing {
  id: number;
  team: {
    id: number;
    name: string;
    shortName: string;
    logo: {
      url: string;
    };
  };
  rank: number;
  points: number;
  gameTotal: number;
  gameWon: number;
  gameDraw: number;
  gameLost: number;
  goalPro: number;
  goalAgainst: number;
  positionLegend: {
    color: string;
    placement: string;
  } | null;
}

interface StandingsTableProps {
  standings: Standing[];
}

export default function StandingsTable({ standings }: StandingsTableProps) {
  const getPositionColor = (legend: Standing['positionLegend']) => {
    if (!legend) return 'transparent';
    switch (legend.color) {
      case 'green':
        return '#4CAF50';
      case 'yellow':
        return '#FFC107';
      case 'softOrange':
        return '#FF9800';
      default:
        return 'transparent';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.headerCell, styles.rankCell]}>Pos</Text>
        <Text style={[styles.headerCell, styles.teamCell]}>Équipe</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>Pts</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>J</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>G</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>N</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>P</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>BP</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>BC</Text>
        <Text style={[styles.headerCell, styles.statsCell]}>Diff</Text>
      </View>

      {standings.map((standing) => (
        <View 
          key={standing.id} 
          style={[
            styles.row,
            { borderLeftColor: getPositionColor(standing.positionLegend) }
          ]}
        >
          <Text style={[styles.cell, styles.rankCell]}>{standing.rank}</Text>
          <View style={[styles.cell, styles.teamCell, styles.teamInfo]}>
            <Image
              source={{ uri: standing.team.logo.url }}
              style={styles.teamLogo}
              resizeMode="contain"
            />
            <Text style={styles.teamName} numberOfLines={1}>
              {standing.team.name}
            </Text>
          </View>
          <Text style={[styles.cell, styles.statsCell]}>{standing.points}</Text>
          <Text style={[styles.cell, styles.statsCell]}>{standing.gameTotal}</Text>
          <Text style={[styles.cell, styles.statsCell]}>{standing.gameWon}</Text>
          <Text style={[styles.cell, styles.statsCell]}>{standing.gameDraw}</Text>
          <Text style={[styles.cell, styles.statsCell]}>{standing.gameLost}</Text>
          <Text style={[styles.cell, styles.statsCell]}>{standing.goalPro}</Text>
          <Text style={[styles.cell, styles.statsCell]}>{standing.goalAgainst}</Text>
          <Text style={[styles.cell, styles.statsCell]}>
            {standing.goalPro - standing.goalAgainst}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  headerCell: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderLeftWidth: 3,
  },
  cell: {
    color: 'white',
    fontSize: 13,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
  },
  rankCell: {
    width: 30,
  },
  teamCell: {
    flex: 1,
    paddingHorizontal: 8,
  },
  teamInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  teamLogo: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  teamName: {
    color: 'white',
    fontSize: 13,
    flex: 1,
    textAlign: 'left',
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
  },
  statsCell: {
    width: 35,
  },
}); 