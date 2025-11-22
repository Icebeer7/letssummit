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

# Install Dependencies
echo "⌛ Installing yarn dependencies..."
yarn install && echo "✅ Installed yarn dependencies" || {
    echo "❌ Yarn install failed"
    exit 1
}

echo "✅ Project setup completed successfully for platform: $PLATFORM!"

if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
    echo "💡 Tip: Use \"yarn ios\" to start iOS development"
fi

if [[ "$PLATFORM" == "android" || "$PLATFORM" == "all" ]]; then
    echo "💡 Tip: Use \"yarn android\" to start Android development"
fi

show_elapsed_time $start_time "Project setup"