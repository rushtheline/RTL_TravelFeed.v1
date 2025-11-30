# RushTheLine - Deployment Guide

## 📋 Pre-Deployment Checklist

### ✅ Development Complete
- [x] All core features implemented
- [x] Database schema finalized
- [x] RLS policies configured
- [x] Storage buckets set up
- [x] Authentication working
- [x] Real-time updates functional
- [x] UI matches design specifications

### 🔐 Security Review
- [ ] Move API keys to environment variables
- [ ] Enable email verification requirement
- [ ] Set up rate limiting
- [ ] Review RLS policies
- [ ] Configure CORS properly
- [ ] Set up API key rotation schedule
- [ ] Add content moderation rules

### 🧪 Testing
- [ ] Test authentication flow (sign up, sign in, sign out)
- [ ] Test post creation with images
- [ ] Test like/unlike functionality
- [ ] Test real-time updates
- [ ] Test category filtering
- [ ] Test XP and level calculations
- [ ] Test on iOS device/simulator
- [ ] Test on Android device/emulator
- [ ] Test on different screen sizes
- [ ] Load testing with multiple users

### 📱 App Store Preparation

#### iOS (Apple App Store)
- [ ] Create Apple Developer account ($99/year)
- [ ] Set up App Store Connect
- [ ] Create app listing
- [ ] Prepare screenshots (6.5", 5.5" displays)
- [ ] Write app description
- [ ] Set up privacy policy
- [ ] Configure app categories
- [ ] Set pricing (free with optional IAP)
- [ ] Submit for review

#### Android (Google Play Store)
- [ ] Create Google Play Console account ($25 one-time)
- [ ] Set up app listing
- [ ] Prepare screenshots (phone, tablet)
- [ ] Write app description
- [ ] Set up privacy policy
- [ ] Configure content rating
- [ ] Set pricing
- [ ] Submit for review

## 🚀 Deployment Steps

### 1. Environment Configuration

Create `.env` file (DO NOT commit to git):
```env
EXPO_PUBLIC_SUPABASE_URL=https://nifmkwvzkijysrriyars.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

Update `lib/supabase.ts`:
```typescript
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
```

### 2. Install EAS CLI

```bash
npm install -g eas-cli
eas login
```

### 3. Configure EAS Build

```bash
eas build:configure
```

This creates `eas.json`:
```json
{
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  }
}
```

### 4. Build for iOS

```bash
# Development build
eas build --platform ios --profile development

# Production build
eas build --platform ios --profile production
```

### 5. Build for Android

```bash
# Development build
eas build --platform android --profile development

# Production build
eas build --platform android --profile production
```

### 6. Submit to App Stores

```bash
# iOS
eas submit --platform ios

# Android
eas submit --platform android
```

## 🔧 Supabase Production Configuration

### 1. Database Optimization

```sql
-- Add additional indexes for production
CREATE INDEX CONCURRENTLY idx_posts_user_created 
  ON posts(user_id, created_at DESC);

CREATE INDEX CONCURRENTLY idx_posts_airport_created 
  ON posts(airport_id, created_at DESC);

-- Analyze tables for query optimization
ANALYZE posts;
ANALYZE profiles;
ANALYZE likes;
ANALYZE comments;
```

### 2. Enable Database Backups

- Go to Supabase Dashboard → Settings → Backups
- Enable automatic daily backups
- Set retention period (7-30 days recommended)

### 3. Set Up Monitoring

- Enable Supabase monitoring
- Set up alerts for:
  - High database CPU usage
  - Storage limits
  - API rate limits
  - Error rates

### 4. Configure Email Templates

- Go to Authentication → Email Templates
- Customize:
  - Confirmation email
  - Password reset email
  - Magic link email

### 5. Enable Additional Auth Providers (Optional)

```typescript
// Add to lib/supabase.ts
export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
  return { data, error };
};

export const signInWithApple = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'apple',
  });
  return { data, error };
};
```

Configure in Supabase Dashboard → Authentication → Providers

## 📊 Analytics Setup

### 1. Expo Analytics

```bash
npm install expo-analytics
```

### 2. Firebase Analytics (Optional)

```bash
npx expo install @react-native-firebase/app @react-native-firebase/analytics
```

### 3. Track Key Events

- User sign up
- Post creation
- Like/unlike
- XP earned
- Level up
- Mission completed

## 🔔 Push Notifications

### 1. Install Dependencies

```bash
npx expo install expo-notifications expo-device expo-constants
```

### 2. Configure Push Notifications

```typescript
// lib/notifications.ts
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

