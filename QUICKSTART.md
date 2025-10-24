# RushTheLine - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Start the Development Server

```bash
npm start
```

Then press:
- `i` for iOS Simulator
- `a` for Android Emulator  
- `w` for Web Browser

### 2. Create Your Account

1. When the app loads, you'll see the authentication screen
2. Tap "Don't have an account? Sign Up"
3. Enter:
   - Username (e.g., "travelpro")
   - Email address
   - Password (min 6 characters)
4. Tap "Sign Up"
5. Check your email for verification (or skip for testing)

### 3. Start Using the App

Once logged in, you'll see:
- **Your Profile Header**: Shows your level, XP, and current location (ATL - Terminal B)
- **Active Mission**: "Share 2 helpful tips today" for +40 XP
- **Category Filters**: Filter posts by type (All, My Terminal, TSA, Food, Parking)
- **Create Post**: Tap the input area to create your first post
- **Feed**: Scroll through posts from other travelers

## 🎮 Key Features to Try

### Create Your First Post
1. Tap the "Share something helpful..." input area
2. Select a category (Helpful Tip gives the most XP!)
3. Write your content
4. Optionally add a photo and location
5. Tap "Post" to share

### Earn XP & Level Up
- **Helpful Tip**: 25 XP
- **TSA Update**: 20 XP
- **Gate Change**: 20 XP
- **Wait Time**: 15 XP
- **Food**: 10 XP
- **General**: 5 XP

Every 100 XP = 1 Level Up! 🎉

### Interact with Posts
- **Like**: Tap the heart icon
- **Comment**: Tap the comment icon (coming soon)
- **View Details**: See location, XP earned, and engagement stats

### Filter Your Feed
- **All**: See all posts from the airport
- **My Terminal**: Only posts from Terminal B
- **Category Filters**: TSA, Food, Parking, etc.

## 📱 Testing Tips

### Test User Roles
The app supports 3 user roles:
- **Regular User**: Default role
- **Frequent Flyer**: Shows 🔥 badge
- **Staff**: Airport staff with special privileges

To change your role, update it directly in Supabase:
1. Go to Supabase Dashboard → Table Editor → profiles
2. Find your user
3. Change the `role` field

### Test Different Airports
Currently set to ATL (Atlanta). To add more airports or switch locations, you can:
1. Use the "Change Airport" button (UI placeholder)
2. Or update the database with more airport/terminal data

### Test Real-time Updates
1. Open the app in two different browsers/simulators
2. Create a post in one
3. Watch it appear instantly in the other! ⚡

## 🐛 Troubleshooting

### "Failed to load posts"
- Check your internet connection
- Verify Supabase project is active
- Check browser console for errors

### "Authentication failed"
- Ensure email format is valid
- Password must be at least 6 characters
- Check Supabase Auth settings

### Images not uploading
- Check storage bucket permissions in Supabase
- Verify file size is under 10MB
- Ensure image format is supported (JPEG, PNG, WebP)

### App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

## 🎨 UI Matches Design

The app implements the dark theme design from your Figma mockups:
- ✅ Dark navy background (#1A1A2E)
- ✅ Pink/magenta primary color (#E91E63)
- ✅ User badges and levels
- ✅ Category tags with colors
- ✅ XP rewards display
- ✅ Post cards with engagement stats
- ✅ Mission progress bars

## 📊 Database Overview

Your Supabase database includes:
- **5 airports**: ATL, LAX, ORD, DFW, JFK
- **5 terminals** at ATL: B, C, D, E, F
- **Sample gates** at Terminal B
- **1 active mission**: Share 2 helpful tips
- **Storage buckets**: avatars (5MB), post-media (10MB)

## 🔐 Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only edit their own content
- ✅ Public read access for posts and profiles
- ✅ Secure media upload with user-specific folders
- ✅ Automatic profile creation on signup

## 🚀 Next Steps

Ready to enhance the app? Consider adding:
1. **Comments System**: Full comment threads on posts
2. **Notifications**: Push notifications for likes, comments, mentions
3. **User Profiles**: View other users' profiles and post history
4. **Airport Selection**: Modal to choose different airports
5. **AI Summary**: Summarize recent airport updates
6. **Search**: Find specific posts or users
7. **Direct Messages**: Chat with other travelers
8. **Flight Tracking**: Link posts to specific flights

## 📞 Need Help?

- Check the main README.md for detailed documentation
- Review Supabase logs for backend errors
- Check React Native debugger for frontend issues
- Verify all environment variables are set correctly

Happy coding! ✈️
