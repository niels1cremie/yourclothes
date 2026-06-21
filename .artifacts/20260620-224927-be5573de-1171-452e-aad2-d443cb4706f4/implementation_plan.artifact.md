# Architecture Improvement & New Features Implementation Plan

This plan outlines the transformation of "yourclothes" into a robust, feature-rich native Android application with improved state management, professional navigation, and new AI-powered capabilities.

## User Review Required

> [!IMPORTANT]
> - **Navigation Change**: Moving from `remember { mutableStateOf }` tab switching to `Compose Navigation` for better deep linking and state persistence.
> - **AI Functions**: The plan assumes the `clothing-analyzer` and `outfit-generator` Edge Functions are deployed in Supabase.
> - **Camera Permission**: Adding `Camera` support for the Clothing Scanner will trigger a permission request on first use.

## Proposed Changes

### Core Architecture & Navigation
Establish a professional foundation with structured navigation and shared state management.

#### [NEW] [Screen.kt](file:///android/app/src/main/java/com/yourclothes/app/ui/navigation/Screen.kt)
- Define all app routes using a sealed class or `Serializable` objects (modern Compose Navigation).

#### [NEW] [AppNavigation.kt](file:///android/app/src/main/java/com/yourclothes/app/ui/navigation/AppNavigation.kt)
- Central `NavHost` implementation handling transitions between Auth, Onboarding, and Main App.

#### [MainActivity.kt](file:///android/app/src/main/java/com/yourclothes/app/MainActivity.kt)
- Refactor to use the new `AppNavigation` and clean up the `MainContainer`.

---

### New Features - AI & Scanner
Implementing high-priority native features for wardrobe management and styling.

#### [NEW] [ClothingScannerScreen.kt](file:///android/app/src/main/java/com/yourclothes/app/ui/scanner/ClothingScannerScreen.kt)
- Interface for camera/gallery selection.
- Integration with `WardrobeViewModel` for upload and AI analysis.

#### [NEW] [OutfitGeneratorScreen.kt](file:///android/app/src/main/java/com/yourclothes/app/ui/outfit/OutfitGeneratorScreen.kt)
- Form for user criteria (occasion, weather, style).
- Display of AI-generated outfits with "Save to Planner" option.

#### [NEW] [InsightsScreen.kt](file:///android/app/src/main/java/com/yourclothes/app/ui/insights/InsightsScreen.kt)
- Usage statistics (most worn items, color distribution).
- AI recommendations based on user profile and wardrobe content.

---

### UX & UI Improvements
Enhancing existing screens with more professional controls and robust error handling.

#### [WardrobeScreen.kt](file:///android/app/src/main/java/com/yourclothes/app/ui/wardrobe/WardrobeScreen.kt)
- Add Search bar and Filter chips (Category, Color, Season).
- Implement Grid/List toggle for item display.

#### [NEW] [ProfileScreen.kt](file:///android/app/src/main/java/com/yourclothes/app/ui/profile/ProfileScreen.kt)
- Full-featured profile editor for personal details and AI-detected attributes (Body Shape, etc.).

#### [AIRepository.kt](file:///android/app/src/main/java/com/yourclothes/app/data/AIRepository.kt)
- Add `generateOutfit` method to call the `outfit-generator` Edge Function.

---

### Infrastructure
Updating dependencies and configurations for new features.

#### [build.gradle](file:///android/app/build.gradle)
- Add `androidx.navigation:navigation-compose`.
- Add `androidx.lifecycle:lifecycle-viewmodel-compose`.

## Verification Plan

### Automated Tests
- Run Gradle sync to verify dependency integrity.
- `gradlew assembleDebug` to ensure compilation.

### Manual Verification
- **Auth Flow**: Verify login redirect to Wardrobe or Onboarding.
- **Scanner**: Test photo upload from gallery and observe AI analysis result.
- **Planner/Outfit**: Verify outfit generation returns data and can be viewed.
- **Search/Filter**: Test real-time filtering in the wardrobe screen.
