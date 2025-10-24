import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { colors, typography } from '../constants/theme';
import { parseTextWithMentions } from '../utils/mentions';

interface MentionTextProps {
  text: string;
  style?: any;
  onMentionPress?: (username: string) => void;
}

export const MentionText: React.FC<MentionTextProps> = ({
  text,
  style,
  onMentionPress,
}) => {
  const segments = parseTextWithMentions(text);

  return (
    <Text style={style}>
      {segments.map((segment, index) => {
        if (segment.isMention) {
          return (
            <Text
              key={index}
              style={styles.mention}
              onPress={() => onMentionPress?.(segment.username!)}
            >
              {segment.text}
            </Text>
          );
        }
        return <Text key={index}>{segment.text}</Text>;
      })}
    </Text>
  );
};

const styles = StyleSheet.create({
  mention: {
    color: colors.primary,
    fontWeight: typography.weights.semibold,
  },
});
