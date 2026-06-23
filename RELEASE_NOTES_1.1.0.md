# YourClothes v1.1.0 Release Notes

## Overview
This update focuses on performance optimization, memory stability, and better error handling to provide a smoother user experience.

---

## What's New?

### 🔧 Performance & Memory Optimization
- **Out-of-Memory (OOM) Prevention**:
  - Added automatic image downsampling when loading large photos
  - Optimized memory cache size in Coil (from 25% to 15%)
  - Reduced maximum image resolution to 1200px for display
  - Compressed uploaded photos to 85% quality and max 1920x1920 to save storage
- **Efficient Image Loading Pipeline**:
  - New `CoilConfig` utility for consistent image configuration
  - New `FileUtils.readAndDownsampleUri` for memory-safe photo handling

### 🛡️ Error Handling Improvements
- **Outfit Saving Feedback**:
  - New `Saving` state when storing outfits
  - Clear `SaveSuccess` message when completed
  - Proper error messages instead of silent failures
- **All ViewModels**: Improved error propagation to UI

---

## Bug Fixes
- Fixed potential OOM crashes when adding large wardrobe items
- Fixed silent save failures in Outfit Generator
- Improved loading states across the app

---

## Build & Version Info
- Version: 1.1.0
- Version Code: 2
- Compile SDK: 35
- Min SDK: 26
- Target SDK: 35

---

## Installation Instructions
1. Download the APK file
2. Enable "Unknown Sources" in Android Settings (if needed)
3. Tap the APK to install
4. Open YourClothes and enjoy!

---

## Contributors
Thanks to all contributors who made this release possible!
