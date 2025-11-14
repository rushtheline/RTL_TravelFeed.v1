import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, typography, borderRadius } from '../constants/theme';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

interface AvatarUploadProps {
  avatarUrl?: string | null;
  username?: string;
  onUploadComplete?: (url: string) => void;
}

export const AvatarUpload: React.FC<AvatarUploadProps> = ({
  avatarUrl,
  username,
  onUploadComplete,
}) => {
  const { profile, refreshProfile } = useAuth();
  const [uploading, setUploading] = useState(false);

  const pickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please grant camera roll permissions to upload a profile picture.'
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        await uploadAvatar(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const uploadAvatar = async (uri: string) => {
    try {
      setUploading(true);

      // Get file extension
      const fileExt = uri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${profile?.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Map file extension to proper MIME type
      const mimeTypes: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'webp': 'image/webp',
      };
      const contentType = mimeTypes[fileExt] || 'image/jpeg';

      // Convert to ArrayBuffer for Supabase
      const response = await fetch(uri);
      const arrayBuffer = await response.arrayBuffer();

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, arrayBuffer, {
          contentType: contentType,
          upsert: true,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      const publicUrl = urlData.publicUrl;

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', profile?.id);

      if (updateError) throw updateError;

      // Refresh profile
      await refreshProfile();

      Alert.alert('Success', 'Profile picture updated!');
      onUploadComplete?.(publicUrl);
    } catch (error) {
      console.error('Error uploading avatar:', error);
      Alert.alert('Error', 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <View style={styles.avatarRing}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <LinearGradient
              colors={colors.gradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.avatar, styles.avatarPlaceholder]}
            >
              <Text style={styles.avatarText}>
                {username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </LinearGradient>
          )}
        </View>

        <TouchableOpacity
          style={styles.cameraButton}
          onPress={pickImage}
          disabled={uploading}
          activeOpacity={0.9}
        >
          <LinearGradient
            colors={colors.gradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.cameraButtonGradient}
          >
            {uploading ? (
              <ActivityIndicator size="small" color={colors.text.primary} />
            ) : (
              <Camera size={16} color={colors.text.primary} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  avatarContainer: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  avatarRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 4,
    borderColor: colors.primary,
    backgroundColor: colors.input,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
  },
  avatarPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colors.text.primary,
  },
  cameraButton: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.background,
  },
  cameraButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
