#!/bin/bash

# Clean script - removes build artifacts and temporary files
# Use this for regular cleaning during development

# Parse command line arguments
PLATFORM=${1:-"all"}

echo "🧹 Starting clean process for platform: $PLATFORM"

# Validate platform parameter
if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" && "$PLATFORM" != "all" ]]; then
    echo "❌ Error: Invalid platform '$PLATFORM'. Use 'ios', 'android', or 'all'"
    echo "Usage: $0 [ios|android|all]"
    echo "  ios     - Clean iOS build artifacts only"
    echo "  android - Clean Android build artifacts only" 
    echo "  all     - Clean both platforms (default)"
    exit 1
fi

# # iOS cleaning
# if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
#     echo "🍎 Cleaning iOS build artifacts..."
#     cd ios 
    
#     # Clean Xcode build
#     xattr -w com.apple.xcode.CreatedByBuildSystem true build 2>/dev/null && echo "✅ Set Xcode build attributes" || echo "ℹ️  Xcode build attributes not set"
#     xcodebuild clean && echo "✅ Cleaned iOS build" || echo "❌ Failed to clean iOS build"
    
#     echo "⌛ Removing any previously generated JS bundle for iOS"
#     rm main.jsbundle && echo "✅ iOS bundle removed." || echo "ℹ️  iOS bundle not found."
    
#     echo "⌛ Removing Pods..."
#     rm -rf Pods && echo "✅ Removed Pods directory" || echo "ℹ️  Pods directory not found"
#     pod deintegrate 2>/dev/null && echo "✅ Pod deintegration completed" || echo "ℹ️  Pod deintegration not needed"
#     cd ..
#     echo "✅ iOS cleaning completed"
# else
#     echo "🍎 Skipping iOS cleaning (platform: $PLATFORM)"
# fi

# # Android cleaning
# if [[ "$PLATFORM" == "android" || "$PLATFORM" == "all" ]]; then
#     echo "🤖 Cleaning Android build artifacts..."
#     cd android/app/src/main/assets
    
#     echo "⌛ Removing any previously generated JS bundle for Android"
#     rm index.android.bundle && echo "✅ Android bundle removed." || echo "ℹ️  Android bundle not found."
#     cd ../../../../
    
#     echo "⌛ Cleaning Android build..."
#     if [ -f "./gradlew" ]; then
#         chmod +x ./gradlew
#         ./gradlew clean && echo "✅ Gradle clean completed" || echo "❌ Gradle clean failed"
#     else
#         echo "❌ gradlew not found"
#     fi
    
#     rm -rf build && echo "✅ Removed build directory" || echo "ℹ️  Build directory not found"
#     rm -rf app/.cxx && echo "✅ Removed app/.cxx directory" || echo "ℹ️  app/.cxx directory not found"
#     cd ..
#     echo "✅ Android cleaning completed"
# else
#     echo "🤖 Skipping Android cleaning (platform: $PLATFORM)"
# fi

# Shared cleaning (always performed regardless of platform)
echo "⌛ Removing node modules..."
rm -rf node_modules && echo "✅ Removed node modules" || echo "ℹ️  Node modules not found"

echo "✅ Clean process completed for platform: $PLATFORM!"
echo "💡 Tip: Use scripts/cleanDeep.sh for more thorough cleaning"