import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { AlertTriangle, Info, AlertCircle, Clock } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';

interface Alert {
  id: string;
  type: 'warning' | 'info' | 'alert' | 'time';
  title: string;
  message: string;
  icon: 'warning' | 'info' | 'alert' | 'clock';
}

interface AlertBannerProps {
  alerts?: Alert[];
  autoRotate?: boolean;
  rotationInterval?: number;
}

const defaultAlerts: Alert[] = [
  {
    id: '1',
    type: 'warning',
    title: 'TSA Security Alert',
    message: 'Terminal B checkpoint experiencing 15-20 min wait times',
    icon: 'warning',
  },
  {
    id: '2',
    type: 'info',
    title: 'Gate Change',
    message: 'Flight AA123 moved from B12 to B15',
    icon: 'info',
  },
  {
    id: '3',
    type: 'alert',
    title: 'Parking Update',
    message: 'Economy lot is 90% full - consider alternative parking',
    icon: 'alert',
  },
];

export const AlertBanner: React.FC<AlertBannerProps> = ({
  alerts = defaultAlerts,
  autoRotate = true,
  rotationInterval = 5000,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const fadeAnim = new Animated.Value(1);

  useEffect(() => {
    if (!autoRotate || alerts.length <= 1) return;

    const interval = setInterval(() => {
      // Fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Change alert
        setCurrentIndex((prev) => (prev + 1) % alerts.length);
        
        // Fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, rotationInterval);

    return () => clearInterval(interval);
  }, [autoRotate, alerts.length, rotationInterval]);

  if (alerts.length === 0) return null;

  const currentAlert = alerts[currentIndex];

  const getIcon = () => {
    const iconProps = { size: 32, color: colors.warning };
    
    switch (currentAlert.icon) {
      case 'warning':
        return <AlertTriangle {...iconProps} />;
      case 'info':
        return <Info {...iconProps} />;
      case 'alert':
        return <AlertCircle {...iconProps} />;
      case 'clock':
        return <Clock {...iconProps} />;
      default:
        return <AlertTriangle {...iconProps} />;
    }
  };

  const getBackgroundColor = () => {
    switch (currentAlert.type) {
      case 'warning':
        return 'rgba(255, 152, 0, 0.15)';
      case 'info':
        return 'rgba(33, 150, 243, 0.15)';
      case 'alert':
        return 'rgba(244, 67, 54, 0.15)';
      default:
        return 'rgba(255, 152, 0, 0.15)';
    }
  };

  const getBorderColor = () => {
    switch (currentAlert.type) {
      case 'warning':
        return colors.warning;
      case 'info':
        return colors.info;
      case 'alert':
        return colors.error;
      default:
        return colors.warning;
    }
  };

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.banner,
          {
            backgroundColor: getBackgroundColor(),
            borderColor: getBorderColor(),
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.iconContainer}>
          {getIcon()}
        </View>
        
        <View style={styles.content}>
          <Text style={styles.title}>{currentAlert.title}</Text>
          <Text style={styles.message}>{currentAlert.message}</Text>
        </View>
      </Animated.View>

      {alerts.length > 1 && (
        <View style={styles.indicators}>
          {alerts.map((_, index) => (
            <View
              key={index}
              style={[
                styles.indicator,
                index === currentIndex && styles.indicatorActive,
              ]}
            />
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: spacing.xs,
    marginVertical: spacing.md,
  },
  banner: {
    flexDirection: 'row',
    padding: spacing.lg,
    borderRadius: borderRadius.lg,
    borderWidth: 2,
    alignItems: 'center',
    minHeight: 120,
  },
  iconContainer: {
    marginRight: spacing.md,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  message: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
    lineHeight: 20,
  },
  indicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.sm,
    gap: spacing.xs,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.border,
  },
  indicatorActive: {
    backgroundColor: colors.text.secondary,
    width: 24,
  },
});
