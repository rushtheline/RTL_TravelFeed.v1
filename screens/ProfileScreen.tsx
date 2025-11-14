import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
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
  Shield,
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
        <View style={styles.profileHeader}>
          <LinearGradient
            colors={['rgba(166,20,112,0.2)', 'transparent']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.headerGradient}
          />
          <View style={styles.headerContent}>
            <AvatarUpload
              avatarUrl={profile?.avatar_url}
              username={profile?.username}
            />
            <Text style={styles.username}>{profile?.username || 'Traveler'}</Text>

            <View style={styles.statsGrid}>
              <LinearGradient
                colors={['#1F2029', '#2A2B35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <View style={styles.statIcon}>
                  <MessageCircle size={20} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{stats.postsShared}</Text>
                <Text style={styles.statLabel}>Posts Shared</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#1F2029', '#2A2B35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <View style={styles.statIcon}>
                  <ThumbsUp size={20} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{stats.helpfulVotes}</Text>
                <Text style={styles.statLabel}>Helpful Votes</Text>
              </LinearGradient>

              <LinearGradient
                colors={['#1F2029', '#2A2B35']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.statCard}
              >
                <View style={styles.statIcon}>
                  <MapPin size={20} color={colors.primary} />
                </View>
                <Text style={styles.statValue}>{stats.airportsVisited}</Text>
                <Text style={styles.statLabel}>Airports Visited</Text>
              </LinearGradient>
            </View>
          </View>
        </View>

        <View style={styles.mainContent}>
          {/* Notifications Card */}
          <LinearGradient
            colors={['#1F2029', '#2A2B35']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Bell color={colors.primary} size={20} />
              <Text style={styles.cardTitle}>Notifications</Text>
            </View>

            <View style={styles.cardBody}>
              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Bell color={'rgba(255,255,255,0.6)'} size={20} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Push Notifications</Text>
                    <Text style={styles.settingSubtitle}>
                      Get alerts for your terminal
                    </Text>
                  </View>
                </View>
                <Switch
                  value={pushNotifications}
                  onValueChange={setPushNotifications}
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.primary }}
                  thumbColor={colors.text.primary}
                  ios_backgroundColor="rgba(255,255,255,0.2)"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <MapPin color={'rgba(255,255,255,0.6)'} size={20} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Location Services</Text>
                    <Text style={styles.settingSubtitle}>
                      Auto-detect your terminal
                    </Text>
                  </View>
                </View>
                <Switch
                  value={locationServices}
                  onValueChange={setLocationServices}
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.primary }}
                  thumbColor={colors.text.primary}
                  ios_backgroundColor="rgba(255,255,255,0.2)"
                />
              </View>

              <View style={styles.settingRow}>
                <View style={styles.settingLeft}>
                  <Mail color={'rgba(255,255,255,0.6)'} size={20} />
                  <View style={styles.settingText}>
                    <Text style={styles.settingTitle}>Email Updates</Text>
                    <Text style={styles.settingSubtitle}>
                      Weekly travel tips & news
                    </Text>
                  </View>
                </View>
                <Switch
                  value={emailUpdates}
                  onValueChange={setEmailUpdates}
                  trackColor={{ false: 'rgba(255,255,255,0.2)', true: colors.primary }}
                  thumbColor={colors.text.primary}
                  ios_backgroundColor="rgba(255,255,255,0.2)"
                />
              </View>
            </View>
          </LinearGradient>

          {/* Account Settings Card */}
          <LinearGradient
            colors={['#1F2029', '#2A2B35']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Shield color={colors.primary} size={20} />
              <Text style={styles.cardTitle}>Account Settings</Text>
            </View>

            <View style={styles.menuList}>
              <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={0.85}
                onPress={handleLanguage}
              >
                <View style={styles.menuLeft}>
                  <Globe size={20} color={'rgba(255,255,255,0.6)'} />
                  <Text style={styles.menuLabel}>Language</Text>
                </View>
                <View style={styles.menuRight}>
                  <Text style={styles.menuValue}>English</Text>
                  <ChevronRight size={20} color={'rgba(255,255,255,0.5)'} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={0.85}
                onPress={handlePrivacySecurity}
              >
                <View style={styles.menuLeft}>
                  <Lock size={20} color={'rgba(255,255,255,0.6)'} />
                  <Text style={styles.menuLabel}>Privacy & Security</Text>
                </View>
                <View style={styles.menuRight}>
                  <ChevronRight size={20} color={'rgba(255,255,255,0.5)'} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuButton}
                activeOpacity={0.85}
                onPress={handleHelpSupport}
              >
                <View style={styles.menuLeft}>
                  <HelpCircle size={20} color={'rgba(255,255,255,0.6)'} />
                  <Text style={styles.menuLabel}>Help & Support</Text>
                </View>
                <View style={styles.menuRight}>
                  <ChevronRight size={20} color={'rgba(255,255,255,0.5)'} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.menuButton, styles.signOutButton]}
                activeOpacity={0.85}
                onPress={() => setShowSignOutModal(true)}
              >
                <View style={styles.menuLeft}>
                  <LogOut size={20} color={colors.error} />
                  <Text style={[styles.menuLabel, styles.signOutText]}>
                    Sign Out
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
          </LinearGradient>
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
    paddingBottom: spacing.xxxl,
  },
  profileHeader: {
    position: 'relative',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 192,
  },
  headerContent: {
    alignItems: 'center',
    position: 'relative',
  },
  username: {
    marginTop: spacing.lg,
    marginBottom: spacing.md,
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textAlign: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    marginTop: spacing.lg,
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 8,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(166,20,112,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  statLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  mainContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxl,
    gap: spacing.lg,
    maxWidth: 672,
    alignSelf: 'center',
    width: '100%',
  },
  card: {
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 10,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  cardBody: {
    gap: spacing.md,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.input,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    flex: 1,
  },
  settingText: {
    flexShrink: 1,
    gap: 2,
  },
  settingTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  settingSubtitle: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  menuList: {
    gap: spacing.sm,
  },
  menuButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.input,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuLabel: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  menuRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  menuValue: {
    fontSize: typography.sizes.sm,
    color: colors.text.tertiary,
  },
  signOutButton: {
    borderColor: 'rgba(255,255,255,0.15)',
  },
  signOutText: {
    color: colors.error,
  },
});
