#!/bin/bash

# Deep clean script - removes all build artifacts and caches
# Use this when you need a completely fresh build

# Parse command line arguments
PLATFORM=${1:-"all"}
KEEP_SHARED_CACHE=false

# Check for --keep-shared-cache flag in any position
for arg in "$@"; do
    if [[ "$arg" == "--keep-shared-cache" ]]; then
        KEEP_SHARED_CACHE=true
        break
    fi
done

# Remove --keep-shared-cache from positional parameters if it's the first argument
if [[ "$1" == "--keep-shared-cache" ]]; then
    PLATFORM=${2:-"all"}
fi

echo "🧹 Starting deep clean process for platform(s): $PLATFORM"

# Validate platform parameter
if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" && "$PLATFORM" != "all" ]]; then
    echo "❌ Error: Invalid platform '$PLATFORM'. Use 'ios', 'android', or 'all'"
    echo "Usage: $0 [ios|android|all] [--keep-shared-cache]"
    echo "  ios     - Clean iOS dependencies only"
    echo "  android - Clean Android dependencies only" 
    echo "  all     - Clean both platforms (default)"
    echo "  --keep-shared-cache - Skip cleaning shared caches (Metro, npm, yarn)"
    exit 1
fi

if [[ "$KEEP_SHARED_CACHE" == true ]]; then
    echo "ℹ️  Shared cache cleaning is disabled"
fi

# Make sure clean.sh is executable
chmod +x scripts/clean.sh

# Run the regular clean script first
echo "⌛ Running regular clean..."
scripts/clean.sh

# Remove shared lock files
echo "⌛ Cleaning shared dependencies..."
if [ -f "package-lock.json" ]; then
    rm -rf package-lock.json
    echo "✅ Removed package-lock.json"
else
    echo "ℹ️  package-lock.json not found"
fi

# Remove node_modules
if [ -d "node_modules" ]; then
    rm -rf node_modules
    echo "✅ Removed node_modules"
else
    echo "ℹ️  node_modules not found"
fi

# # Platform-specific cleaning
# if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
#     echo "🍎 Cleaning iOS-specific files..."
    
#     # Remove iOS lock files
#     if [ -f "ios/Podfile.lock" ]; then
#         rm -rf ios/Podfile.lock
#         echo "✅ Removed ios/Podfile.lock"
#     else
#         echo "ℹ️  ios/Podfile.lock not found"
#     fi
    
#     # Remove iOS Pods
#     if [ -d "ios/Pods" ]; then
#         rm -rf ios/Pods
#         echo "✅ Removed ios/Pods"
#     else
#         echo "ℹ️  ios/Pods not found"
#     fi
    
#     # Clean iOS build artifacts
#     if [ -d "ios/build" ]; then
#         rm -rf ios/build
#         echo "✅ Removed ios/build"
#     else
#         echo "ℹ️  ios/build not found"
#     fi
    
#     # Remove iOS bundle
#     if [ -f "ios/main.jsbundle" ]; then
#         rm -f ios/main.jsbundle
#         echo "✅ Removed iOS bundle"
#     else
#         echo "ℹ️  iOS bundle not found"
#     fi
    
#     # Clean Xcode derived data if on macOS
#     if [[ "$OSTYPE" == "darwin"* ]]; then
#         rm -rf ~/Library/Developer/Xcode/DerivedData/* 2>/dev/null && echo "✅ Cleaned Xcode DerivedData" || echo "ℹ️  Xcode DerivedData cleanup attempted"
#     fi
# else
#     echo "🍎 Skipping iOS cleanup (platform: $PLATFORM)"
# fi

# if [[ "$PLATFORM" == "android" || "$PLATFORM" == "all" ]]; then
#     echo "🤖 Cleaning Android-specific files..."
    
#     # Clean Android build artifacts
#     if [ -d "android/app/build" ]; then
#         rm -rf android/app/build
#         echo "✅ Removed android/app/build"
#     else
#         echo "ℹ️  android/app/build not found"
#     fi
    
#     if [ -d "android/build" ]; then
#         rm -rf android/build
#         echo "✅ Removed android/build"
#     else
#         echo "ℹ️  android/build not found"
#     fi
    
#     # Remove Android bundle
#     if [ -f "android/app/src/main/assets/index.android.bundle" ]; then
#         rm -f android/app/src/main/assets/index.android.bundle
#         echo "✅ Removed Android bundle"
#     else
#         echo "ℹ️  Android bundle not found"
#     fi
    
#     # Clean Gradle caches
#     cd android
#     if [ -f "./gradlew" ]; then
#         chmod +x ./gradlew
#         ./gradlew clean 2>/dev/null && echo "✅ Gradle clean completed" || echo "ℹ️  Gradle clean attempted"
#         ./gradlew cleanBuildCache 2>/dev/null && echo "✅ Gradle build cache cleaned" || echo "ℹ️  Gradle cache clean attempted"
#     fi
#     cd ..
    
#     # Remove .cxx folder if it exists
#     if [ -d "android/app/.cxx" ]; then
#         rm -rf android/app/.cxx
#         echo "✅ Removed android/app/.cxx"
#     else
#         echo "ℹ️  android/app/.cxx not found"
#     fi
# else
#     echo "🤖 Skipping Android cleanup (platform: $PLATFORM)"
# fi

# Clean Metro cache
if command -v npx >/dev/null 2>&1; then
    echo "⌛ Cleaning Metro cache..."
    npx react-native start --reset-cache --dry-run 2>/dev/null && echo "✅ Metro cache reset" || echo "ℹ️  Metro cache reset attempted"
fi

# Clean additional caches that might persist
if [[ "$KEEP_SHARED_CACHE" == false ]]; then
    echo "⌛ Cleaning additional shared caches..."


    # Clean npm cache if it exists
    if command -v npm >/dev/null 2>&1; then
        npm cache clean --force 2>/dev/null && echo "✅ NPM cache cleaned" || echo "ℹ️  NPM cache clean attempted"
    fi

    # Clean yarn cache
    if command -v yarn >/dev/null 2>&1; then
        yarn cache clean 2>/dev/null && echo "✅ Yarn cache cleaned" || echo "ℹ️  Yarn cache clean attempted"
    fi

    # Clean React Native temp files
    rm -rf /tmp/react-* 2>/dev/null && echo "✅ React Native temp files cleaned" || echo "ℹ️  React Native temp files cleanup attempted"
else
    echo "⏭️  Skipping shared cache cleaning (--keep-shared-cache enabled)"
fi

echo "✅ Deep clean completed successfully for platform: $PLATFORM!"