export async function registerForPushNotificationsAsync() {
  let token;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      alert('Failed to get push token for push notification!');
      return;
    }
    
    token = (await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId
    })).data;
  }

  return token;
}
```

### 3. Store Push Tokens

Add `push_token` column to profiles table:
```sql
ALTER TABLE profiles ADD COLUMN push_token TEXT;
```

## 🌐 Custom Domain (Optional)

### 1. Set Up Custom Domain in Supabase

- Go to Settings → Custom Domains
- Add your domain (e.g., api.rushtheline.com)
- Update DNS records

### 2. Update App Configuration

```typescript
const supabaseUrl = 'https://api.rushtheline.com';
```

## 📈 Performance Optimization

### 1. Enable Caching

```typescript
// lib/cache.ts
import AsyncStorage from '@react-native-async-storage/async-storage';

export const cacheData = async (key: string, data: any) => {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Cache error:', error);
  }
};

export const getCachedData = async (key: string) => {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Cache retrieval error:', error);
    return null;
  }
};
```

### 2. Image Optimization

```bash
npm install expo-image
```

Replace `Image` with `expo-image` for better performance:
```typescript
import { Image } from 'expo-image';
```

### 3. Lazy Loading

Implement pagination for posts:
```typescript
const [page, setPage] = useState(0);
const POSTS_PER_PAGE = 20;

const loadMorePosts = async () => {
  const offset = page * POSTS_PER_PAGE;
  // Fetch posts with offset
};
```

## 🐛 Error Tracking

### 1. Sentry Integration

```bash
npx expo install @sentry/react-native
```

```typescript
// App.tsx
import * as Sentry from '@sentry/react-native';

Sentry.init({
  dsn: 'YOUR_SENTRY_DSN',
  enableInExpoDevelopment: true,
  debug: __DEV__,
});
```

### 2. Log Critical Errors

- Authentication failures
- Post creation failures
- Image upload failures
- Database connection errors

## 📱 App Updates

### Over-The-Air (OTA) Updates

```bash
# Install EAS Update
npm install expo-updates

# Configure updates
eas update:configure

# Publish update
eas update --branch production --message "Bug fixes and improvements"
```

## 🔒 Security Best Practices

### 1. API Key Management

- Never commit API keys to git
- Use environment variables
- Rotate keys regularly
- Use different keys for dev/prod

### 2. Content Security

- Implement content moderation
- Add report/block functionality
- Filter inappropriate content
- Rate limit post creation

### 3. Data Privacy

- Implement GDPR compliance
- Add data export functionality
- Add account deletion
- Update privacy policy

## 📋 Post-Launch Checklist

- [ ] Monitor error rates
- [ ] Track user engagement
- [ ] Collect user feedback
- [ ] Monitor server costs
- [ ] Review analytics
- [ ] Plan feature updates
- [ ] Respond to app store reviews
- [ ] Update documentation

## 🆘 Rollback Plan

If issues occur after deployment:

### 1. Revert OTA Update
```bash
eas update --branch production --message "Rollback"
```

### 2. Revert Database Migration
```sql
-- Restore from backup
-- Or manually revert specific changes
```

### 3. Communicate with Users
- Post update in app
- Send push notification
- Update social media

## 📞 Support Channels

Set up support channels:
- Email: support@rushtheline.com
- In-app feedback form
- Social media (Twitter, Instagram)
- Discord/Slack community

## 🎯 Success Metrics

Track these KPIs:
- Daily Active Users (DAU)
- Monthly Active Users (MAU)
- Posts per user
- Engagement rate (likes, comments)
- Session duration
- Retention rate (Day 1, Day 7, Day 30)
- Crash-free rate (target: >99.5%)

## 🚀 Launch Strategy

### Soft Launch (Week 1-2)
- Release to beta testers
- Gather feedback
- Fix critical bugs
- Optimize performance

### Public Launch
- Submit to app stores
- Prepare marketing materials
- Create launch announcement
- Engage with early users
- Monitor closely for issues

### Post-Launch (Week 3-4)
- Analyze user behavior
- Prioritize feature requests
- Plan next iteration
- Scale infrastructure if needed

---

**Ready to launch? Let's make RushTheLine a success! ✈️**
