import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Modal,
  ScrollView,
  Dimensions,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import {
  ThumbsUp,
  MessageCircle,
  EllipsisVertical,
  Edit2,
  Trash2,
  X,
  MapPinned,
} from "lucide-react-native";
import { VideoView, useVideoPlayer } from "expo-video";
import { colors, spacing, typography, borderRadius } from "../constants/theme";
import { PostWithDetails } from "../types/database.types";
import { MentionText } from "./MentionText";

interface PostCardProps {
  post: PostWithDetails;
  onLike: () => void;
  onComment: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  isLiked: boolean;
  isOwner: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  onLike,
  onComment,
  onEdit,
  onDelete,
  isLiked,
  isOwner,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

  // Initialize video player for video posts
  const player = useVideoPlayer(
    post.media_type === "video" && post.media_url ? post.media_url : "",
    (player) => {
      player.loop = true;
      player.play();
    }
  );
  const getBadgeEmoji = (badge: string | null) => {
    switch (badge) {
      case "road_warrior":
        return "✈️";
      case "frequent_flyer":
        return "🔥";
      case "elite_traveler":
        return "⭐";
      default:
        return "";
    }
  };

  const getCategoryTag = (category: string) => {
    const tags: Record<string, { label: string; color: string }> = {
      helpful_tip: {
        label: "Helpful Tip",
        color: colors.categories.helpful_tip,
      },
      tsa_update: { label: "#TSA Update", color: colors.categories.tsa_update },
      food: { label: "#Food", color: colors.categories.food },
      gate_change: {
        label: "#Gate Change",
        color: colors.categories.gate_change,
      },
      wait_time: { label: "Wait Time", color: colors.categories.wait_time },
      parking: { label: "Parking", color: colors.categories.parking },
    };
    return (
      tags[category] || { label: category, color: colors.categories.general }
    );
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (seconds < 60) return "Just now";
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const categoryTag = getCategoryTag(post.category);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          {post.avatar_url ? (
            <Image
              source={{ uri: post.avatar_url }}
              style={styles.avatarImage}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>
                {(post.display_name || post.username).charAt(0).toUpperCase()}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.userInfo}>
          <View style={styles.nameRow}>
            <Text style={styles.username}>
              {post.display_name || post.username}
            </Text>
            {post.user_badge && (
              <Text style={styles.badge}>{getBadgeEmoji(post.user_badge)}</Text>
            )}
            <Text style={styles.userRole}>
              {post.user_role === "frequent_flyer"
                ? "Frequent Flyer"
                : post.user_role === "staff"
                ? "Staff"
                : ""}
            </Text>
          </View>
          <Text style={styles.timestamp}>{getTimeAgo(post.created_at)}</Text>
        </View>

        <View style={styles.headerRight}>
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.categoryTag}
          >
            <Text style={styles.categoryText}>{categoryTag.label}</Text>
          </LinearGradient>
        </View>
        {isOwner && (onEdit || onDelete) && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setShowMenu(true)}
          >
            <EllipsisVertical size={20} color={colors.text.secondary} />
          </TouchableOpacity>
        )}
      </View>

      <MentionText
        text={post.content}
        style={styles.content}
        onMentionPress={(username) => {
          Alert.alert(
            "User Profile",
            `View profile for @${username} (coming soon)`
          );
        }}
      />

      {post.media_url &&
        (post.media_type === "video" ? (
          <VideoView
            player={player}
            style={styles.media}
            nativeControls={true}
            contentFit="cover"
          />
        ) : (
          <TouchableOpacity
            onPress={() => setShowImageModal(true)}
            activeOpacity={0.9}
          >
            <Image
              source={{ uri: post.media_url }}
              style={styles.media}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}

      <View style={styles.footer}>
        <View style={styles.stats}>
          {post.location_text && (
            <>
              <MapPinned color={colors.text.secondary} size={14} />
              <Text style={styles.statText}>{post.location_text}</Text>
            </>
          )}
        </View>

        <View style={styles.actions}>
          <TouchableOpacity style={styles.actionButton} onPress={onLike}>
            <ThumbsUp color={colors.text.secondary} size={18} />
            <Text style={styles.actionText}>{post.like_count}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={onComment}>
            <MessageCircle color={colors.text.secondary} size={18} />
            <Text style={styles.actionText}>{post.comment_count}</Text>
          </TouchableOpacity>
          {/* 
          <View style={styles.xpBadge}>
            <Text style={styles.xpIcon}>💡</Text>
            <Text style={styles.xpText}>+{post.xp_reward} XP</Text>
          </View> */}
        </View>
      </View>

      {/* Action Menu Modal */}
      <Modal
        visible={showMenu}
        transparent
        animationType="fade"
        onRequestClose={() => setShowMenu(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowMenu(false)}
        >
          <View style={styles.menuModal}>
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>Post Actions</Text>
              <TouchableOpacity onPress={() => setShowMenu(false)}>
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            {onEdit && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  onEdit();
                }}
              >
                <Edit2 size={20} color={colors.text.primary} />
                <Text style={styles.menuItemText}>Edit Post</Text>
              </TouchableOpacity>
            )}

            {onDelete && (
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => {
                  setShowMenu(false);
                  onDelete();
                }}
              >
                <Trash2 size={20} color={colors.error} />
                <Text style={[styles.menuItemText, { color: colors.error }]}>
                  Delete Post
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Image Viewer Modal */}
      <Modal
        visible={showImageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowImageModal(false)}
      >
        <View style={styles.imageModalOverlay}>
          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setShowImageModal(false)}
          >
            <X size={32} color="#FFFFFF" />
          </TouchableOpacity>

          <ScrollView
            ref={scrollViewRef}
            style={styles.imageModalContent}
            contentContainerStyle={styles.imageScrollContent}
            maximumZoomScale={3}
            minimumZoomScale={1}
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bounces={true}
            bouncesZoom={true}
            centerContent={true}
          >
            {post.media_url && (
              <Image
                source={{ uri: post.media_url }}
                style={{ width: screenWidth, height: screenHeight }}
                resizeMode="contain"
              />
            )}
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    marginTop: spacing.lg,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 20,
    elevation: 10,
    width: "100%",
    maxWidth: 576,
  },
  header: {
    flexDirection: "row",
    marginBottom: spacing.md,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: borderRadius.full,
  },
  avatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  userInfo: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: 2,
  },
  username: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  badge: {
    fontSize: typography.sizes.sm,
  },
  userRole: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  timestamp: {
    fontSize: typography.sizes.xs,
    color: colors.text.muted,
  },
  headerRight: {
    flexDirection: "column",
    alignItems: "flex-end",
    gap: spacing.xs,
  },
  categoryTag: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.base,
    minHeight: 24,
    justifyContent: "center",
  },
  categoryText: {
    fontSize: typography.sizes.xxs,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  ownerActions: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  actionIconButton: {
    width: 28,
    height: 28,
    borderRadius: borderRadius.sm,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionIconText: {
    fontSize: typography.sizes.md,
  },
  content: {
    fontSize: typography.sizes.md,
    lineHeight: 22,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  media: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: borderRadius.lg,
    marginBottom: spacing.lg,
    overflow: "hidden",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  stats: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  statIcon: {
    fontSize: typography.sizes.sm,
  },
  statText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.lg,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    minHeight: 44,
  },
  actionIcon: {
    fontSize: typography.sizes.md,
  },
  actionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  xpBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
    gap: spacing.xs,
  },
  xpIcon: {
    fontSize: typography.sizes.sm,
  },
  xpText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.xp,
  },
  menuButton: {
    paddingLeft: spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  menuModal: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.xl,
    padding: spacing.lg,
    width: "80%",
    maxWidth: 400,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.input,
    marginBottom: spacing.sm,
  },
  menuItemText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.95)",
    justifyContent: "center",
    alignItems: "center",
  },
  imageModalClose: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    padding: spacing.sm,
  },
  imageModalContent: {
    flex: 1,
    width: "100%",
  },
  fullImage: {
    width: "100%",
    height: "100%",
  },
  imageScrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
