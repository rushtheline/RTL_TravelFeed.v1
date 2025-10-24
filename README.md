# RushTheLine - Live Airport Feed

A React Native/Expo mobile app for real-time airport social feeds with gamification features.

## Features

- 🔐 **Authentication**: Email/password authentication with Supabase Auth
- 📱 **Social Feed**: Real-time posts from fellow travelers at your airport/terminal
- ✈️ **Airport & Terminal Filtering**: View posts specific to your location
- 🎮 **Gamification**: XP system, levels, badges, and missions
- 📸 **Media Sharing**: Upload photos and videos to posts
- 💬 **Engagement**: Like and comment on posts
- 🏷️ **Categories**: Filter posts by type (TSA updates, food, parking, etc.)
- 🔔 **Real-time Updates**: Live feed updates using Supabase Realtime
- 👥 **User Roles**: Regular users, frequent flyers, and staff

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Realtime)
- **Language**: TypeScript
- **State Management**: React Context API
- **UI**: Custom components with dark theme

## Prerequisites

- Node.js 18+ and npm
- Expo CLI
- iOS Simulator (Mac) or Android Emulator
- Supabase account

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Supabase Setup**:
   - The Supabase project is already configured (ID: `nifmkwvzkijysrriyars`)
   - Database schema, RLS policies, and storage buckets are set up
   - API keys are configured in `lib/supabase.ts`

3. **Run the app**:
   ```bash
   # iOS
   npm run ios

   # Android
   npm run android

   # Web
   npm run web
   ```

## Project Structure

```
rush-the-line/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── PostCard.tsx
│   ├── CategoryFilter.tsx
│   ├── CreatePostInput.tsx
│   └── MissionCard.tsx
├── screens/            # Screen components
│   ├── FeedScreen.tsx
│   └── AuthScreen.tsx
├── contexts/           # React contexts
│   └── AuthContext.tsx
├── lib/               # Utilities and configs
│   └── supabase.ts
├── types/             # TypeScript types
│   └── database.types.ts
├── constants/         # App constants
│   └── theme.ts
└── App.tsx           # Root component
```

## Database Schema

### Tables

- **profiles**: User profiles with XP, level, badges, and roles
- **airports**: Airport information (ATL, LAX, ORD, etc.)
- **terminals**: Terminal information linked to airports
- **gates**: Gate information linked to terminals
- **posts**: User posts with category, media, and location
- **comments**: Comments on posts
- **likes**: Post likes
- **notifications**: User notifications
- **missions**: Gamification missions
- **user_missions**: User progress on missions
- **ads**: Advertisement content

### User Roles

- **regular**: Standard user
- **frequent_flyer**: Experienced traveler with perks
- **staff**: Airport staff with special privileges

### Post Categories

- Helpful Tip (25 XP)
- TSA Update (20 XP)
- Gate Change (20 XP)
- Wait Time (15 XP)
- Food (10 XP)
- Parking (5 XP)
- General (5 XP)

## Features Implementation Status

### ✅ Completed

- [x] Supabase database schema with RLS policies
- [x] User authentication (sign up, sign in, sign out)
- [x] Profile management with XP and levels
- [x] Post feed with real-time updates
- [x] Like/unlike posts
- [x] Category filtering
- [x] Airport/terminal filtering
- [x] Mission system
- [x] XP rewards for posts
- [x] Storage buckets for media uploads
- [x] Dark theme UI matching design

### 🚧 To Be Implemented

- [ ] Create post screen with media upload
- [ ] Comment functionality
- [ ] Airport/terminal selection modal
- [ ] AI summary feature
- [ ] User profile screen
- [ ] Notifications screen
- [ ] Push notifications
- [ ] Social authentication (Google, Apple)
- [ ] Ad display system
- [ ] Search functionality
- [ ] Report/moderation features

## Environment Variables

The app uses hardcoded Supabase credentials for development. For production, move these to environment variables:

```env
EXPO_PUBLIC_SUPABASE_URL=https://nifmkwvzkijysrriyars.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Development

### Running Tests

```bash
npm test
```

### Building for Production

```bash
# iOS
eas build --platform ios

# Android
eas build --platform android
```

## Supabase Configuration

The following have been set up in Supabase:

1. **Authentication**: Email/password provider enabled
2. **Database**: Complete schema with RLS policies
3. **Storage**: Two buckets configured:
   - `avatars`: User profile pictures (5MB limit)
   - `post-media`: Post images/videos (10MB limit)
4. **Realtime**: Enabled for posts table
5. **Functions**: Database functions for XP calculation and post queries

## Sample Data

The database includes sample data:
- 5 major US airports (ATL, LAX, ORD, DFW, JFK)
- Terminals for ATL (B, C, D, E, F)
- Sample gates for Terminal B
- One active mission: "Share 2 helpful tips today"

## Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
