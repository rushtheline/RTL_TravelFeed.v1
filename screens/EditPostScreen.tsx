import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { VideoView, useVideoPlayer } from 'expo-video';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PostCategory, PostWithDetails } from '../types/database.types';
import { MentionInput } from '../components/MentionInput';

interface EditPostScreenProps {
  onClose: () => void;
  post: PostWithDetails;
  onSuccess: () => void;
}

export const EditPostScreen: React.FC<EditPostScreenProps> = ({
  onClose,
  post,
  onSuccess,
}) => {
  const { profile } = useAuth();
  const [content, setContent] = useState(post.content);
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>(post.category);
  const [locationText, setLocationText] = useState(post.location_text || '');
  const [mediaUri, setMediaUri] = useState<string | null>(post.media_url);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(
    post.media_type as 'image' | 'video' | null
  );
  const [mediaChanged, setMediaChanged] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Initialize video player for preview
  const player = useVideoPlayer(mediaUri && mediaType === 'video' ? mediaUri : '', player => {
    player.loop = true;
  });

  const categories: { key: PostCategory; label: string; emoji: string }[] = [
    { key: 'helpful_tip', label: 'Helpful Tip', emoji: '💡' },
    { key: 'tsa_update', label: 'TSA Update', emoji: '🔒' },
    { key: 'gate_change', label: 'Gate Change', emoji: '🚪' },
    { key: 'wait_time', label: 'Wait Time', emoji: '⏱️' },
    { key: 'food', label: 'Food', emoji: '🍔' },
    { key: 'parking', label: 'Parking', emoji: '🅿️' },
    { key: 'general', label: 'General', emoji: '💬' },
  ];

  const pickMedia = async (type: 'image' | 'video') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: type === 'image' ? ('images' as any) : ('videos' as any),
      allowsEditing: type === 'image',
      aspect: type === 'image' ? [16, 9] : undefined,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
      setMediaType(type);
      setMediaChanged(true);
    }
  };

  const uploadMedia = async (uri: string): Promise<string | null> => {
    try {
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${profile?.id}/${Date.now()}.${fileExt}`;
      
      const mimeTypeMap: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'heic': 'image/heic',
        'heif': 'image/heif',
        'mp4': 'video/mp4',
        'mov': 'video/quicktime',
        'avi': 'video/x-msvideo',
        'webm': 'video/webm',
      };
      
      const mimeType = mimeTypeMap[fileExt] || (mediaType === 'video' ? 'video/mp4' : 'image/jpeg');

      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();
      const fileData = new Uint8Array(arrayBuffer);

      const { data, error } = await supabase.storage
        .from('post-media')
        .upload(fileName, fileData, {
          contentType: mimeType,
          upsert: false,
        });

      if (error) throw error;

      const { data: urlData } = supabase.storage
        .from('post-media')
        .getPublicUrl(data.path);

      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      Alert.alert('Error', 'Please enter some content');
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = post.media_url;
      
      // Upload new media if changed
      if (mediaChanged && mediaUri && !mediaUri.startsWith('http')) {
        mediaUrl = await uploadMedia(mediaUri);
      } else if (!mediaUri) {
        // Media was removed
        mediaUrl = null;
      }

      const { error } = await supabase
        .from('posts')
        .update({
          category: selectedCategory,
          content: content.trim(),
          media_url: mediaUrl,
          media_type: mediaUrl ? mediaType : null,
          location_text: locationText.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', post.id);

      if (error) throw error;

      Alert.alert('Success', 'Post updated successfully!');
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error updating post:', error);
      Alert.alert('Error', error.message || 'Failed to update post');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Edit Post</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.saveText}>Save</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <Text style={styles.label}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                selectedCategory === cat.key && styles.categoryChipSelected,
              ]}
              onPress={() => setSelectedCategory(cat.key)}
            >
              <Text style={styles.categoryEmoji}>{cat.emoji}</Text>
              <Text
                style={[
                  styles.categoryLabel,
                  selectedCategory === cat.key && styles.categoryLabelSelected,
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={styles.label}>Content</Text>
        <MentionInput
          style={styles.textArea}
          placeholder="Share something helpful with fellow travelers... (use @username to mention)"
          value={content}
          onChangeText={setContent}
          multiline
          maxLength={1000}
        />

        <Text style={styles.label}>Location (Optional)</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Terminal B, Gate B12"
          placeholderTextColor={colors.text.muted}
          value={locationText}
          onChangeText={setLocationText}
        />

        {mediaUri && (
          <View style={styles.mediaPreview}>
            {mediaType === 'video' ? (
              <VideoView
                player={player}
                style={styles.mediaImage}
                contentFit="contain"
                nativeControls
              />
            ) : (
              <Image source={{ uri: mediaUri }} style={styles.mediaImage} />
            )}
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => {
                setMediaUri(null);
                setMediaType(null);
                setMediaChanged(true);
              }}
            >
              <Text style={styles.removeMediaText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.mediaButtons}>
          <TouchableOpacity 
            style={styles.addMediaButton} 
            onPress={() => pickMedia('image')}
          >
            <Text style={styles.addMediaIcon}>📷</Text>
            <Text style={styles.addMediaText}>
              {mediaUri && mediaType === 'image' ? 'Change Photo' : 'Add Photo'}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.addMediaButton} 
            onPress={() => pickMedia('video')}
          >
            <Text style={styles.addMediaIcon}>🎥</Text>
            <Text style={styles.addMediaText}>
              {mediaUri && mediaType === 'video' ? 'Change Video' : 'Add Video'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.infoBox}>
          <Text style={styles.infoText}>
            ℹ️ Editing will update the post for all viewers
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelText: {
    fontSize: typography.sizes.md,
    color: colors.text.secondary,
  },
  title: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  saveText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.primary,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  categoriesScroll: {
    marginBottom: spacing.sm,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
    marginRight: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryEmoji: {
    fontSize: typography.sizes.md,
    marginRight: spacing.xs,
  },
  categoryLabel: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  categoryLabelSelected: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  textArea: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.border,
  },
  input: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  mediaPreview: {
    marginTop: spacing.md,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: 200,
    borderRadius: borderRadius.md,
  },
  removeMediaButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.background,
    width: 32,
    height: 32,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeMediaText: {
    fontSize: typography.sizes.lg,
    color: colors.text.primary,
  },
  mediaButtons: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  addMediaButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  addMediaIcon: {
    fontSize: typography.sizes.lg,
    marginRight: spacing.sm,
  },
  addMediaText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  infoBox: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  infoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
});
