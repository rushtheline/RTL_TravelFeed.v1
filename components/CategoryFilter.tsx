import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { PostCategory } from '../types/database.types';

export type FeedCategory = PostCategory | 'all' | 'my_terminal';

interface CategoryFilterProps {
  selectedCategory: FeedCategory;
  onSelectCategory: (category: FeedCategory) => void;
  categoryCounts?: {
    all?: number;
    my_terminal?: number;
    tsa_update?: number;
    food?: number;
    parking?: number;
    helpful_tip?: number;
    gate_change?: number;
    wait_time?: number;
    general?: number;
  };
}

const getCategoryConfig = (counts?: CategoryFilterProps['categoryCounts']) => [
  { key: 'all' as const, label: 'All', emoji: '' },
  { key: 'my_terminal' as const, label: 'My Terminal', emoji: '', count: counts?.my_terminal },
  { key: 'tsa_update' as const, label: 'TSA', emoji: '', count: counts?.tsa_update },
  { key: 'food' as const, label: 'Food', emoji: '🍔', count: counts?.food },
  { key: 'parking' as const, label: 'Parking', emoji: '🅿️', count: counts?.parking },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  categoryCounts,
}) => {
  const categories = getCategoryConfig(categoryCounts);
  
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((category) => {
        const isSelected = selectedCategory === category.key;
        return (
          <TouchableOpacity
            key={category.key}
            style={styles.chip}
            onPress={() => onSelectCategory(category.key as PostCategory | 'all')}
            activeOpacity={0.9}
          >
            <LinearGradient
              colors={
                isSelected
                  ? colors.gradient
                  : ([colors.input, colors.input] as const)
              }
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.chipContent,
                !isSelected && styles.chipContentInactive,
                isSelected && styles.chipContentActive,
              ]}
            >
              {category.emoji && <Text style={styles.emoji}>{category.emoji}</Text>}
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {category.label}
              </Text>
              {category.count !== undefined && (
                <View style={[styles.countBadge, isSelected && styles.countBadgeActive]}>
                  <Text style={[styles.countText, isSelected && styles.countTextActive]}>
                    {category.count}
                  </Text>
                </View>
              )}
            </LinearGradient>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
    backgroundColor: colors.card,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
    width: '100%',
    maxWidth: 576,
    alignSelf: 'center',
  },
  chip: {
    borderRadius: borderRadius.base,
    overflow: 'hidden',
    minHeight: 40,
    minWidth: 96,
    marginRight: spacing.sm,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.input,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.xs,
  },
  chipContentInactive: {
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipContentActive: {
    borderWidth: 0,
  },
  emoji: {
    fontSize: typography.sizes.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  labelSelected: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  countBadge: {
    backgroundColor: colors.overlay,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.secondary,
  },
  countBadgeActive: {
    backgroundColor: 'rgba(0,0,0,0.15)',
  },
  countTextActive: {
    color: colors.text.primary,
  },
});
