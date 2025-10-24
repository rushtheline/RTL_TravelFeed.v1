import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Plane, X, AlertCircle } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface FlightInfoModalProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (flightNumber: string) => void;
}

export const FlightInfoModal: React.FC<FlightInfoModalProps> = ({
  visible,
  onClose,
  onSubmit,
}) => {
  const [activeTab, setActiveTab] = useState<'flight' | 'confirmation'>('flight');
  const [flightNumber, setFlightNumber] = useState('');
  const [confirmationCode, setConfirmationCode] = useState('');

  const handleContinue = () => {
    if (activeTab === 'flight') {
      if (!flightNumber.trim()) {
        Alert.alert('Error', 'Please enter your flight number');
        return;
      }
      onSubmit(flightNumber.trim().toUpperCase());
    } else {
      if (!confirmationCode.trim()) {
        Alert.alert('Error', 'Please enter your confirmation code');
        return;
      }
      onSubmit(confirmationCode.trim().toUpperCase());
    }
  };

  const handleSkip = () => {
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
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
            Enter your flight details to unlock terminal-specific features and real-time updates.
          </Text>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'flight' && styles.tabActive]}
              onPress={() => setActiveTab('flight')}
            >
              <LinearGradient
                colors={activeTab === 'flight' ? [colors.primary, colors.secondary] : ['transparent', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabGradient}
              >
                <Text style={[styles.tabText, activeTab === 'flight' && styles.tabTextActive]}>
                  Flight Number
                </Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tab, activeTab === 'confirmation' && styles.tabActive]}
              onPress={() => setActiveTab('confirmation')}
            >
              <LinearGradient
                colors={activeTab === 'confirmation' ? [colors.primary, colors.secondary] : ['transparent', 'transparent']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.tabGradient}
              >
                <Text style={[styles.tabText, activeTab === 'confirmation' && styles.tabTextActive]}>
                  Confirmation
                </Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>

          {/* Content */}
          {activeTab === 'flight' && (
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
                Enter your airline code and flight number (e.g., DL1234, AA567)
              </Text>
            </View>
          )}

          {activeTab === 'confirmation' && (
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

          {/* Continue Button */}
          <TouchableOpacity onPress={handleContinue}>
            <LinearGradient
              colors={[colors.primary, colors.secondary]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <Text style={styles.continueButtonText}>Continue</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* Warning */}
          <View style={styles.warningContainer}>
            <AlertCircle size={20} color={colors.primary} />
            <Text style={styles.warningText}>
              <Text style={styles.warningBold}>Airport switching will be locked</Text> once you enter your flight details. This ensures accurate terminal-specific updates.
            </Text>
          </View>

          {/* Skip Button */}
          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Skip for now</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  modalContainer: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing.md,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
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
  tabContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.lg,
    padding: spacing.xs,
  },
  tab: {
    flex: 1,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    // borderWidth: 1,
    // borderColor: colors.border,
  },
  tabActive: {
    borderColor: 'transparent',
  },
  tabGradient: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
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
    backgroundColor: colors.surface,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  continueButton: {
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  continueButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  warningContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
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
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },
});
