# YourClothes - Native Mobile App

YourClothes is a native mobile application for wardrobe management, outfit planning, and AI-powered styling advice. This project uses Jetpack Compose for Android and will support native SwiftUI for iOS, sharing a powerful Supabase backend.

## 📱 Platforms

- **Android**: Native Jetpack Compose + Kotlin (Located in `/android`)
- **iOS**: Native SwiftUI (Coming Soon - Planned in `/ios`)

## 🚀 Key Features

- **Digital Wardrobe**: Manage your clothes with lossless image quality and automatic categorization.
- **AI Styling**: Get personalized advice on body shape, skin undertone, and color seasons.
- **Outfit Planner**: Plan your outfits for the week with weather-aware suggestions.
- **AI Analysis**: Automatically analyze your clothing items for category, style, and fabric.
- **Pure Native**: No web views or hybrid wrappers—optimized for performance and native feel.

## 🛠️ Tech Stack

- **Frontend**: Jetpack Compose (Android), SwiftUI (Planned iOS)
- **Backend**: Supabase (Auth, PostgreSQL, Storage, Edge Functions)
- **Networking**: Ktor 3.0
- **Image Loading**: Coil 3 (Configured for original quality)
- **Dependency Injection**: Manual / ViewModel-based

## 🏁 Getting Started (Android)

1.  **Open in Android Studio**: Open the `/android` folder directly in Android Studio.
2.  **Configure Supabase**:
    -   Ensure `android/local.properties` contains your `SUPABASE_URL` and `SUPABASE_KEY`.
    -   You can find these in your Supabase Dashboard under **Settings > API**.
3.  **Supabase Setup**:
    -   Tables: `profiles`, `wardrobe_items`, `planned_outfits`.
    -   Storage Bucket: `wardrobe-photos`.
    -   Edge Functions: `user-analyzer`, `clothing-analyzer`.
4.  **Build and Run**: Select your emulator or device and click "Run".

## 📂 Project Structure

- `/android`: Core native Android project.
- `/supabase`: Backend configuration, migrations, and edge functions.
- `/docs`: Detailed documentation and design decisions.
- `/ios` (Planned): Core native iOS project.

---
*Created with focus on stability, performance, and native user experience.*
