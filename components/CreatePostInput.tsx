import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Camera, MapPin, EyeOff, Plane } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface CreatePostInputProps {
  onPress: () => void;
}

export const CreatePostInput: React.FC<CreatePostInputProps> = ({ onPress }) => {
  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.inputContainer} onPress={onPress}>
        <Text style={styles.placeholder}>Share something helpful with fellow travelers...</Text>
      </TouchableOpacity>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <Camera size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <MapPin size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={onPress}>
          <EyeOff size={20} color={colors.text.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.shareButton} onPress={onPress} activeOpacity={0.85}>
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.shareButtonGradient}
          >
            <Plane size={20} color={colors.text.primary} />
            <Text style={styles.shareText}>Share</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    width: '100%',
    maxWidth: 576,
    alignSelf: 'center',
  },
  inputContainer: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    minHeight: 64,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  placeholder: {
    fontSize: typography.sizes.md,
    color: colors.text.tertiary,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: 44,
    height: 44,
    backgroundColor: colors.input,
    borderRadius: borderRadius.base,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  actionIcon: {
    fontSize: typography.sizes.lg,
  },
  shareButton: {
    flex: 1,
    borderRadius: borderRadius.base,
    overflow: 'hidden',
  },
  shareButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.lg,
    minHeight: 44,
  },
  shareIcon: {
    fontSize: typography.sizes.md,
  },
  shareText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
});
