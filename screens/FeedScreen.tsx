import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
  Text,
  Modal,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, spacing, borderRadius } from "../constants/theme";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import {
  PostWithDetails,
  PostCategory,
  Mission,
  UserMission,
} from "../types/database.types";
import { Header } from "../components/Header";
import { AlertBanner } from "../components/AlertBanner";
import { TerminalSelector } from "../components/TerminalSelector";
import { MissionCard } from "../components/MissionCard";
import { CategoryFilter, FeedCategory } from "../components/CategoryFilter";
import { CreatePostInput } from "../components/CreatePostInput";
import { MapPinned, Plus } from "lucide-react-native";
import { PostCard } from "../components/PostCard";
import { CreatePostScreen } from "./CreatePostScreen";
import { EditPostScreen } from "./EditPostScreen";
import { CommentsScreen } from "./CommentsScreen";
import { FlightInfoModal } from "../components/FlightInfoModal";

export const FeedScreen: React.FC = () => {
  const { profile, refreshProfile } = useAuth();
  const [posts, setPosts] = useState<PostWithDetails[]>([]);
  const [missions, setMissions] = useState<Mission[]>([]);
  const [userMissions, setUserMissions] = useState<UserMission[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<FeedCategory>("all");
  const [refreshing, setRefreshing] = useState(false);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [currentAirport, setCurrentAirport] = useState("ATL");
  const [currentTerminal, setCurrentTerminal] = useState("Terminal B");
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [showEditPost, setShowEditPost] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [editingPost, setEditingPost] = useState<PostWithDetails | null>(null);
  const [commentingPost, setCommentingPost] = useState<PostWithDetails | null>(
    null
  );
  const [currentAirportId, setCurrentAirportId] = useState<string>("");
  const [currentTerminalId, setCurrentTerminalId] = useState<string>("");
  const [allPostsForCounting, setAllPostsForCounting] = useState<
    Array<{ id: string; category: PostCategory; terminal_id: string | null }>
  >([]); // Store all posts for counting
  const [showFlightInfoModal, setShowFlightInfoModal] = useState(false);

  useEffect(() => {
    if (profile) {
      initializeLocation();
      fetchMissions();
      fetchLikedPosts();
      subscribeToRealtimeUpdates();
      checkFirstLogin();
    }
  }, [profile]);

  const checkFirstLogin = async () => {
    try {
      // Check if user has seen the flight info modal
      const { data } = await supabase
        .from("profiles")
        .select("has_seen_flight_modal")
        .eq("id", profile?.id)
        .single();

      if (data && !data.has_seen_flight_modal) {
        setShowFlightInfoModal(true);
      }
    } catch (error) {
      console.error("Error checking first login:", error);
    }
  };

  useEffect(() => {
    if (profile) {
      fetchPosts();
    }
  }, [profile, selectedCategory, currentTerminalId]);

  const initializeLocation = async () => {
    try {
      let airportId = profile?.current_airport_id;
      let airportCode = currentAirport;

      // If user has a saved airport ID, use it
      if (profile?.current_airport_id) {
        const { data: airport } = await supabase
          .from("airports")
          .select("id, code, name")
          .eq("id", profile.current_airport_id)
          .single();

        if (airport) {
          airportId = airport.id;
          airportCode = airport.code;
          setCurrentAirport(airportCode);
          setCurrentAirportId(airport.id);
        }
      } else {
        // Fallback to default airport
        const { data: airport } = await supabase
          .from("airports")
          .select("id, code")
          .eq("code", currentAirport)
          .single();

        if (airport) {
          airportId = airport.id;
          setCurrentAirportId(airport.id);
        }
      }

      if (airportId) {
        // If user has a saved terminal, use it
        if (profile?.current_terminal_id) {
          setCurrentTerminalId(profile.current_terminal_id);

          // Get terminal name
          const { data: terminal } = await supabase
            .from("terminals")
            .select("name")
            .eq("id", profile.current_terminal_id)
            .single();

          if (terminal) {
            setCurrentTerminal(terminal.name);
          }
        } else {
          // Default to Terminal B
          const { data: terminal } = await supabase
            .from("terminals")
            .select("id, name")
            .eq("airport_id", airportId)
            .eq("code", "B")
            .single();

          if (terminal) {
            setCurrentTerminalId(terminal.id);
            setCurrentTerminal(terminal.name);
          }
        }
      }
    } catch (error) {
      console.error("Error initializing location:", error);
    }
  };

  const fetchPosts = async () => {
    try {
      // Get airport and terminal IDs
      const { data: airport } = await supabase
        .from("airports")
        .select("id")
        .eq("code", currentAirport)
        .single();

      if (!airport) return;

      setCurrentAirportId(airport.id);

      // Only set terminal if not already set (initial load)
      if (!currentTerminalId) {
        const { data: terminal } = await supabase
          .from("terminals")
          .select("id")
          .eq("airport_id", airport.id)
          .eq("code", "B")
          .single();

        if (terminal) {
          setCurrentTerminalId(terminal.id);
        }
      }

      // Fetch posts with user details and counts
      let query = supabase
        .from("posts")
        .select(
          `
          *,
          profiles:user_id (
            username,
            display_name,
            avatar_url,
            role,
            badge
          )
        `
        )
        .eq("airport_id", airport.id)
        .order("created_at", { ascending: false })
        .limit(20);

      if (currentTerminalId && selectedCategory === "my_terminal") {
        query = query.eq("terminal_id", currentTerminalId);
      } else if (selectedCategory !== "all") {
        query = query.eq("category", selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      // Fetch likes and comments counts for each post
      const postsWithCounts = await Promise.all(
        (data || []).map(async (post: any) => {
          const [likesResult, commentsResult] = await Promise.all([
            supabase
              .from("likes")
              .select("id", { count: "exact" })
              .eq("post_id", post.id),
            supabase
              .from("comments")
              .select("id", { count: "exact" })
              .eq("post_id", post.id),
          ]);

          return {
            ...post,
            username: post.profiles?.username || "Unknown",
            display_name: post.profiles?.display_name,
            avatar_url: post.profiles?.avatar_url,
            user_role: post.profiles?.role || "regular",
            user_badge: post.profiles?.badge,
            like_count: likesResult.count || 0,
            comment_count: commentsResult.count || 0,
          };
        })
      );

      setPosts(postsWithCounts);

      // Fetch all posts for category counting (without filtering)
      if (selectedCategory !== "all") {
        const { data: allData } = await supabase
          .from("posts")
          .select("id, category, terminal_id")
          .eq("airport_id", airport.id);

        setAllPostsForCounting(allData || []);
      } else {
        setAllPostsForCounting(
          postsWithCounts.map((p) => ({
            id: p.id,
            category: p.category,
            terminal_id: p.terminal_id,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
      Alert.alert("Error", "Failed to load posts");
    }
  };

  const fetchMissions = async () => {
    try {
      const { data: missionsData, error: missionsError } = await supabase
        .from("missions")
        .select("*")
        .eq("active", true);

      if (missionsError) throw missionsError;

      const { data: userMissionsData, error: userMissionsError } =
        await supabase
          .from("user_missions")
          .select("*")
          .eq("user_id", profile?.id);

      if (userMissionsError) throw userMissionsError;

      setMissions(missionsData || []);
      setUserMissions(userMissionsData || []);
    } catch (error) {
      console.error("Error fetching missions:", error);
    }
  };

  const fetchLikedPosts = async () => {
    try {
      const { data, error } = await supabase
        .from("likes")
        .select("post_id")
        .eq("user_id", profile?.id);

      if (error) throw error;

      setLikedPosts(new Set(data?.map((like) => like.post_id) || []));
    } catch (error) {
      console.error("Error fetching liked posts:", error);
    }
  };

  const subscribeToRealtimeUpdates = () => {
    const channel = supabase
      .channel("posts-channel")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        async (payload) => {
          console.log("New post created:", payload.new);
          // Fetch the complete post with user details
          const { data: newPost } = await supabase
            .from("posts")
            .select(
              `
              *,
              profiles:user_id (
                username,
                display_name,
                avatar_url,
                role,
                badge
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (newPost) {
            // Add like and comment counts
            const postWithCounts = {
              ...newPost,
              user_id: newPost.user_id,
              username: newPost.profiles?.username || "",
              display_name: newPost.profiles?.display_name || "",
              avatar_url: newPost.profiles?.avatar_url || null,
              user_role: newPost.profiles?.role || "regular",
              user_badge: newPost.profiles?.badge || null,
              like_count: 0,
              comment_count: 0,
            };

            // Add to top of feed
            setPosts((prev) => [postWithCounts, ...prev]);
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "posts",
        },
        async (payload) => {
          console.log("Post updated:", payload.new);
          // Fetch the updated post with user details
          const { data: updatedPost } = await supabase
            .from("posts")
            .select(
              `
              *,
              profiles:user_id (
                username,
                display_name,
                avatar_url,
                role,
                badge
              )
            `
            )
            .eq("id", payload.new.id)
            .single();

          if (updatedPost) {
            setPosts((prev) =>
              prev.map((post) =>
                post.id === updatedPost.id
                  ? {
                      ...updatedPost,
                      user_id: updatedPost.user_id,
                      username: updatedPost.profiles?.username || "",
                      display_name: updatedPost.profiles?.display_name || "",
                      avatar_url: updatedPost.profiles?.avatar_url || null,
                      user_role: updatedPost.profiles?.role || "regular",
                      user_badge: updatedPost.profiles?.badge || null,
                      like_count: post.like_count,
                      comment_count: post.comment_count,
                    }
                  : post
              )
            );
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "posts",
        },
        (payload) => {
          console.log("Post deleted:", payload.old);
          // Remove from feed
          setPosts((prev) => prev.filter((post) => post.id !== payload.old.id));
        }
      )
      .subscribe();

    // Also subscribe to likes for real-time like count updates
    const likesChannel = supabase
      .channel("likes-channel")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "likes",
        },
        () => {
          // Refresh like counts
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      supabase.removeChannel(likesChannel);
    };
  };

  const handleLike = async (postId: string) => {
    try {
      if (likedPosts.has(postId)) {
        // Unlike
        await supabase
          .from("likes")
          .delete()
          .eq("post_id", postId)
          .eq("user_id", profile?.id);

        setLikedPosts((prev) => {
          const newSet = new Set(prev);
          newSet.delete(postId);
          return newSet;
        });
      } else {
        // Like
        await supabase
          .from("likes")
          .insert({ post_id: postId, user_id: profile?.id });

        setLikedPosts((prev) => new Set(prev).add(postId));
      }

      fetchPosts();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleComment = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setCommentingPost(post);
      setShowComments(true);
    }
  };

  const handleCloseComments = () => {
    setShowComments(false);
    setCommentingPost(null);
    fetchPosts(); // Refresh to update comment counts
  };

  const handleEdit = (postId: string) => {
    const post = posts.find((p) => p.id === postId);
    if (post) {
      setEditingPost(post);
      setShowEditPost(true);
    }
  };

  const handleCloseEditPost = () => {
    setShowEditPost(false);
    setEditingPost(null);
  };

  const handleEditSuccess = () => {
    fetchPosts(); // Refresh posts after editing
  };

  const handleDelete = async (postId: string) => {
    Alert.alert(
      "Delete Post",
      "Are you sure you want to delete this post? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              const { error } = await supabase
                .from("posts")
                .delete()
                .eq("id", postId);

              if (error) throw error;

              // Remove from local state
              setPosts(posts.filter((p) => p.id !== postId));
              Alert.alert("Success", "Post deleted successfully");
            } catch (error: any) {
              console.error("Error deleting post:", error);
              Alert.alert("Error", "Failed to delete post");
            }
          },
        },
      ]
    );
  };

  const handleCreatePost = () => {
    setShowCreatePost(true);
  };

  const handleCloseCreatePost = () => {
    setShowCreatePost(false);
    fetchPosts(); // Refresh posts after creating
  };

  const handleChangeAirport = async (airport: any) => {
    try {
      // Update state
      setCurrentAirport(airport.code);
      setCurrentAirportId(airport.id);

      // Update user's current airport in profile
      await supabase
        .from("profiles")
        .update({
          current_airport_id: airport.id,
          current_terminal_id: null, // Reset terminal when changing airport
        })
        .eq("id", profile?.id);

      // Get default terminal (Terminal B) for the new airport
      const { data: terminal } = await supabase
        .from("terminals")
        .select("id, name")
        .eq("airport_id", airport.id)
        .eq("code", "B")
        .single();

      if (terminal) {
        setCurrentTerminal(terminal.name);
        setCurrentTerminalId(terminal.id);
      } else {
        setCurrentTerminal("");
        setCurrentTerminalId("");
      }

      // Refresh posts will be triggered by useEffect when currentTerminalId changes
    } catch (error) {
      console.error("Error updating airport:", error);
    }
  };

  const handleAISummary = () => {
    Alert.alert("AI Summary", "AI-powered terminal summary coming soon!");
  };

  const handleFlightInfoSubmit = async (
    flightNumber: string,
    flightData: any
  ) => {
    try {
      // Handle clearing flight data
      if (flightNumber === "" && flightData === null) {
        await supabase
          .from("profiles")
          .update({
            flight_number: null,
            flight_iata: null,
            departure_airport: null,
            arrival_airport: null,
            departure_time: null,
            arrival_time: null,
            airline_name: null,
            flight_status: null,
            dep_gate: null,
            arr_gate: null,
            dep_terminal: null,
            arr_terminal: null,
            flight_duration: null,
            dep_delayed: null,
            arr_delayed: null,
            codeshare_airline: null,
            codeshare_flight: null,
          })
          .eq("id", profile?.id);

        await refreshProfile();
        // Keep modal open so user can enter new flight number
        // Modal will now show the input form again since flight_number is null
        return;
      }

      if (flightData) {
        // Check and create airports if they don't exist
        const airportsToCheck = [
          {
            code: flightData.dep_iata,
            name: flightData.dep_name || `${flightData.dep_iata} Airport`,
            city: flightData.dep_city || "",
            country: flightData.dep_country || "",
          },
          {
            code: flightData.arr_iata,
            name: flightData.arr_name || `${flightData.arr_iata} Airport`,
            city: flightData.arr_city || "",
            country: flightData.arr_country || "",
          },
        ];

        for (const airport of airportsToCheck) {
          // Check if airport exists
          const { data: existingAirport } = await supabase
            .from("airports")
            .select("id")
            .eq("code", airport.code)
            .single();

          // Create airport if it doesn't exist
          if (!existingAirport) {
            console.log(`Creating airport: ${airport.code} - ${airport.name}`);
            const { error: insertError } = await supabase
              .from("airports")
              .insert({
                code: airport.code,
                name: airport.name,
                city: airport.city,
                country: airport.country,
              });

            if (insertError) {
              console.error(
                `Error creating airport ${airport.code}:`,
                insertError
              );
            } else {
              console.log(`Airport ${airport.code} created successfully`);
            }
          } else {
            console.log(`Airport ${airport.code} already exists`);
          }
        }

        // Get the departure airport ID to set as current airport
        const { data: depAirport } = await supabase
          .from("airports")
          .select("id")
          .eq("code", flightData.dep_iata)
          .single();

        // Update profile with flight data from API
        // Also set current_airport_id to departure airport
        await supabase
          .from("profiles")
          .update({
            has_seen_flight_modal: true,
            flight_number: flightNumber,
            flight_iata: flightData.flight_iata,
            departure_airport: flightData.dep_iata,
            arrival_airport: flightData.arr_iata,
            departure_time: flightData.dep_time,
            arrival_time: flightData.arr_time,
            airline_name: flightData.airline_name,
            flight_status: flightData.status,
            dep_gate: flightData.dep_gate,
            arr_gate: flightData.arr_gate,
            dep_terminal: flightData.dep_terminal,
            arr_terminal: flightData.arr_terminal,
            flight_duration: flightData.duration,
            dep_delayed: flightData.dep_delayed,
            arr_delayed: flightData.arr_delayed,
            codeshare_airline: flightData.cs_airline_iata,
            codeshare_flight: flightData.cs_flight_iata,
            current_airport_id: depAirport?.id || null,
          })
          .eq("id", profile?.id);
      } else {
        // No flight data (confirmation code or skipped)
        await supabase
          .from("profiles")
          .update({
            has_seen_flight_modal: true,
            flight_number: flightNumber,
          })
          .eq("id", profile?.id);
      }

      // Refresh profile to update the airport selector
      await refreshProfile();

      // Keep modal open to show the flight information
      // Modal will stay open and display the saved flight data
      // User can close it manually using the X button
    } catch (error) {
      console.error("Error saving flight info:", error);
      Alert.alert("Error", "Failed to save flight information");
    }
  };

  const handleFlightInfoClose = async () => {
    try {
      // Mark modal as seen even if skipped
      await supabase
        .from("profiles")
        .update({ has_seen_flight_modal: true })
        .eq("id", profile?.id);

      setShowFlightInfoModal(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      setShowFlightInfoModal(false);
    }
  };

  const handleSelectTerminal = async (terminal: any) => {
    setCurrentTerminal(terminal.name);
    setCurrentTerminalId(terminal.id);

    // Update user's current terminal in profile
    try {
      await supabase
        .from("profiles")
        .update({ current_terminal_id: terminal.id })
        .eq("id", profile?.id);

      // Refresh posts for new terminal
      await fetchPosts();
    } catch (error) {
      console.error("Error updating terminal:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchPosts(), fetchMissions(), refreshProfile()]);
    setRefreshing(false);
  };

  // Calculate category counts
  const getCategoryCounts = () => {
    const counts = {
      all: allPostsForCounting.length,
      my_terminal: allPostsForCounting.filter(
        (p) => p.terminal_id === currentTerminalId
      ).length,
      tsa_update: allPostsForCounting.filter((p) => p.category === "tsa_update")
        .length,
      food: allPostsForCounting.filter((p) => p.category === "food").length,
      parking: allPostsForCounting.filter((p) => p.category === "parking")
        .length,
      helpful_tip: allPostsForCounting.filter(
        (p) => p.category === "helpful_tip"
      ).length,
      gate_change: allPostsForCounting.filter(
        (p) => p.category === "gate_change"
      ).length,
      wait_time: allPostsForCounting.filter((p) => p.category === "wait_time")
        .length,
      general: allPostsForCounting.filter((p) => p.category === "general")
        .length,
    };
    return counts;
  };

  if (!profile) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <Modal
        visible={showCreatePost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <CreatePostScreen
          onClose={handleCloseCreatePost}
          airportId={currentAirportId}
          terminalId={currentTerminalId}
        />
      </Modal>

      <Modal
        visible={showEditPost}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {editingPost && (
          <EditPostScreen
            onClose={handleCloseEditPost}
            post={editingPost}
            onSuccess={handleEditSuccess}
          />
        )}
      </Modal>

      <Modal
        visible={showComments}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowComments(false)}
      >
        {commentingPost && (
          <CommentsScreen
            onClose={() => setShowComments(false)}
            postId={commentingPost.id}
            postAuthor={commentingPost.username}
          />
        )}
      </Modal>

      <FlightInfoModal
        visible={showFlightInfoModal}
        onClose={handleFlightInfoClose}
        onSubmit={handleFlightInfoSubmit}
        profile={profile}
      />

      <FlatList
        data={[
          { type: "header" as const },
          { type: "sticky" as const },
          ...posts.map((post) => ({ type: "post" as const, data: post })),
        ]}
        keyExtractor={(item, index) =>
          item.type === "header"
            ? "header"
            : item.type === "sticky"
            ? "sticky"
            : (item as any).data.id
        }
        renderItem={({ item }) => {
          if (item.type === "header") {
            return (
              <>
                <Header
                  profile={profile}
                  currentAirport={currentAirport}
                  currentAirportId={currentAirportId}
                  currentTerminal={currentTerminal}
                  onChangeAirport={handleChangeAirport}
                  onAISummary={handleAISummary}
                  onFlightInfo={() => setShowFlightInfoModal(true)}
                />

                <AlertBanner />

                {currentAirportId && (
                  <TerminalSelector
                    airportId={currentAirportId}
                    selectedTerminalId={currentTerminalId}
                    onSelectTerminal={handleSelectTerminal}
                  />
                )}

                <View style={styles.feedNotice}>
                  <MapPinned size={16} color={colors.text.tertiary} />
                  <Text style={styles.feedNoticeText}>
                    Your feed is currently showing posts from Terminal B.
                  </Text>
                </View>

                {!posts.length && (
                  <CreatePostInput onPress={handleCreatePost} />
                )}
              </>
            );
          }

          if (item.type === "sticky") {
            return (
              <View style={styles.stickyHeader}>
                <CategoryFilter
                  selectedCategory={selectedCategory}
                  onSelectCategory={setSelectedCategory}
                  categoryCounts={getCategoryCounts()}
                />
              </View>
            );
          }

          const postItem = item as { type: "post"; data: PostWithDetails };
          return (
            <View style={styles.feedItem}>
              <PostCard
                post={postItem.data}
                onLike={() => handleLike(postItem.data.id)}
                onComment={() => handleComment(postItem.data.id)}
                onEdit={() => handleEdit(postItem.data.id)}
                onDelete={() => handleDelete(postItem.data.id)}
                isLiked={likedPosts.has(postItem.data.id)}
                isOwner={postItem.data.user_id === profile?.id}
              />
            </View>
          );
        }}
        stickyHeaderIndices={[1]}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePost}
        activeOpacity={0.8}
      >
        <LinearGradient
          colors={[colors.primary, colors.secondary]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabInner}
        >
          <Plus size={28} color={colors.text.primary} />
        </LinearGradient>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    // marginBottom: spacing.xxl,
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    color: colors.text.primary,
    fontSize: 16,
  },
  listContent: {
    paddingBottom: spacing.xxxxxl,
    paddingHorizontal: spacing.md,
  },
  missionContainer: {
    paddingHorizontal: spacing.md,
  },
  feedItem: {
    width: "100%",
    maxWidth: 576,
    alignSelf: "center",
  },
  terminalInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  terminalText: {
    fontSize: 16,
    fontWeight: "600",
    color: colors.text.primary,
  },
  gatesText: {
    fontSize: 14,
    color: colors.text.secondary,
  },
  feedNotice: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    width: "100%",
    maxWidth: 576,
    alignSelf: "center",
  },
  feedNoticeIcon: {
    fontSize: 12,
  },
  feedNoticeText: {
    flex: 1,
    fontSize: 13,
    color: colors.text.secondary,
  },
  createPostContainer: {
    paddingHorizontal: spacing.md,
  },
  fab: {
    position: "absolute",
    bottom: 80,
    right: spacing.md,
    width: 54,
    height: 54,
    borderRadius: borderRadius.full,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    elevation: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
  },
  fabInner: {
    width: "100%",
    height: "100%",
    borderRadius: borderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  stickyHeader: {
    backgroundColor: colors.background,
    // paddingBottom: spacing.xs,
  },
});
