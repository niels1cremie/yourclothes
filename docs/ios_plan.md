# iOS Native Development Plan (SwiftUI)

This document outlines the strategy for building a native iOS version of YourClothes that mirrors the Android implementation and shares the same Supabase backend.

## 🏗️ Architecture

- **Pattern**: MVVM (Model-View-ViewModel) to match the Android structure.
- **Language**: Swift 6.0+
- **UI Framework**: SwiftUI
- **Backend SDK**: [Supabase-Swift](https://github.com/supabase-community/supabase-swift)

## 📁 Suggested Folder Structure

```
/ios/
  YourClothes/
    YourClothesApp.swift
    Data/
      SupabaseClient.swift
      Repositories/
        AuthRepository.swift
        WardrobeRepository.swift
        AIRepository.swift
        PlannerRepository.swift
        ProfileRepository.swift
      Models/
        WardrobeItem.swift
        UserProfile.swift
        PlannedOutfit.swift
    UI/
      Auth/
        AuthView.swift
        AuthViewModel.swift
      Onboarding/
        OnboardingView.swift
        OnboardingViewModel.swift
      Wardrobe/
        WardrobeView.swift
        WardrobeViewModel.swift
      Planner/
        PlannerView.swift
        PlannerViewModel.swift
      Settings/
        SettingsView.swift
        SettingsViewModel.swift
      Theme/
        AppColors.swift
        MirrorTheme.swift
    Utils/
      ImagePicker.swift
      FileUtils.swift
    Assets.xcassets
```

## 🔗 Shared Backend Integration

1.  **Auth**: Use Supabase Auth for Email/Password sign-in, consistent with Android.
2.  **Database**: Map to the same PostgreSQL tables: `profiles`, `wardrobe_items`, `planned_outfits`.
3.  **Storage**: Upload to the `wardrobe-photos` bucket.
4.  **Edge Functions**: Call `user-analyzer` and `clothing-analyzer` using the same JSON request/response models.

## 🎨 UI Consistency

- **Colors**: Use the same hex codes defined in `AppColors.kt`.
- **Flow**: Mirror the 4-step onboarding and category-based wardrobe grid.
- **Images**: Use `Nuke` or `Kingfisher` for iOS image loading, configured for high-quality display.

## 🚀 Next Steps

1.  Initialize Xcode project in `/ios`.
2.  Add Supabase-Swift dependency via Swift Package Manager.
3.  Implement `SupabaseClient` singleton.
4.  Build `AuthView` to verify backend connectivity.
