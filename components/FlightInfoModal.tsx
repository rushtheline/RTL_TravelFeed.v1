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
        <LinearGradient
          colors={['#1F2029', '#2A2B35']}
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
            Enter your flight details to unlock terminal-specific features and real-time updates.
          </Text>

          {/* Tabs */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'flight' ? styles.tabActive : styles.tabInactive,
              ]}
              onPress={() => setActiveTab('flight')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'flight' && styles.tabTextActive,
                ]}
              >
                Flight Number
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'confirmation'
                  ? styles.tabActive
                  : styles.tabInactive,
              ]}
              onPress={() => setActiveTab('confirmation')}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === 'confirmation' && styles.tabTextActive,
                ]}
              >
                Confirmation
              </Text>
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
          <TouchableOpacity onPress={handleContinue} activeOpacity={0.9}>
            <LinearGradient
              colors={colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.continueButton}
            >
              <View style={styles.continueButtonInner}>
                <Text style={styles.continueButtonText}>Continue</Text>
              </View>
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
        </LinearGradient>
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
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: '100%',
    maxWidth: 500,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.3,
    shadowRadius: 32,
    elevation: 14,
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
  },
  tab: {
    flex: 1,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
  },
  tabInactive: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderColor: 'rgba(255,255,255,0.15)',
  },
  tabActive: {
    backgroundColor: colors.input,
    borderColor: colors.focusRing,
  },
  tabText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: 'rgba(255,255,255,0.75)',
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
    textAlign: 'center',
    minHeight: 52,
  },
  hint: {
    fontSize: typography.sizes.sm,
    color: colors.text.muted,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  continueButton: {
    borderRadius: borderRadius.base,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  continueButtonInner: {
    paddingVertical: spacing.md,
    alignItems: 'center',
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
