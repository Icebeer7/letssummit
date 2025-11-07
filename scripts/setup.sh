#!/bin/bash

# Enhanced setup script with logging and error handling
set -e

# Parse command line arguments
PLATFORM=${1:-"all"}

echo "🚀 Starting project setup for platform: $PLATFORM"

# Function to calculate and display elapsed time
show_elapsed_time() {
    local start_time=$1
    local tag=$2
    local end_time=$(date +%s)
    local elapsed=$((end_time - start_time))
    local minutes=$((elapsed / 60))
    local seconds=$((elapsed % 60))
    echo "⏱️  ${tag}: Elapsed time: ${minutes}m ${seconds}s"
}

start_time=$(date +%s)
# Validate platform parameter
if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" && "$PLATFORM" != "all" ]]; then
    echo "❌ Error: Invalid platform '$PLATFORM'. Use 'ios', 'android', or 'all'"
    echo "Usage: $0 [ios|android|all]"
    echo "  ios     - Setup iOS dependencies only"
    echo "  android - Setup Android dependencies only" 
    echo "  all     - Setup both platforms (default)"
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Authenticate with AWS SDK CodeArtifact
echo "🔐 Authenticating with AWS SDK CodeArtifact..."
./scripts/sdkAuth.sh && echo "✅ SDK authentication completed" || {
    echo "❌ SDK authentication failed"
    exit 1
}

# Install Dependencies
echo "⌛ Installing yarn dependencies..."
yarn install && echo "✅ Installed yarn dependencies" || {
    echo "❌ Yarn install failed"
    exit 1
}

# iOS setup
if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
    echo "🍎 Setting up iOS dependencies..."
    cd ios
    
    # Check if Bundler is available
    if command -v bundle >/dev/null 2>&1; then
        echo "⌛ Attempting bundle exec pod install..."
        if bundle exec pod install --repo-update 2>/dev/null; then
            echo "✅ Installed Pods via bundle exec with repo update"
        elif bundle exec pod install 2>/dev/null; then
            echo "✅ Installed Pods via bundle exec without repo update"
        else
            echo "⚠️  Bundle exec pod install failed, installing Ruby gems first..."
            bundle install && echo "✅ Installed Ruby gems" || {
                echo "❌ Bundle install failed"
                exit 1
            }
            
            echo "⌛ Installing Pods after bundle install..."
            if bundle exec pod install --repo-update; then
                echo "✅ Installed Pods via bundle exec with repo update"
            elif bundle exec pod install; then
                echo "✅ Installed Pods via bundle exec without repo update"
            else
                echo "❌ Pod install failed via bundle exec"
                exit 1
            fi
        fi
    else
        echo "❌ Bundler not found. Bundler is required for iOS setup."
        exit 1
    fi
    cd ..
else
    echo "ℹ️  Skipping iOS setup (platform: $PLATFORM)"
fi

# Android setup
if [[ "$PLATFORM" == "android" || "$PLATFORM" == "all" ]]; then
    echo "🤖 Setting up Android dependencies..."
    cd android
    
    # Check if gradlew exists and is executable
    if [ -f "./gradlew" ]; then
        chmod +x ./gradlew
        echo "⌛ Downloading Gradle dependencies..."
        ./gradlew --version && echo "✅ Gradle setup completed" || {
            echo "❌ Gradle setup failed"
            exit 1
        }
    else
        echo "⚠️  gradlew not found, skipping Gradle setup"
    fi
    cd ..
else
    echo "ℹ️  Skipping Android setup (platform: $PLATFORM)"
fi

echo "✅ Project setup completed successfully for platform: $PLATFORM!"

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
    echo "💡 Tip: Use \"yarn ios\" to start iOS development"
fi

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "all" ]]; then
    echo "💡 Tip: Use \"yarn android\" to start Android development"
fi

show_elapsed_time $start_time "Project setup"