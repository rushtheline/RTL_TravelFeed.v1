import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, spacing, typography, borderRadius } from "../constants/theme";
import { Profile } from "../types/database.types";
import { AirportSelector } from "./AirportSelector";
import { Brain, TicketsPlane } from "lucide-react-native";

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
      case "road_warrior":
        return "✈️";
      case "frequent_flyer":
        return "🔥";
      case "elite_traveler":
        return "⭐";
      default:
        return "";
    }
  };

  const getBadgeLabel = (badge: string | null) => {
    switch (badge) {
      case "road_warrior":
        return "Road Warrior";
      case "frequent_flyer":
        return "Frequent Flyer";
      case "elite_traveler":
        return "Elite Traveler";
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
                <Text style={styles.badgeEmoji}>
                  {getBadgeEmoji(profile.badge)}
                </Text>
                <Text style={styles.badgeText}>{badgeLabel}</Text>
              </View>
            )}
          </View>
          <TouchableOpacity style={styles.flightButton} onPress={onFlightInfo}>
            <TicketsPlane size={22} color={colors.text.secondary} />
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
            disabled={!profile.flight_number}
            departureAirport={profile.departure_airport}
            arrivalAirport={profile.arrival_airport}
          />
        </View>

        <TouchableOpacity style={styles.aiButton} onPress={onAISummary}>
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.aiButtonGradient}
          >
            <Brain size={18} color={colors.text.primary} />
            <Text style={styles.aiButtonText}>AI Summary</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
    width: "100%",
    maxWidth: 672,
    alignSelf: "center",
  },
  welcomeSection: {
    marginBottom: spacing.md,
  },
  welcomeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
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
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    backgroundColor: colors.input,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  badgeContainer: {
    flexDirection: "row",
    alignItems: "center",
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
    color: colors.text.tertiary,
    marginTop: spacing.sm,
    marginBottom: spacing.lg,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  airportSelectorContainer: {
    flex: 1,
  },
  aiButton: {
    borderRadius: borderRadius.base,
    overflow: "hidden",
    height: 50,
  },
  aiButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    paddingHorizontal: spacing.lg,
    height: 50,
  },
  aiButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
});
