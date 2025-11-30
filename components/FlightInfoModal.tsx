import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  Plane,
  X,
  AlertCircle,
  MapPin,
  Clock,
  Building2,
  DoorOpen,
  Package,
} from "lucide-react-native";
import { colors, spacing, typography, borderRadius } from "../constants/theme";
import { fetchFlightInfo, FlightData } from "../lib/airlabs";

interface FlightInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (flightNumber: string, flightData: FlightData | null) => void;
  profile?: any; // User profile with flight data
}

export const FlightInfoModal: React.FC<FlightInfoModalProps> = ({
  visible,
  onClose,
  onSubmit,
  profile,
}) => {
  const [activeTab, setActiveTab] = useState<"flight" | "confirmation">(
    "flight"
  );
  const [flightNumber, setFlightNumber] = useState("");
  const [confirmationCode, setConfirmationCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (activeTab === "flight") {
      if (!flightNumber.trim()) {
        Alert.alert("Error", "Please enter your flight number");
        return;
      }

      setLoading(true);
      try {
        // Fetch flight data from AirLabs API
        const flightData = await fetchFlightInfo(flightNumber.trim());

        if (!flightData) {
          Alert.alert(
            "Flight Not Found",
            "We could not find your flight. Please check the flight number and try again, or skip for now.",
            [
              { text: "Try Again", style: "cancel" },
              {
                text: "Skip",
                onPress: () => {
                  setLoading(false);
                  onClose();
                },
              },
            ]
          );
          setLoading(false);
          return;
        }

        // Pass flight data to parent
        onSubmit(flightNumber.trim().toUpperCase(), flightData);
      } catch (error) {
        console.error("Error fetching flight:", error);
        Alert.alert(
          "Error",
          "Unable to fetch flight information. Please check your internet connection and try again.",
          [
            { text: "Try Again", style: "cancel" },
            {
              text: "Skip",
              onPress: () => {
                setLoading(false);
                onClose();
              },
            },
          ]
        );
      } finally {
        setLoading(false);
      }
    } else {
      if (!confirmationCode.trim()) {
        Alert.alert("Error", "Please enter your confirmation code");
        return;
      }
      // For confirmation code, we don't have API support yet
      onSubmit(confirmationCode.trim().toUpperCase(), null);
    }
  };

  const handleSkip = () => {
    onClose();
  };

  const handleClearFlight = () => {
    Alert.alert(
      "Change Flight",
      "Are you sure you want to clear your current flight information? You'll be able to enter a new flight number.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            // Reset the input field
            setFlightNumber("");
            // Clear flight data by submitting empty data (but don't close modal)
            onSubmit("", null);
          },
        },
      ]
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={["#1F2029", "#2A2B35"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.modalContainer}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Plane size={24} color={colors.text.primary} />
            </View>
            <Text style={styles.title}>Flight Information</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <X size={24} color={colors.text.secondary} />
            </TouchableOpacity>
          </View>

          <Text style={styles.subtitle}>
            {profile?.flight_number
              ? "Your saved flight information"
              : "Enter your flight details to unlock terminal-specific features and real-time updates."}
          </Text>

          {/* Flight Information Display - Show if user has flight data */}
          {profile?.flight_number &&
            profile?.departure_airport &&
            profile?.arrival_airport && (
              <View style={styles.flightInfoContainer}>
                <View style={styles.flightHeader}>
                  <Text style={styles.flightNumber}>
                    {profile.flight_number}
                  </Text>
                  {profile.airline_name && (
                    <Text style={styles.airlineName}>
                      {profile.airline_name}
                    </Text>
                  )}
                </View>

                <View style={styles.routeContainer}>
                  {/* Departure */}
                  <View style={styles.airportInfo}>
                    <Text style={styles.airportCode}>
                      {profile.departure_airport}
                    </Text>
                    {profile.departure_time && (
                      <View style={styles.timeRow}>
                        <Clock size={14} color={colors.text.secondary} />
                        <View>
                          <Text style={styles.timeText}>
                            {new Date(
                              profile.departure_time
                            ).toLocaleTimeString("en-US", {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </Text>
                          <Text style={styles.dateText}>
                            {new Date(
                              profile.departure_time
                            ).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </Text>
                        </View>
                      </View>
                    )}
                    {profile.dep_terminal && profile.dep_gate && (
                      <View style={styles.gateRow}>
                        <DoorOpen size={14} color={colors.text.secondary} />
                        <Text style={styles.gateText}>
                          Terminal {profile.dep_terminal} · Gate{" "}
                          {profile.dep_gate}
                        </Text>
                      </View>
                    )}
                  </View>

                  {/* Arrow */}
                  <View style={styles.arrowContainer}>
                    <Plane size={20} color={colors.primary} />
                    <View style={styles.arrowLine} />
                    {profile.flight_duration && (
                      <Text style={styles.durationText}>
                        {Math.floor(profile.flight_duration / 60)}h{" "}
                        {profile.flight_duration % 60}m
                      </Text>
                    )}
                  </View>

                  {/* Arrival */}
                  <View style={styles.airportInfo}>
                    <Text style={styles.airportCode}>
                      {profile.arrival_airport}
                    </Text>
                    {profile.arrival_time && (
                      <View style={styles.timeRow}>
                        <Clock size={14} color={colors.text.secondary} />
                        <View>
                          <Text style={styles.timeText}>
                            {new Date(profile.arrival_time).toLocaleTimeString(
                              "en-US",
                              {
                                hour: "numeric",
                                minute: "2-digit",
                              }
                            )}
                          </Text>
                          <Text style={styles.dateText}>
                            {new Date(profile.arrival_time).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                              }
                            )}
                          </Text>
                        </View>
                      </View>
                    )}
                    {profile.arr_gate && (
                      <View style={styles.gateRow}>
                        <DoorOpen size={14} color={colors.text.secondary} />
                        <Text style={styles.gateText}>
                          Gate {profile.arr_gate}
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Additional Flight Details */}
                <View style={styles.flightDetails}>
                  {profile.flight_status && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Status:</Text>
                      <Text
                        style={[
                          styles.detailValue,
                          profile.flight_status === "landed" &&
                            styles.statusLanded,
                          profile.flight_status === "delayed" &&
                            styles.statusDelayed,
                        ]}
                      >
                        {profile.flight_status.charAt(0).toUpperCase() +
                          profile.flight_status.slice(1)}
                      </Text>
                    </View>
                  )}
                  {profile.codeshare_flight && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Also operated as:</Text>
                      <Text style={styles.detailValue}>
                        {profile.codeshare_flight}
                      </Text>
                    </View>
                  )}
                  {(profile.dep_delayed || profile.arr_delayed) && (
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Delay:</Text>
                      <Text style={[styles.detailValue, styles.statusDelayed]}>
                        {profile.dep_delayed
                          ? `Dep: ${profile.dep_delayed}min`
                          : ""}
                        {profile.dep_delayed && profile.arr_delayed
                          ? " · "
                          : ""}
                        {profile.arr_delayed
                          ? `Arr: ${profile.arr_delayed}min`
                          : ""}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Change Flight Button */}
                <TouchableOpacity
                  style={styles.changeFlightButton}
                  onPress={handleClearFlight}
                >
                  <Text style={styles.changeFlightButtonText}>
                    Change Flight Number
                  </Text>
                </TouchableOpacity>
              </View>
            )}

          {/* Only show tabs and input if no flight data exists */}
          {!profile?.flight_number && (
            <>
              {/* Tabs */}
              <View style={styles.tabContainer}>
                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "flight"
                      ? styles.tabActive
                      : styles.tabInactive,
                  ]}
                  onPress={() => setActiveTab("flight")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "flight" && styles.tabTextActive,
                    ]}
                  >
                    Flight Number
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.tab,
                    activeTab === "confirmation"
                      ? styles.tabActive
                      : styles.tabInactive,
                  ]}
                  onPress={() => setActiveTab("confirmation")}
                >
                  <Text
                    style={[
                      styles.tabText,
                      activeTab === "confirmation" && styles.tabTextActive,
                    ]}
                  >
                    Confirmation
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Content */}
              {activeTab === "flight" && (
                <View style={styles.content}>
                  <Text style={styles.label}>Flight Number</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., DL1234"
                    placeholderTextColor={colors.text.muted}
                    value={flightNumber}
                    onChangeText={setFlightNumber}
                    autoCapitalize="characters"
                    autoCorrect={false}
                  />
                  <Text style={styles.hint}>
                    Enter your airline code and flight number (e.g., DL1234,
                    AA567)
                  </Text>
                </View>
              )}

              {activeTab === "confirmation" && (
                <View style={styles.content}>
                  <Text style={styles.label}>Confirmation Code</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., ABC123"
                    placeholderTextColor={colors.text.muted}
                    value={confirmationCode}
                    onChangeText={setConfirmationCode}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    maxLength={6}
                  />
                  <Text style={styles.hint}>
                    Your booking confirmation code (usually 6 characters)
                  </Text>
                </View>
              )}
            </>
          )}

          {/* Only show Continue button and warning if no flight data */}
          {!profile?.flight_number && (
            <>
              {/* Continue Button */}
              <TouchableOpacity
                onPress={handleContinue}
                activeOpacity={0.9}
                disabled={loading}
              >
                <LinearGradient
                  colors={colors.gradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={[
                    styles.continueButton,
                    loading && styles.continueButtonDisabled,
                  ]}
                >
                  <View style={styles.continueButtonInner}>
                    {loading ? (
                      <ActivityIndicator
                        size="small"
                        color={colors.text.primary}
                      />
                    ) : (
                      <Text style={styles.continueButtonText}>Continue</Text>
                    )}
                  </View>
                </LinearGradient>
              </TouchableOpacity>

              {/* Warning */}
              <View style={styles.warningContainer}>
                <AlertCircle size={20} color={colors.primary} />
                <Text style={styles.warningText}>
                  <Text style={styles.warningBold}>
                    Airport selection requires flight details.
                  </Text>{" "}
                  Enter your flight number to unlock airport switching and
                  access terminal-specific updates.
                </Text>
              </View>

              {/* Skip Button */}
              <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
                <Text style={styles.skipButtonText}>Skip for now</Text>
              </TouchableOpacity>
            </>
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: spacing.lg,
  },
  modalContainer: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: "100%",
    maxWidth: 500,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 14,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginRight: spacing.md,
  },
  title: {
    flex: 1,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  closeButton: {
    padding: spacing.xs,
  },
  subtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  flightInfoContainer: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  flightHeader: {
    marginBottom: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },
  flightNumber: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  airlineName: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  routeContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  airportInfo: {
    flex: 1,
    alignItems: "center",
  },
  airportCode: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.xs,
  },
  timeText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  dateText: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
    marginTop: 2,
  },
  arrowContainer: {
    alignItems: "center",
    paddingHorizontal: spacing.md,
  },
  arrowLine: {
    width: 40,
    height: 2,
    backgroundColor: colors.primary,
    marginTop: spacing.xs,
  },
  durationText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  gateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  gateText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
  flightDetails: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.borderSecondary,
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  detailLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  detailValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
    fontWeight: typography.weights.medium,
  },
  statusLanded: {
    color: "#4ade80", // green
  },
  statusDelayed: {
    color: "#f87171", // red
  },
  changeFlightButton: {
    marginTop: spacing.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.base,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    backgroundColor: "rgba(255,255,255,0.05)",
    alignItems: "center",
  },
  changeFlightButtonText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  tabContainer: {
    flexDirection: "row",
    gap: spacing.sm,
    marginBottom: spacing.xl,
  },
  tab: {
    flex: 1,
    borderRadius: borderRadius.base,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
  },
  tabInactive: {
    backgroundColor: "rgba(255,255,255,0.05)",
    borderColor: "rgba(255,255,255,0.15)",
  },
  tabActive: {
    backgroundColor: colors.input,
    borderColor: colors.focusRing,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: "rgba(255,255,255,0.75)",
  },
  tabTextActive: {
    color: colors.text.primary,
  },
  content: {
    marginBottom: spacing.xl,
  },
  label: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  input: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.base,
    padding: spacing.md,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    textAlign: "center",
    minHeight: 52,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginTop: spacing.sm,
    textAlign: "center",
  },
  continueButton: {
    borderRadius: borderRadius.base,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  continueButtonDisabled: {
    opacity: 0.6,
  },
  continueButtonInner: {
    paddingVertical: spacing.md,
    alignItems: "center",
  },
  continueButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: `${colors.primary}15`,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.lg,
    gap: spacing.sm,
  },
  warningText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  warningBold: {
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  skipButton: {
    padding: spacing.md,
    alignItems: "center",
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },
});
