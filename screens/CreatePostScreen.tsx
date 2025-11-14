import React, { useState, useEffect, useMemo } from 'react';
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
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Video } from 'expo-av';
import * as ImagePicker from 'expo-image-picker';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { PostCategory } from '../types/database.types';
import { MentionInput } from '../components/MentionInput';
import { CameraIcon, ChevronDown, Hamburger, Lock, MapPin, MessageCircle, SquareParking, Timer, X } from 'lucide-react-native';

type LocationOption = {
  label: string;
  value: string;
  scope: 'airport' | 'terminal';
  categories: PostCategory[];
  terminals?: string[];
  disabled?: boolean;
  meta?: string;
};

type MediaItem = {
  id: string;
  uri: string;
  type: 'image' | 'video';
  uploading?: boolean;
  progress?: number;
};

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
  const insets = useSafeAreaInsets();
  const { profile } = useAuth();
  const CHARACTER_LIMIT = 280;
  const [content, setContent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PostCategory>('general');
  const [locationText, setLocationText] = useState('');
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [visibilityScope, setVisibilityScope] = useState<'airport' | 'terminal' | 'gate'>('terminal');
  const [locationToast, setLocationToast] = useState<string | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [terminals, setTerminals] = useState<any[]>([]);
  const [selectedTerminal, setSelectedTerminal] = useState<any>(null);
  const [selectedLocationId, setSelectedLocationId] = useState<string>('');
  const characterProgress = Math.min(content.length / CHARACTER_LIMIT, 1);
  const charCountColor =
    characterProgress > 0.95
      ? colors.error
      : characterProgress > 0.75
      ? '#F59E0B'
      : colors.text.secondary;

  useEffect(() => {
    if (!locationToast) return;
    const timeout = setTimeout(() => setLocationToast(null), 2500);
    return () => clearTimeout(timeout);
  }, [locationToast]);

  useEffect(() => {
    if (selectedCategory === 'parking') {
      setVisibilityScope('airport');
    } else if (visibilityScope === 'airport') {
      setVisibilityScope('terminal');
    }

    if (selectedCategory !== 'wait_time' && visibilityScope === 'gate') {
      setVisibilityScope('terminal');
    }

    if (!categoryRequiresTerminal(selectedCategory)) {
      setLocationText('');
      setSelectedLocationId('');
    }
  }, [selectedCategory]);

  const categoryRequiresTerminal = (category: PostCategory) => {
    return ['wait_time', 'food'].includes(category);
  };

  const buildLocationOptions = (): LocationOption[] => {
    const baseOptions: LocationOption[] = [
      {
        label: 'TSA PreCheck',
        value: 'TSA PreCheck',
        scope: 'terminal',
        categories: ['tsa_update'],
      },
      {
        label: 'TSA Standard',
        value: 'TSA Standard',
        scope: 'terminal',
        categories: ['tsa_update'],
      },
      {
        label: 'TSA CLEAR',
        value: 'TSA CLEAR',
        scope: 'terminal',
        categories: ['tsa_update'],
      },
      {
        label: 'Food Court',
        value: 'Food Court',
        scope: 'terminal',
        categories: ['food', 'wait_time', 'general'],
      },
      {
        label: 'Restrooms',
        value: 'Restrooms',
        scope: 'terminal',
        categories: ['wait_time', 'general'],
      },
      {
        label: 'Coffee Stand',
        value: 'Coffee Stand',
        scope: 'terminal',
        categories: ['food', 'wait_time', 'general'],
      },
      {
        label: 'Economy Parking',
        value: 'Economy Parking',
        scope: 'airport',
        categories: ['parking'],
      },
      {
        label: 'Deck Parking',
        value: 'Deck Parking',
        scope: 'airport',
        categories: ['parking'],
      },
    ];

    if (selectedTerminal?.code) {
      const terminalCode = selectedTerminal.code.toUpperCase();
      const gates = Array.from({ length: 12 }).map((_, index) => {
        const gateNumber = String(index + 1).padStart(2, '0');
        return `${terminalCode}${gateNumber}`;
      });

      gates.forEach((gate) => {
        baseOptions.push({
          label: `Gate ${gate}`,
          value: `Gate ${gate}`,
          scope: 'terminal',
          categories: ['wait_time', 'general'],
          terminals: [selectedTerminal.id],
        });
      });
    }

    return baseOptions;
  };

  const locationOptions = useMemo(() => {
    const options = buildLocationOptions().map((option) => {
      const requiresTerminal = option.scope === 'terminal';
      const terminalMismatch =
        requiresTerminal &&
        option.terminals &&
        selectedTerminal &&
        !option.terminals.includes(selectedTerminal.id);

      const disabledNoTerminal = requiresTerminal && !selectedTerminal;
      const disabledMismatch = terminalMismatch;
      const disabledScope =
        categoryRequiresTerminal(selectedCategory) && option.scope === 'airport';

      const disabled = disabledNoTerminal || disabledMismatch || disabledScope;

      let meta: string | undefined;
      if (disabledNoTerminal) {
        meta = 'Select a terminal first.';
      } else if (disabledMismatch) {
        meta = selectedTerminal
          ? `Not in ${selectedTerminal.name}.`
          : 'Not in this terminal.';
      } else if (disabledScope) {
        meta = 'Unavailable for this category.';
      }

      return {
        ...option,
        disabled,
        meta,
      };
    });

    return options.filter((option) =>
      option.categories.includes(selectedCategory) || option.categories.includes('general')
    );
  }, [
    selectedCategory,
    selectedTerminal,
  ]);

  const categories: { key: PostCategory; label: string; emoji: React.ReactNode }[] = [
    { key: 'general', label: 'General', emoji: <MessageCircle color={colors.text.secondary} size={18} /> },
    { key: 'tsa_update', label: 'TSA Update', emoji: <Lock color={colors.text.secondary} size={18} /> },
    { key: 'wait_time', label: 'Wait Time', emoji: <Timer color={colors.text.secondary} size={18} /> },
    { key: 'food', label: 'Food', emoji: <Hamburger color={colors.text.secondary} size={18} /> },
    { key: 'parking', label: 'Parking', emoji: <SquareParking color={colors.text.secondary} size={18} /> },
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

  const handleSelectLocation = (option: LocationOption) => {
    if (option.disabled) {
      setLocationToast(option.meta || 'Location not available for this terminal.');
      return;
    }

    const terminalText =
      option.scope === 'terminal' && selectedTerminal ? selectedTerminal.name : '';
    const newLocation =
      option.scope === 'terminal'
        ? `${terminalText}${terminalText ? ' • ' : ''}${option.label}`
        : option.label;

    setSelectedLocationId(option.value);
    setLocationText(newLocation);
      setShowLocationModal(false);
  };

  const handleTerminalSelect = (terminal: any) => {
    setSelectedTerminal(terminal);
    if (selectedCategory === 'parking') {
      setVisibilityScope('airport');
    } else if (visibilityScope === 'airport') {
      setVisibilityScope('terminal');
    }

    if (locationText && terminal && !locationText.includes(terminal.name)) {
      setLocationText('');
      setSelectedLocationId('');
      setLocationToast(`Location cleared. Pick a spot in ${terminal.name}.`);
    }
  };

  const visibilityOptions: { id: 'airport' | 'terminal' | 'gate'; label: string }[] = [
    { id: 'airport', label: 'Airport-wide' },
    { id: 'terminal', label: 'Terminal-only' },
    { id: 'gate', label: 'Gate-only' },
  ];

  const renderLocationModal = () => (
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
            <Text style={styles.modalSectionTitle}>Terminal</Text>
            <View style={styles.terminalGrid}>
              {terminals.map((terminal) => {
                const isSelected = selectedTerminal?.id === terminal.id;
                return (
                  <TouchableOpacity
                    key={terminal.id}
                    style={[styles.terminalChip, isSelected && styles.terminalChipSelected]}
                    onPress={() => handleTerminalSelect(terminal)}
                  >
                    <Text
                      style={[
                        styles.terminalChipText,
                        isSelected && styles.terminalChipTextSelected,
                      ]}
                    >
                      {terminal.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={[styles.modalSectionTitle, styles.locationListTitle]}>Locations</Text>
            {locationOptions.map((option) => {
              const isSelected = selectedLocationId === option.value;
              return (
                <TouchableOpacity
                  key={option.label}
                  style={[
                    styles.locationItem,
                    isSelected && styles.locationItemSelected,
                    option.disabled && styles.locationItemDisabled,
                  ]}
                  disabled={option.disabled}
                  onPress={() => handleSelectLocation(option)}
                >
                  <View>
                    <Text
                      style={[
                        styles.locationItemText,
                        isSelected && styles.locationItemTextSelected,
                        option.disabled && styles.locationItemTextDisabled,
                      ]}
                    >
                      {option.label}
                    </Text>
                    <Text style={styles.locationScopeLabel}>
                      {option.scope === 'airport' ? 'Airport-wide' : 'Terminal specific'}
                    </Text>
                  </View>
                  {option.disabled && (
                    <Text style={styles.locationDisabledHint}>Unavailable</Text>
                  )}
                </TouchableOpacity>
              );
            })}

          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  const launchMediaPicker = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: false,
      allowsEditing: false,
      quality: 0.8,
      videoMaxDuration: 60,
    });

    if (!result.canceled) {
      const asset = result.assets[0];
      if (!asset) return;
      const mediaType: 'image' | 'video' =
        asset.type === 'video' ? 'video' : 'image';
      const newItem = {
        id: `${asset.assetId || asset.uri}-${Date.now()}`,
        uri: asset.uri,
        type: mediaType,
      };
      setMediaItems([newItem]);
    }
  };

  const handleRemoveMedia = (id: string) => {
    setMediaItems((prev) => prev.filter((item) => item.id !== id));
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
      
      const isVideoExt = ['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(fileExt);
      const mimeType = mimeTypeMap[fileExt] || (isVideoExt ? 'video/mp4' : 'image/jpeg');

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
    const finalContent = content.trim();
    if (!finalContent && mediaItems.length === 0) {
      Alert.alert('Add more details', 'Add media or a short caption before posting.');
      return;
    }

    if (categoryRequiresTerminal(selectedCategory) && !locationText.trim()) {
      Alert.alert('Error', 'Please select a location');
      return;
    }

    if (categoryRequiresTerminal(selectedCategory) && !selectedTerminal) {
      Alert.alert('Select terminal', 'Choose a terminal to add location-specific details.');
      return;
    }

    setLoading(true);
    try {
      let uploadedMediaUrl: string | null = null;
      let uploadedMediaType: 'image' | 'video' | null = null;
      if (mediaItems.length > 0) {
        const firstItem = mediaItems[0];
        uploadedMediaUrl = await uploadMedia(firstItem.uri);
        uploadedMediaType = firstItem.type;
      }

      const { error } = await supabase.from('posts').insert({
        user_id: profile?.id,
        airport_id: airportId,
        terminal_id: terminalId || null,
        category: selectedCategory,
        content: finalContent,
        media_url: uploadedMediaUrl,
        media_type: uploadedMediaUrl ? uploadedMediaType : null,
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

  const hasMedia = mediaItems.length > 0;
  const topTitle = 'Create Post';

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.topBar}>
        <TouchableOpacity style={styles.iconButton} onPress={onClose}>
          <X size={20} color={colors.text.secondary} />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{topTitle}</Text>
        <TouchableOpacity
          style={styles.draftButton}
          onPress={() => Alert.alert('Drafts coming soon')}
        >
          <Text style={styles.draftText}>Draft</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.card}>
          <View style={styles.captionField}>
            <MentionInput
              style={styles.captionInput}
              placeholder="Share an update with travelers... (use @username to mention)"
              value={content}
              onChangeText={setContent}
              multiline
              maxLength={CHARACTER_LIMIT}
            />
            <TouchableOpacity
              style={styles.captionMediaButton}
              onPress={launchMediaPicker}
            >
              <CameraIcon size={18} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <View style={styles.captionMeta}>
            <Text style={[styles.charCount, { color: charCountColor }]}>
              {content.length}/{CHARACTER_LIMIT}
            </Text>
          </View>
          <Text style={styles.helperText}>
            Keep it concise—posts perform best under 280 characters.
          </Text>
        </View>
        {hasMedia && (
          <View style={styles.card}>
            {mediaItems.map((item) => (
              <View style={styles.mediaThumbWrapper} key={item.id}>
                {item.type === 'video' ? (
                  <Video
                    source={{ uri: item.uri }}
                    style={styles.mediaThumb}
                    resizeMode={'cover' as any}
                    shouldPlay={false}
                  />
                ) : (
                  <Image source={{ uri: item.uri }} style={styles.mediaThumb} />
                )}
                <TouchableOpacity
                  style={styles.mediaThumbRemove}
                  onPress={() => handleRemoveMedia(item.id)}
                >
                  <Text style={styles.removeMediaText}>✕</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.card}>
          <Text style={styles.cardLabel}>Category</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryScroll}
        >
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              return (
            <TouchableOpacity
              key={cat.key}
              style={[
                styles.categoryChip,
                    isSelected ? styles.categoryChipSelected : styles.categoryChipDefault,
              ]}
              onPress={() => setSelectedCategory(cat.key)}
                  activeOpacity={0.9}
            >
              <Text
                style={[
                      styles.categoryChipText,
                      isSelected && styles.categoryChipTextSelected,
                ]}
              >
                    {cat.emoji} {cat.label}
              </Text>
            </TouchableOpacity>
              );
            })}
        </ScrollView>
        </View>

        {(selectedCategory === 'wait_time' || selectedCategory === 'food') && (
          <View style={styles.card}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.cardLabel}>Location</Text>
              <View style={styles.requiredChip}>
                <Text style={styles.requiredChipText}>Required</Text>
              </View>
            </View>
            {locationToast && <Text style={styles.toastText}>{locationToast}</Text>}
        <TouchableOpacity
          style={styles.locationButton}
          onPress={() => setShowLocationModal(true)}
        >
          <MapPin size={20} color={colors.text.secondary} />
              <Text
                style={[
                  styles.locationButtonText,
                  !locationText && styles.locationPlaceholder,
                ]}
              >
                {locationText || 'Select terminal location'}
          </Text>
              <ChevronDown
                size={20}
                color={colors.text.secondary}
                style={[styles.locationChevron, showLocationModal && styles.locationChevronOpen]}
              />
            </TouchableOpacity>

            <View style={styles.scopeRow}>
              {visibilityOptions.map((option) => {
                const disabled =
                  option.id === 'airport' ||
                  (option.id === 'gate' && selectedCategory !== 'wait_time');
                const isActive = visibilityScope === option.id;
                return (
          <TouchableOpacity 
                    key={option.id}
                    style={[
                      styles.scopeChip,
                      isActive && styles.scopeChipActive,
                      disabled && styles.scopeChipDisabled,
                    ]}
                    onPress={() => !disabled && setVisibilityScope(option.id)}
                    disabled={disabled}
                  >
                    <Text
                      style={[
                        styles.scopeChipText,
                        isActive && styles.scopeChipTextActive,
                        disabled && styles.scopeChipTextDisabled,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
              </View>
          </View>
        )}
      </ScrollView>

      <View
        style={[
          styles.bottomBar,
          {
            paddingBottom: spacing.lg + insets.bottom,
          },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.primaryAction,
            (loading ||
              (categoryRequiresTerminal(selectedCategory) && !locationText.trim())) &&
              styles.primaryActionDisabled,
          ]}
          onPress={handleSubmit}
          disabled={loading || (categoryRequiresTerminal(selectedCategory) && !locationText.trim())}
        >
          {loading ? (
            <ActivityIndicator color={colors.text.primary} />
          ) : (
            <Text style={styles.primaryActionText}>Post</Text>
          )}
        </TouchableOpacity>
          </View>

      {renderLocationModal()}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  topBarTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  draftButton: {
    minWidth: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  draftText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxxxl,
    paddingTop: spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 8,
  },
  cardLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  captionField: {
    position: 'relative',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  charCount: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
  },
  helperText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  categoryScroll: {
    gap: spacing.sm,
  },
  categoryChip: {
    borderRadius: borderRadius.lg,
    marginRight: spacing.sm,
    overflow: 'hidden',
  },
  categoryChipDefault: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
  },
  categoryChipSelected: {
    backgroundColor: 'rgba(166,20,112,0.25)',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  categoryChipText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: 'rgba(255,255,255,0.85)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  categoryChipTextSelected: {
    color: colors.text.primary,
  },
  mediaCarousel: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  mediaThumbWrapper: {
    width: 160,
    height: 200,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    marginRight: spacing.sm,
  },
  mediaThumb: {
    width: '100%',
    height: '100%',
    borderRadius: borderRadius.lg,
  },
  mediaThumbRemove: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 28,
    height: 28,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(15,15,20,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.borderSecondary,
  },
  removeMediaText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  mediaAddButton: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  mediaAddTitle: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
  },
  mediaAddSubtitle: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
    textAlign: 'center',
  },
  addMoreMediaButton: {
    marginTop: spacing.md,
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  addMoreMediaText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  requiredChip: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  requiredChipText: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
    fontWeight: typography.weights.medium,
  },
  toastText: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  locationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.input,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  locationButtonText: {
    flex: 1,
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  locationPlaceholder: {
    color: colors.text.muted,
  },
  locationChevron: {
    transform: [{ rotate: '0deg' }],
  },
  locationChevronOpen: {
    transform: [{ rotate: '180deg' }],
  },
  scopeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  scopeChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  scopeChipActive: {
    backgroundColor: 'rgba(166,20,112,0.25)',
    borderColor: colors.primary,
  },
  scopeChipDisabled: {
    opacity: 0.4,
  },
  scopeChipText: {
    fontSize: typography.sizes.xs,
    color: 'rgba(255,255,255,0.75)',
  },
  scopeChipTextActive: {
    color: colors.text.primary,
  },
  scopeChipTextDisabled: {
    color: colors.text.muted,
  },
  captionInput: {
    backgroundColor: colors.input,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    paddingRight: spacing.xxxl,
    fontSize: typography.sizes.md,
    color: colors.text.primary,
    minHeight: 120,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    textAlignVertical: 'top',
  },
  captionMediaButton: {
    position: 'absolute',
    right: spacing.sm,
    top: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: borderRadius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 6,
  },
  captionMeta: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
  },
  secondaryAction: {
    flex: 1,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  secondaryActionText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  primaryAction: {
    flex: 1.2,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  primaryActionDisabled: {
    opacity: 0.6,
  },
  primaryActionText: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.card,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '80%',
    paddingBottom: spacing.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.borderSecondary,
  },
  modalTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
    color: colors.text.primary,
  },
  modalBody: {
    paddingHorizontal: spacing.lg,
  },
  modalSectionTitle: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colors.text.primary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  locationListTitle: {
    marginTop: spacing.lg,
  },
  terminalGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  terminalChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  terminalChipSelected: {
    backgroundColor: 'rgba(166,20,112,0.25)',
    borderColor: colors.primary,
  },
  terminalChipText: {
    fontSize: typography.sizes.sm,
    color: colors.text.secondary,
  },
  terminalChipTextSelected: {
    color: colors.text.primary,
    fontWeight: typography.weights.semibold,
  },
  locationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.md,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.borderSecondary,
    backgroundColor: colors.input,
    marginBottom: spacing.sm,
  },
  locationItemSelected: {
    borderColor: colors.primary,
  },
  locationItemDisabled: {
    opacity: 0.5,
  },
  locationItemText: {
    fontSize: typography.sizes.sm,
    color: colors.text.primary,
  },
  locationItemTextSelected: {
    fontWeight: typography.weights.semibold,
  },
  locationItemTextDisabled: {
    color: colors.text.muted,
  },
  locationScopeLabel: {
    fontSize: typography.sizes.xs,
    color: colors.text.tertiary,
  },
  locationDisabledHint: {
    fontSize: typography.sizes.xs,
    color: colors.text.secondary,
  },
});
