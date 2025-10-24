import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
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
            style={[styles.chip, isSelected && styles.chipSelected]}
            onPress={() => onSelectCategory(category.key as PostCategory | 'all')}
          >
            {category.emoji && <Text style={styles.emoji}>{category.emoji}</Text>}
            <Text style={[styles.label, isSelected && styles.labelSelected]}>
              {category.label}
            </Text>
            {category.count !== undefined && (
              <View style={styles.countBadge}>
                <Text style={styles.countText}>{category.count}</Text>
              </View>
            )}
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.md,
    // marginBottom: spacing.md,
    gap: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.xs,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
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
    backgroundColor: colors.background,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: borderRadius.full,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
});
