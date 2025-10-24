import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { 
  Camera, 
  MessageCircle, 
  ThumbsUp, 
  MapPin, 
  Bell, 
  Mail, 
  Globe, 
  Lock, 
  HelpCircle,
  ChevronRight,
  User,
  LogOut
} from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { AvatarUpload } from '../components/AvatarUpload';
import { SignOutModal } from '../components/SignOutModal';
import { supabase } from '../lib/supabase';

export const ProfileScreen: React.FC = () => {
  const { profile, signOut } = useAuth();
  const [pushNotifications, setPushNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);
  const [showSignOutModal, setShowSignOutModal] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [stats, setStats] = useState({
    postsShared: 0,
    helpfulVotes: 0,
    airportsVisited: 0,
  });

  useEffect(() => {
    if (profile?.id) {
      fetchStats();
    }
  }, [profile?.id]);

  const fetchStats = async () => {
    try {
      if (!profile?.id) return;

      // Fetch posts count
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.id);

      // Fetch total likes received on user's posts
      const { data: userPosts } = await supabase
        .from('posts')
        .select('id')
        .eq('user_id', profile.id);

      let totalLikes = 0;
      if (userPosts && userPosts.length > 0) {
        const postIds = userPosts.map(p => p.id);
        const { count: likesCount } = await supabase
          .from('likes')
          .select('*', { count: 'exact', head: true })
          .in('post_id', postIds);
        totalLikes = likesCount || 0;
      }

      // Fetch unique airports visited (from posts)
      const { data: airportPosts } = await supabase
        .from('posts')
        .select('airport_id')
        .eq('user_id', profile.id);

      const uniqueAirports = new Set(
        airportPosts?.map(p => p.airport_id).filter(Boolean)
      );

      setStats({
        postsShared: postsCount || 0,
        helpfulVotes: totalLikes,
        airportsVisited: uniqueAirports.size,
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getBadgeInfo = (badge: string | null) => {
    switch (badge) {
      case 'road_warrior':
        return { emoji: '✈️', label: 'Road Warrior' };
      case 'frequent_flyer':
        return { emoji: '🔥', label: 'Frequent Flyer' };
      case 'elite_traveler':
        return { emoji: '⭐', label: 'Elite Traveler' };
      default:
        return null;
    }
  };


  const handleLanguage = () => {
    Alert.alert('Language', 'Language selection coming soon!');
  };

  const handlePrivacySecurity = () => {
    Alert.alert('Privacy & Security', 'Privacy settings coming soon!');
  };

  const handleHelpSupport = () => {
    Alert.alert('Help & Support', 'Support options coming soon!');
  };

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await signOut();
      setShowSignOutModal(false);
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out');
    } finally {
      setSigningOut(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <AvatarUpload
            avatarUrl={profile?.avatar_url}
            username={profile?.username}
          />
          <Text style={styles.username}>{profile?.username || 'tfletch55'}</Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MessageCircle color={colors.primary} size={24} />
            </View>
            <Text style={styles.statValue}>{stats.postsShared}</Text>
            <Text style={styles.statLabel}>Posts Shared</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <ThumbsUp color={colors.primary} size={24} />
            </View>
            <Text style={styles.statValue}>{stats.helpfulVotes}</Text>
            <Text style={styles.statLabel}>Helpful Votes</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <MapPin color={colors.primary} size={24} />
            </View>
            <Text style={styles.statValue}>{stats.airportsVisited}</Text>
            <Text style={styles.statLabel}>Airports Visited</Text>
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Bell color={colors.primary} size={20} />
            </View>
            <Text style={styles.sectionTitle}>Notifications</Text>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Bell color={colors.text.secondary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Push Notifications</Text>
              <Text style={styles.settingSubtitle}>Get alerts for your terminal</Text>
            </View>
            <Switch
              value={pushNotifications}
              onValueChange={setPushNotifications}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <MapPin color={colors.text.secondary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Location Services</Text>
              <Text style={styles.settingSubtitle}>Auto-detect your terminal</Text>
            </View>
            <Switch
              value={locationServices}
              onValueChange={setLocationServices}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text.primary}
            />
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingIcon}>
              <Mail color={colors.text.secondary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Email Updates</Text>
              <Text style={styles.settingSubtitle}>Weekly travel tips & news</Text>
            </View>
            <Switch
              value={emailUpdates}
              onValueChange={setEmailUpdates}
              trackColor={{ false: colors.border, true: colors.primary }}
              thumbColor={colors.text.primary}
            />
          </View>
        </View>

        {/* Account Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <User color={colors.primary} size={20} />
            </View>
            <Text style={styles.sectionTitle}>Account Settings</Text>
          </View>

          <TouchableOpacity style={styles.menuItem} onPress={handleLanguage}>
            <View style={styles.settingIcon}>
              <Globe color={colors.text.secondary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Language</Text>
            </View>
            <View style={styles.menuRight}>
              <Text style={styles.menuValue}>English</Text>
              <ChevronRight color={colors.text.secondary} size={20} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={handlePrivacySecurity}>
            <View style={styles.settingIcon}>
              <Lock color={colors.text.secondary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Privacy & Security</Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight color={colors.text.secondary} size={20} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, styles.menuItemBorder]} onPress={handleHelpSupport}>
            <View style={styles.settingIcon}>
              <HelpCircle color={colors.text.secondary} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={styles.settingTitle}>Help & Support</Text>
            </View>
            <View style={styles.menuRight}>
              <ChevronRight color={colors.text.secondary} size={20} />
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.menuItem, styles.menuItemBorder, styles.signOutButton]} 
            onPress={() => setShowSignOutModal(true)}
          >
            <View style={styles.settingIcon}>
              <LogOut color={colors.error} size={20} />
            </View>
            <View style={styles.settingContent}>
              <Text style={[styles.settingTitle, styles.signOutText]}>Sign Out</Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <SignOutModal
        visible={showSignOutModal}
        onClose={() => setShowSignOutModal(false)}
        onConfirm={handleSignOut}
        loading={signingOut}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 100, // Extra space for tab bar
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingTop: spacing.xxl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: spacing.md,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarPlaceholder: {
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 48,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: colors.background,
  },
  username: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  statIconContainer: {
    marginBottom: spacing.xs,
  },
  statValue: {
    fontSize: typography.sizes.xl,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  section: {
    marginTop: spacing.lg,
    marginHorizontal: spacing.md,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  sectionIconContainer: {
    marginRight: spacing.sm,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
  },
  menuItemBorder: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  menuValue: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  menuArrow: {
    fontSize: 24,
    color: colors.text.muted,
  },
  signOutButton: {
    marginTop: spacing.md,
  },
  signOutText: {
    color: colors.error,
  },
});
