import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, StyleSheet, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Home, User, LogOut } from 'lucide-react-native';
import { colors, typography, borderRadius } from '../constants/theme';
import { FeedScreen } from '../screens/FeedScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { useAuth } from '../contexts/AuthContext';
import { SignOutModal } from '../components/SignOutModal';

const Tab = createBottomTabNavigator();

export const MainTabs: React.FC = () => {
  const { signOut } = useAuth();
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setShowSignOutModal(false);
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <>
      <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingBottom: 18,
          paddingTop: 8,
          height: 90,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: {
          fontSize: typography.sizes.xs,
          fontWeight: typography.weights.semibold,
          marginTop: 2,
        },
      }}
    >
      <Tab.Screen
        name="Feed"
        component={FeedScreen}
        options={{
          tabBarLabel: ({ focused }) =>
            focused ? null : <Text style={styles.inactiveLabel}>Feed</Text>,
          tabBarIcon: ({ color, focused }) => {
            if (focused) {
              return (
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.tabButton, styles.tabButtonActive]}
                >
                  <Home size={20} color="#FFFFFF" />
                  <Text style={[styles.tabLabelBase, { color: '#FFFFFF' }]}>Feed</Text>
                </LinearGradient>
              );
            }
            return <Home size={20} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: ({ focused }) =>
            focused ? null : <Text style={styles.inactiveLabel}>Profile</Text>,
          tabBarIcon: ({ color, focused }) => {
            if (focused) {
              return (
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.tabButton, styles.tabButtonActive]}
                >
                  <User size={20} color="#FFFFFF" />
                  <Text style={[styles.tabLabelBase, { color: '#FFFFFF' }]}>Profile</Text>
                </LinearGradient>
              );
            }
            return <User size={20} color={color} />;
          },
        }}
      />
      <Tab.Screen
        name="Sign Out"
        component={FeedScreen} // Dummy component, won't be shown
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            setShowSignOutModal(true);
          },
        }}
        options={{
          tabBarLabel: ({ focused }) =>
            focused ? null : <Text style={styles.inactiveLabel}>Sign Out</Text>,
          tabBarIcon: ({ color, focused }) => {
            if (focused) {
              return (
                <LinearGradient
                  colors={[colors.primary, colors.secondary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[styles.tabButton, styles.tabButtonActive]}
                >
                  <LogOut size={20} color="#FFFFFF" />
                  <Text style={[styles.tabLabelBase, { color: '#FFFFFF' }]}>Sign Out</Text>
                </LinearGradient>
              );
            }
            return <LogOut size={20} color={color} />;
          },
        }}
      />
      </Tab.Navigator>
      <SignOutModal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        loading={signingOut}
      />
    </>
  );
};

const styles = StyleSheet.create({
  tabButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 14,
    paddingVertical: 24,
    borderRadius: borderRadius.lg,
    width: 75,
    gap: 4,
  },
  tabButtonActive: {
    backgroundColor: colors.primary,
    marginTop: 23,
  },
  tabLabelBase: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
  },
  inactiveLabel: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semibold,
    color: colors.text.muted,
    marginTop: 2,
  },
});
