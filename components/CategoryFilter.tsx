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
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        style={styles.scrollView}
      >
        {categories.map((category) => {
          const isSelected = selectedCategory === category.key;
          const isAll = category.key === 'all';
          const showCount = !isAll && category.count !== undefined;

          const ChipWrapper: React.ComponentType<any> | null =
            isSelected && isAll ? LinearGradient : View;

          const wrapperProps =
            isSelected && isAll
              ? {
                  colors: colors.gradient,
                  start: { x: 0, y: 0 },
                  end: { x: 1, y: 1 },
                }
              : {};

          return (
            <TouchableOpacity
              key={category.key}
              style={[
                styles.chipBase,
                isAll ? styles.chipAllBase : styles.chipDefaultBase,
                isSelected
                  ? isAll
                    ? styles.chipAllActive
                    : styles.chipDefaultActive
                  : styles.chipDefaultInactive,
              ]}
              activeOpacity={0.85}
              onPress={() => onSelectCategory(category.key as PostCategory | 'all')}
            >
              <ChipWrapper
                style={[
                  styles.chipContentWrapper,
                  isAll ? styles.chipContentAll : styles.chipContentDefault,
                  isSelected && isAll && styles.chipContentAllActive,
                ]}
                {...wrapperProps}
              >
                <View style={styles.chipContent}>
                  {category.emoji && (
                    <Text style={[styles.label, styles.emoji]}>{category.emoji}</Text>
                  )}
                  <Text
                    style={[
                      styles.label,
                      isSelected ? styles.labelSelected : styles.labelUnselected,
                    ]}
                  >
                    {category.label}
                    {showCount && (
                      <Text style={styles.countText}> ({category.count})</Text>
                    )}
                  </Text>
                </View>
              </ChipWrapper>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    width: '100%',
    maxWidth: 576,
    alignSelf: 'center',
  },
  scrollView: {
    flexGrow: 0,
  },
  scrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  chipBase: {
    borderRadius: 20,
    overflow: 'hidden',
    marginRight: spacing.md,
    borderWidth: 1,
  },
  chipAllBase: {
    borderRadius: 12,
    borderWidth: 0,
  },
  chipDefaultBase: {
    borderRadius: 20,
  },
  chipContentWrapper: {
    borderRadius: 20,
  },
  chipContentAll: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(38,39,46,0.9)',
  },
  chipContentAllActive: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  chipContentDefault: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipDefaultInactive: {
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  chipDefaultActive: {
    borderColor: colors.focusRing,
    backgroundColor: 'rgba(166,20,112,0.2)',
  },
  chipAllActive: {
    borderWidth: 0,
  },
  chipContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  emoji: {
    marginRight: spacing.xs,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    letterSpacing: 0.2,
  },
  labelSelected: {
    color: colors.text.primary,
  },
  labelUnselected: {
    color: 'rgba(255,255,255,0.9)',
  },
  countText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: 'rgba(255,255,255,0.75)',
  },
});
