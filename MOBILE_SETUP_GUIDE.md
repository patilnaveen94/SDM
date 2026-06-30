# 📱 SDM Solutions - Mobile App Setup & Testing Guide

## 🚀 Quick Start

### Step 1: Install Dependencies
```powershell
cd mobile
npm install
```

This will install Expo and all required React Native dependencies.

### Step 2: Start the Development Server
```powershell
npm start
```

Or use the expo command directly:
```powershell
npx expo start
```

This will:
- Start the Expo development server
- Display a QR code in your terminal
- Open Expo DevTools in your browser

---

## 📲 Testing Options

### ✅ **Option 1: Test on Your Physical Phone** (RECOMMENDED - Easiest & No Setup)

#### For Android:
1. Install **Expo Go** app from Google Play Store: https://play.google.com/store/apps/details?id=host.exp.exponent
2. Open the Expo Go app
3. Tap "Scan QR Code"
4. Point your camera at the QR code shown in the terminal
5. The app will load and run on your phone!

#### For iOS (iPhone):
1. Install **Expo Go** app from App Store: https://apps.apple.com/app/expo-go/id982107779
2. Open your Camera app (not Expo Go)
3. Point it at the QR code in the terminal
4. Tap the notification that appears
5. It will open in Expo Go automatically

**Benefits:**
- ✅ No emulator setup needed
- ✅ Test on real hardware with actual performance
- ✅ Test gestures, scrolling, and animations naturally
- ✅ Works on both Android and iOS

---

### Option 2: Test in Web Browser (Quick Preview)

Press `w` in the Expo terminal or run:
```powershell
npm run web
```

**Note:** This runs the React Native app in a web browser. While convenient for quick UI checks, it doesn't provide a true native mobile experience.

---

### Option 3: Android Emulator (Requires Setup)

#### Prerequisites:
1. Install **Android Studio**: https://developer.android.com/studio
2. During installation, make sure to install:
   - Android SDK
   - Android Virtual Device (AVD)
3. Create an Android Virtual Device (AVD):
   - Open Android Studio
   - Go to: Tools → Device Manager
   - Click "Create Device"
   - Select a phone (e.g., Pixel 6)
   - Download and select a system image (e.g., Android 13)
   - Click Finish

#### Running on Emulator:
1. Start your Android emulator from Android Studio
2. In the Expo terminal, press `a` or run:
```powershell
npm run android
```

---

### Option 4: iOS Simulator (Mac Only)

#### Prerequisites:
1. Install **Xcode** from Mac App Store
2. Install Command Line Tools:
```bash
xcode-select --install
```

#### Running on Simulator:
Press `i` in the Expo terminal or run:
```bash
npm run ios
```

**Note:** iOS Simulator only works on macOS with Xcode installed.

---

## 🎯 Recommended Testing Approach

**For Windows Users:**
1. **Best:** Use Expo Go on your physical Android phone (easiest, no setup)
2. **Alternative:** Set up Android emulator if you want to test without a phone

**For Mac Users:**
1. **Best:** Use Expo Go on your physical iPhone (easiest)
2. **Alternative:** Use iOS Simulator (requires Xcode)

---

## 🔧 Troubleshooting

### "Unable to connect to Metro"
- Make sure your phone and computer are on the same Wi-Fi network
- Check if your firewall is blocking the connection
- Try running: `npx expo start --tunnel`

### "Module not found" errors
```powershell
cd mobile
rm -rf node_modules package-lock.json
npm install
```

### QR Code not scanning
- Try pressing `t` in the terminal to toggle to Tunnel mode
- Or manually type the connection URL shown in the terminal into Expo Go

### Port already in use
```powershell
npx expo start --port 8082
```

---

## 📊 What You'll See

The app includes:
- **Home Screen:** Cinematic video background with hero section
- **Portfolio Screen:** Filterable image/video gallery
- **Booking Screen:** Event photography and equipment rental booking
- **Academy Screen:** Training courses and inquiry form
- **About Screen:** Founder biography with scroll-zoom animation

---

## 🎨 Testing the Scroll-Zoom Effect

The "Meet the Visionary" section in the About screen uses a custom scroll-zoom animation similar to high-end cinematic websites. Test it by:

1. Navigate to the About/Profile section
2. Scroll slowly through the founder's biography
3. Watch the background image zoom and scale smoothly as you scroll
4. The text should reveal progressively with the animation

---

## 📝 Development Tips

### Hot Reload
- Shake your physical device to open the developer menu
- Or press `r` in the terminal to reload
- Or press `m` in the terminal to toggle menu

### Debug Mode
- Press `j` in the terminal to open Chrome DevTools for debugging

### Clear Cache
```powershell
npx expo start --clear
```

---

## 🚀 Building for Production (Future)

### Android APK/AAB:
```powershell
npm run build:android
```

### iOS IPA (Mac only):
```powershell
eas build --platform ios
```

**Note:** Building requires an Expo account. Sign up at https://expo.dev

---

## ✨ Next Steps

1. Install dependencies: `cd mobile && npm install`
2. Start the server: `npm start`
3. Install Expo Go on your phone
4. Scan the QR code
5. Test all screens and interactions!

Need help? Check the official Expo documentation: https://docs.expo.dev
