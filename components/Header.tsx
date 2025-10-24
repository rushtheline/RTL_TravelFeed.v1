import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { Profile } from '../types/database.types';
import { AirportSelector } from './AirportSelector';
import { Brain, TicketsPlane } from 'lucide-react-native';

interface HeaderProps {
  profile: Profile;
  currentAirport: string;
  currentAirportId: string;
  currentTerminal: string;
  onChangeAirport: (airport: any) => void;
  onAISummary: () => void;
  onFlightInfo: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  profile,
  currentAirport,
  currentAirportId,
  currentTerminal,
  onChangeAirport,
  onAISummary,
  onFlightInfo,
}) => {
  const getBadgeEmoji = (badge: string | null) => {
    switch (badge) {
      case 'road_warrior':
        return '✈️';
      case 'frequent_flyer':
        return '🔥';
      case 'elite_traveler':
        return '⭐';
      default:
        return '';
    }
  };

  const getBadgeLabel = (badge: string | null) => {
    switch (badge) {
      case 'road_warrior':
        return 'Road Warrior';
      case 'frequent_flyer':
        return 'Frequent Flyer';
      case 'elite_traveler':
        return 'Elite Traveler';
      default:
        return null;
    }
  };

  const badgeLabel = getBadgeLabel(profile.badge);

  return (
    <View style={styles.container}>
      <View style={styles.welcomeSection}>
        <View style={styles.welcomeRow}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeText}>
              👋 Welcome back, {profile.display_name || profile.username}
            </Text>
            {badgeLabel && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeEmoji}>{getBadgeEmoji(profile.badge)}</Text>
                <Text style={styles.badgeText}>{badgeLabel}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.flightButton} onPress={onFlightInfo}>
            <TicketsPlane size={24} color={colors.text.secondary} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.locationText}>
        You're currently at {currentAirport} — {currentTerminal}
      </Text>

      <View style={styles.buttonRow}>
        <View style={styles.airportSelectorContainer}>
          <AirportSelector
            selectedAirportId={currentAirportId}
            onSelectAirport={onChangeAirport}
          />
        </View>

        <TouchableOpacity style={styles.aiButton} onPress={onAISummary}>
          <Brain size={18} color={colors.text.primary} />
          <Text style={styles.aiButtonText}>AI Summary</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingTop: spacing.lg,
    paddingBottom: spacing.xs,
  },
  welcomeSection: {
    marginBottom: spacing.sm,
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  welcomeContent: {
    flex: 1,
    marginTop: spacing.sm,
  },
  welcomeText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  flightButton: {
    padding: spacing.sm,
    marginLeft: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  badgeEmoji: {
    fontSize: typography.sizes.md,
  },
  badgeText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  locationText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    marginTop: spacing.mdm,
    marginBottom: spacing.md,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  airportSelectorContainer: {
    flex: 1,
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  aiButtonIcon: {
    fontSize: typography.sizes.md,
  },
  aiButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
});
