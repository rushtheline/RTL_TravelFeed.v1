import React from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
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
        <TouchableOpacity style={styles.shareButton} onPress={onPress}>
          <Plane size={20} color={colors.text.primary} />
          <Text style={styles.shareText}>Share</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    // backgroundColor: colors.card,
    // borderRadius: borderRadius.md,
    // padding: spacing.xs,
    marginBottom: spacing.md,
    // borderWidth: 1,
    // borderColor: colors.border,
  },
  inputContainer: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    minHeight: 60,
    justifyContent: 'center',
  },
  placeholder: {
    fontSize: typography.sizes.md,
    color: colors.text.muted,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIcon: {
    fontSize: typography.sizes.lg,
  },
  shareButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.xs,
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
