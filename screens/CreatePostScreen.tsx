import React, { useState, useEffect } from 'react';
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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PostCategory } from '../types/database.types';
import { MentionInput } from '../components/MentionInput';
import { Brain, CameraIcon, ChevronDown, DoorClosed, Hamburger, Lock, MapPin, MessageCircle, SquareParking, Timer, VideoIcon, X } from 'lucide-react-native';

interface CreatePostScreenProps {
  onClose: () => void;
  airportId: string;
  terminalId?: string;
}

export const CreatePostScreen: React.FC<CreatePostScreenProps> = ({
  onClose,
  airportId,
  terminalId,
}) => {
  const { profile } = useAuth();
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('general');
  const [locationText, setLocationText] = useState('');
  const [mediaUri, setMediaUri] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video' | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Location selection state
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<any>(null);
  const [selectedLocation, setSelectedLocation] = useState<string>('');
  const [customLocation, setCustomLocation] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);

  const categories: { key: PostCategory; label: string; emoji: React.ReactNode }[] = [
    { key: 'helpful_tip', label: 'Helpful Tip', emoji: <Brain color={colors.text.secondary} size={18}/> },
    { key: 'tsa_update', label: 'TSA Update', emoji: <Lock color={colors.text.secondary} size={18}/> },
    { key: 'gate_change', label: 'Gate Change', emoji: <DoorClosed color={colors.text.secondary} size={18}/> },
    { key: 'wait_time', label: 'Wait Time', emoji: <Timer color={colors.text.secondary} size={18}/> },
    { key: 'food', label: 'Food', emoji: <Hamburger color={colors.text.secondary} size={18}/> },
    { key: 'parking', label: 'Parking', emoji: <SquareParking color={colors.text.secondary} size={18}/> },
    { key: 'general', label: 'General', emoji: <MessageCircle color={colors.text.secondary} size={18}/> },
  ];

  // Fetch terminals on mount
  useEffect(() => {
    fetchTerminals();
  }, [airportId]);

  const fetchTerminals = async () => {
    try {
      const { data, error } = await supabase
        .from('terminals')
        .select('*')
        .eq('airport_id', airportId)
        .order('code');

      if (error) throw error;
      setTerminals(data || []);
      
      // Set default terminal if provided
      if (terminalId && data) {
        const terminal = data.find(t => t.id === terminalId);
        if (terminal) {
          setSelectedTerminal(terminal);
        }
      }
    } catch (error) {
      console.error('Error fetching terminals:', error);
    }
  };

  const handleSelectLocation = (location: string) => {
    if (location === 'custom') {
      setShowCustomInput(true);
      setSelectedLocation('');
    } else {
      setSelectedLocation(location);
      setShowCustomInput(false);
      setCustomLocation('');
      
      // Build location text
      const terminalText = selectedTerminal ? `${selectedTerminal.name}` : '';
      setLocationText(`${terminalText}${location ? `, ${location}` : ''}`);
      setShowLocationModal(false);
    }
  };

  const handleCustomLocationSubmit = () => {
    if (customLocation.trim()) {
      const terminalText = selectedTerminal ? `${selectedTerminal.name}` : '';
      setLocationText(`${terminalText}, ${customLocation.trim()}`);
      setSelectedLocation(customLocation.trim());
      setShowLocationModal(false);
      setShowCustomInput(false);
    }
  };

  const commonLocations = [
    { label: 'TSA Security', value: 'TSA Security' },
    { label: 'Baggage Claim', value: 'Baggage Claim' },
    { label: 'Food Court', value: 'Food Court' },
    { label: 'Restrooms', value: 'Restrooms' },
    { label: 'Gate Area', value: 'Gate Area' },
    { label: 'Lounge', value: 'Lounge' },
    { label: 'Shops', value: 'Shops' },
    { label: 'Custom Location', value: 'custom' },
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
      videoMaxDuration: 60, // 60 seconds max for videos
    });

    if (!result.canceled) {
      setMediaUri(result.assets[0].uri);
      setMediaType(type);
    }
  };

  const uploadMedia = async (uri: string): Promise<string | null> => {
    try {
      // For React Native, we need to use FormData with the file URI
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${profile?.id}/${Date.now()}.${fileExt}`;
      
      // Map file extensions to proper MIME types
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

      // Use arraybuffer for React Native compatibility
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

    if (!locationText.trim()) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    setLoading(true);
    try {
      let mediaUrl = null;
      if (mediaUri) {
        mediaUrl = await uploadMedia(mediaUri);
      }

      const { error } = await supabase.from('posts').insert({
        user_id: profile?.id,
        airport_id: airportId,
        terminal_id: terminalId || null,
        category: selectedCategory,
        content: content.trim(),
        media_url: mediaUrl,
        media_type: mediaUrl ? mediaType : null,
        location_text: locationText.trim() || null,
      });

      if (error) throw error;

      Alert.alert('Success', 'Post created successfully!');
      onClose();
    } catch (error: any) {
      console.error('Error creating post:', error);
      Alert.alert('Error', error.message || 'Failed to create post');
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
        <Text style={styles.title}>Create Post</Text>
        <TouchableOpacity onPress={handleSubmit} disabled={loading}>
          {loading ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <Text style={styles.postText}>Post</Text>
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

        <Text style={styles.label}>
          Location <Text style={styles.required}>*</Text>
        </Text>
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setShowLocationModal(true)}
        >
          <MapPin size={20} color={colors.text.secondary} />
          <Text style={[styles.locationButtonText, !locationText && styles.locationPlaceholder]}>
            {locationText || 'Select terminal and location'}
          </Text>
          <ChevronDown size={20} color={colors.text.secondary} />
        </TouchableOpacity>

        {mediaUri && (
          <View style={styles.mediaPreview}>
            {mediaType === 'video' ? (
              <Video
                source={{ uri: mediaUri }}
                style={styles.mediaImage}
                useNativeControls
                resizeMode={'contain' as any}
                isLooping
              />
            ) : (
              <Image source={{ uri: mediaUri }} style={styles.mediaImage} />
            )}
            <TouchableOpacity
              style={styles.removeMediaButton}
              onPress={() => {
                setMediaUri(null);
                setMediaType(null);
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
            <CameraIcon size={20} color={colors.text.secondary} />
            <Text style={styles.addMediaText}>Add Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.addMediaButton} 
            onPress={() => pickMedia('video')}
          >
            <VideoIcon size={20} color={colors.text.secondary} />
            <Text style={styles.addMediaText}>Add Video</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Location Selection Modal */}
      <Modal
        visible={showLocationModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowLocationModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Location</Text>
              <TouchableOpacity onPress={() => setShowLocationModal(false)}>
                <X size={24} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Terminal Selection */}
              <Text style={styles.modalSectionTitle}>Terminal</Text>
              <View style={styles.terminalGrid}>
                {terminals.map((terminal) => (
                  <TouchableOpacity
                    key={terminal.id}
                    style={[
                      styles.terminalChip,
                      selectedTerminal?.id === terminal.id && styles.terminalChipSelected,
                    ]}
                    onPress={() => setSelectedTerminal(terminal)}
                  >
                    <Text
                      style={[
                        styles.terminalChipText,
                        selectedTerminal?.id === terminal.id && styles.terminalChipTextSelected,
                      ]}
                    >
                      {terminal.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Location Selection */}
              {selectedTerminal && (
                <>
                  <Text style={styles.modalSectionTitle}>Specific Location</Text>
                  {commonLocations.map((loc) => (
                    <TouchableOpacity
                      key={loc.value}
                      style={styles.locationItem}
                      onPress={() => handleSelectLocation(loc.value)}
                    >
                      <Text style={styles.locationItemText}>{loc.label}</Text>
                    </TouchableOpacity>
                  ))}

                  {showCustomInput && (
                    <View style={styles.customInputContainer}>
                      <TextInput
                        style={styles.customInput}
                        placeholder="Enter custom location (e.g., Gate B12, Starbucks)"
                        placeholderTextColor={colors.text.muted}
                        value={customLocation}
                        onChangeText={setCustomLocation}
                        autoFocus
                      />
                      <TouchableOpacity
                        style={styles.customSubmitButton}
                        onPress={handleCustomLocationSubmit}
                      >
                        <Text style={styles.customSubmitText}>Done</Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  postText: {
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
    borderRadius: borderRadius.sm,
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
    paddingLeft: spacing.sm,
  },
  xpInfo: {
    backgroundColor: colors.card,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  xpInfoText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  required: {
    color: colors.error,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  locationButtonText: {
    flex: 1,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  locationPlaceholder: {
    color: colors.text.muted,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  modalBody: {
    padding: spacing.lg,
  },
  modalSectionTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  terminalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  terminalChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  terminalChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  terminalChipText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.secondary,
  },
  terminalChipTextSelected: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  locationItem: {
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  locationItemText: {
    fontSize: typography.sizes.md,
    color: colors.text.primary,
  },
  customInputContainer: {
    marginTop: spacing.md,
    gap: spacing.sm,
  },
  customInput: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  customSubmitButton: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  customSubmitText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
});
