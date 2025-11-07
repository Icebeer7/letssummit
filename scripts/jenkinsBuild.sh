#!/bin/bash

# Enable strict error handling
set -e

# Logging functions
log_info() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [INFO] $1"
}

log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [ERROR] $1" >&2
}

log_success() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [SUCCESS] $1"
}

log_warning() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [WARNING] $1"
}

# Parse command line arguments
PLATFORM=$1
ARTIFACTS_PATH_PARAM=""
NO_CACHE_RESTORE=""
NO_CACHE_SAVE=""
CACHE_NODE_MODULES_ONLY=""
CLEAN_OLD_ARTIFACTS=""

# Process all arguments to handle flags in any order
if [ $# -gt 0 ]; then
    shift # Remove the platform argument only if there are arguments
fi
while [[ $# -gt 0 ]]; do
    case $1 in
        --no-cache-restore)
            NO_CACHE_RESTORE="--no-cache-restore"
            shift
            ;;
        --no-cache-save)
            NO_CACHE_SAVE="--no-cache-save"
            shift
            ;;
        --cache-node-modules-only)
            CACHE_NODE_MODULES_ONLY="--cache-node-modules-only"
            shift
            ;;
        --artifacts-path)
            ARTIFACTS_PATH_PARAM="$2"
            shift 2
            ;;
        --artifacts-path=*)
            ARTIFACTS_PATH_PARAM="${1#*=}"
            shift
            ;;
        *)
            echo "❌ Unknown parameter: $1"
            exit 1
            ;;
    esac
done

# Special commands will be processed after argument parsing and function definitions

# Check if platform parameter is provided
if [ -z "$PLATFORM" ]; then
    echo "❌ Error: Platform parameter is required"
    echo "Usage: $0 <ios|android|all|clean-cache|clean-artifacts|cache-info> [OPTIONS]"
    echo "Build Commands:"
    echo "  ios                          - Build iOS app only"
    echo "  android                      - Build Android app only" 
    echo "  all                          - Build both platforms"
    echo "Maintenance Commands:"
    echo "  clean-cache                  - Clean all build caches"
    echo "  clean-artifacts              - Clean old build artifacts (keep latest 10)"
    echo "  cache-info                   - Show cache sizes and manage if needed"
    echo "Build Options:"
    echo "  --no-cache-restore           - Skip cache restoration (fresh build)"
    echo "  --no-cache-save              - Skip cache saving (don't update cache after build)"
    echo "  --cache-node-modules-only    - Cache only node_modules, skip iOS Pods and Android build cache"
    echo "  --artifacts-path <path>      - Custom path for build artifacts (default: ~/builds/master/react)"
    exit 1
fi

# Global variables
BUILD_START_TIME=$(date +%s)
CACHE_BASE_DIR="../REACT_APPLICATION_CONFIGS/build_cache"
NODE_MODULES_CACHE="$CACHE_BASE_DIR/node_modules"
NODE_MODULES_PRE_CODEGEN_CACHE="$CACHE_BASE_DIR/node_modules_pre_codegen"
YARN_CACHE_DIR="$CACHE_BASE_DIR/yarn_cache"
GRADLE_CACHE_DIR="$CACHE_BASE_DIR/gradle_cache"
ANDROID_BUILD_CACHE="$CACHE_BASE_DIR/android_build"
PODS_CACHE_DIR="$CACHE_BASE_DIR/pods_cache"
RETRY_COUNT=0
MAX_RETRIES=1

# Artifacts path will be set in main_build_process function

# Function to calculate and display elapsed time
show_elapsed_time() {
    local start_time=$1
    local tag=$2
    local end_time=$(date +%s)
    local elapsed=$((end_time - start_time))
    local minutes=$((elapsed / 60))
    local seconds=$((elapsed % 60))
    log_info "⏱️ ${tag}: Elapsed time: ${minutes}m ${seconds}s"
}

# Function to check if cache exists and is valid
is_cache_valid() {
    local cache_dir=$1
    
    if [ ! -d "$cache_dir" ]; then
        return 1
    fi
    
    # Cache is valid if directory exists
    return 0
}

# Function to save node_modules cache at optimal time (before codegen bloat)
save_pre_codegen_cache() {
    if [[ "$NO_CACHE_SAVE" == "--no-cache-save" ]]; then
        log_info "🚫 Skipping pre-codegen cache save (--no-cache-save flag set)"
        return 0
    fi
    
    local step_start_time=$(date +%s)
    log_info "💾 Saving pre-codegen node_modules cache (optimized size)..."
    
    if [ -d "node_modules" ]; then
        local current_size=$(du -sh node_modules | cut -f1)
        log_info "📦 Current node_modules size: $current_size"
        
        # Check if yarn.lock changed to decide if we should update cache
        local should_update=true
        if [ -f "$NODE_MODULES_PRE_CODEGEN_CACHE/../yarn.lock" ] && [ -f "yarn.lock" ]; then
            if cmp -s "yarn.lock" "$NODE_MODULES_PRE_CODEGEN_CACHE/../yarn.lock"; then
                log_info "📦 yarn.lock unchanged, skipping node_modules cache update"
                should_update=false
            else
                log_info "📦 yarn.lock changed, updating node_modules cache"
            fi
        else
            log_info "📦 No previous yarn.lock found, creating new cache"
        fi
        
        if [ "$should_update" = true ]; then
            mkdir -p "$CACHE_BASE_DIR"
            rm -rf "$NODE_MODULES_PRE_CODEGEN_CACHE"
            
            log_info "📦 Copying node_modules to pre-codegen cache..."
            cp -R ./node_modules "$NODE_MODULES_PRE_CODEGEN_CACHE" && log_success "✅ Pre-codegen node_modules cached" || log_warning "❌ Failed to cache node_modules"
            
            # Save yarn.lock for future comparison
            cp yarn.lock "$NODE_MODULES_PRE_CODEGEN_CACHE/../yarn.lock" 2>/dev/null && log_success "✅ yarn.lock cached for comparison" || log_warning "❌ Failed to cache yarn.lock"
            
            local cached_size=$(du -sh "$NODE_MODULES_PRE_CODEGEN_CACHE" | cut -f1)
            log_success "✅ Pre-codegen cache saved - Size: $cached_size"
        fi
    else
        log_warning "⚠️  node_modules directory not found"
    fi
    
    show_elapsed_time $step_start_time "Pre-codegen cache save"
}

# Function to save post-build cache (iOS pods, gradle cache, etc.)
save_post_build_cache() {
    if [[ "$NO_CACHE_SAVE" == "--no-cache-save" ]]; then
        log_info "🚫 Skipping post-build cache save (--no-cache-save flag set)"
        return 0
    fi
    
    if [[ "$CACHE_NODE_MODULES_ONLY" == "--cache-node-modules-only" ]]; then
        log_info "📦 Skipping post-build cache save (--cache-node-modules-only flag set)"
        log_info "💡 Only node_modules cache is being managed in this build"
        return 0
    fi
    
    local step_start_time=$(date +%s)
    log_info "💾 Saving post-build cache..."
    
    # Save iOS pods (platform-specific)
    if [[ ("$PLATFORM" == "ios" || "$PLATFORM" == "all") ]]; then
        if [ -d "ios/Pods" ]; then
            # Check if Podfile.lock changed
            local should_update_pods=true
            if [ -f "$PODS_CACHE_DIR/Podfile.lock" ] && [ -f "ios/Podfile.lock" ]; then
                if cmp -s "ios/Podfile.lock" "$PODS_CACHE_DIR/Podfile.lock"; then
                    log_info "🍎 Podfile.lock unchanged, skipping Pods cache update"
                    should_update_pods=false
                else
                    log_info "🍎 Podfile.lock changed, updating Pods cache"
                fi
            else
                log_info "🍎 No previous Podfile.lock found, creating new Pods cache"
            fi
            
            if [ "$should_update_pods" = true ]; then
                log_info "🍎 Saving iOS Pods to cache..."
                rm -rf "$PODS_CACHE_DIR"
                mkdir -p "$PODS_CACHE_DIR"
                cp -R ./ios/Pods "$PODS_CACHE_DIR/" && log_success "✅ Pods cached" || log_warning "❌ Failed to cache Pods"
                cp ./ios/Podfile.lock "$PODS_CACHE_DIR/" 2>/dev/null && log_success "✅ Podfile.lock cached" || log_warning "❌ Failed to cache Podfile.lock"
                
                local pods_size=$(du -sh "$PODS_CACHE_DIR" | cut -f1)
                log_success "✅ Pods cache saved - Size: $pods_size"
            fi
        else
            log_warning "⚠️  iOS Pods directory not found"
        fi
    else
        log_info "🍎 Skipping iOS Pods cache (platform: $PLATFORM)"
    fi
    
    # Save Android build cache (platform-specific)
    if [[ ("$PLATFORM" == "android" || "$PLATFORM" == "all") ]]; then
        local should_cache_android=false
        
        # Check if we have build artifacts to cache
        if [ -d "android/build" ] || [ -d "android/app/build" ]; then
            should_cache_android=true
            log_info "🤖 Saving Android build cache..."
            rm -rf "$ANDROID_BUILD_CACHE"
            mkdir -p "$ANDROID_BUILD_CACHE"
            
            # Cache project-level build folder (if exists)
            if [ -d "android/build" ]; then
                cp -R ./android/build "$ANDROID_BUILD_CACHE/" && log_success "✅ Android project build cached" || log_warning "❌ Failed to cache Android project build"
            fi
            
            # Cache app-level build folder (if exists) - but exclude final APK to save space
            if [ -d "android/app/build" ]; then
                # Create a copy excluding the final outputs to save space but keep incremental build state
                mkdir -p "$ANDROID_BUILD_CACHE/app_build"
                rsync -av --exclude='outputs/apk' --exclude='outputs/bundle' ./android/app/build/ "$ANDROID_BUILD_CACHE/app_build/" && log_success "✅ Android app build cached (excluding APK)" || log_warning "❌ Failed to cache Android app build"
            fi
            
            local android_cache_size=$(du -sh "$ANDROID_BUILD_CACHE" | cut -f1)
            log_success "✅ Android build cache saved - Size: $android_cache_size"
        else
            log_warning "⚠️  No Android build folders found to cache"
        fi
    else
        log_info "🤖 Skipping Android build cache (platform: $PLATFORM)"
    fi
    
    # Note: Yarn and Gradle caches are maintained automatically via environment variables
    # BUILD_ARTIFACTS are not cached as they don't improve build speed
    
    show_elapsed_time $step_start_time
}

# Function to restore cache
restore_cache() {
    # Check if cache restoration should be skipped
    if [[ "$NO_CACHE_RESTORE" == "--no-cache-restore" ]]; then
        log_info "🚫 Skipping cache restoration (--no-cache-restore flag set)"
        # Still set up cache directories for this build
        mkdir -p "$CACHE_BASE_DIR"
        mkdir -p "$YARN_CACHE_DIR"
        mkdir -p "$GRADLE_CACHE_DIR"
        export YARN_CACHE_FOLDER="$YARN_CACHE_DIR"
        export GRADLE_USER_HOME="$GRADLE_CACHE_DIR"
        log_info "🔧 Cache directories configured for fresh build"
        return 0
    fi
    
    local step_start_time=$(date +%s)
    log_info "🔄 Restoring build cache..."
    
    # Create cache directories if they don't exist
    mkdir -p "$CACHE_BASE_DIR"
    mkdir -p "$YARN_CACHE_DIR"
    mkdir -p "$GRADLE_CACHE_DIR"
    
    # Restore node_modules cache (use pre-codegen optimized cache)
    if is_cache_valid "$NODE_MODULES_PRE_CODEGEN_CACHE"; then
        log_info "📦 Restoring optimized pre-codegen node_modules cache..."
        cp -R "$NODE_MODULES_PRE_CODEGEN_CACHE" ./node_modules 2>/dev/null && log_success "✅ Pre-codegen node_modules cache restored" || log_warning "❌ Failed to restore node_modules cache"
        
        local restored_size=$(du -sh node_modules | cut -f1)
        log_success "✅ Restored node_modules size: $restored_size"
    elif is_cache_valid "$NODE_MODULES_CACHE"; then
        log_info "📦 Restoring legacy node_modules cache..."
        cp -R "$NODE_MODULES_CACHE" ./node_modules 2>/dev/null && log_success "✅ Legacy node_modules cache restored" || log_warning "❌ Failed to restore node_modules cache"
        
        local restored_size=$(du -sh node_modules | cut -f1)
        log_warning "⚠️  Using legacy cache (may be bloated) - Size: $restored_size"
    else
        log_info "📦 No node_modules cache found"
    fi
    
    # Restore yarn cache
    if is_cache_valid "$YARN_CACHE_DIR"; then
        log_info "🧶 Restoring yarn cache..."
        export YARN_CACHE_FOLDER="$YARN_CACHE_DIR"
        log_success "✅ Yarn cache directory set to: $YARN_CACHE_DIR"
    else
        log_info "🧶 No yarn cache found, will create new one"
        export YARN_CACHE_FOLDER="$YARN_CACHE_DIR"
    fi
    
    # Restore gradle cache
    if is_cache_valid "$GRADLE_CACHE_DIR"; then
        log_info "🐘 Restoring gradle cache..."
        export GRADLE_USER_HOME="$GRADLE_CACHE_DIR"
        log_success "✅ Gradle cache directory set to: $GRADLE_CACHE_DIR"
    else
        log_info "🐘 No gradle cache found, will create new one"
        export GRADLE_USER_HOME="$GRADLE_CACHE_DIR"
    fi
    
    # Restore pods cache (iOS)
    if [[ ("$PLATFORM" == "ios" || "$PLATFORM" == "all") ]] && is_cache_valid "$PODS_CACHE_DIR"; then
        if [[ "$CACHE_NODE_MODULES_ONLY" == "--cache-node-modules-only" ]]; then
            log_info "🍎 Skipping iOS Pods cache restoration (--cache-node-modules-only flag set)"
        else
            log_info "🍎 Restoring iOS Pods cache..."
            cp -R "$PODS_CACHE_DIR/Pods" ./ios/ 2>/dev/null && log_success "✅ Pods cache restored" || log_warning "❌ Failed to restore Pods cache"
            cp "$PODS_CACHE_DIR/Podfile.lock" ./ios/ 2>/dev/null && log_success "✅ Podfile.lock restored" || log_warning "❌ Failed to restore Podfile.lock"
        fi
    else
        if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
            if [[ "$CACHE_NODE_MODULES_ONLY" == "--cache-node-modules-only" ]]; then
                log_info "🍎 Skipping iOS Pods cache (--cache-node-modules-only flag set)"
            else
                log_info "🍎 No iOS Pods cache found"
            fi
        else
            log_info "🍎 Skipping iOS Pods cache (platform: $PLATFORM)"
        fi
    fi
    
    # Restore Android build cache
    if [[ ("$PLATFORM" == "android" || "$PLATFORM" == "all") ]] && is_cache_valid "$ANDROID_BUILD_CACHE"; then
        if [[ "$CACHE_NODE_MODULES_ONLY" == "--cache-node-modules-only" ]]; then
            log_info "🤖 Skipping Android build cache restoration (--cache-node-modules-only flag set)"
        else
            log_info "🤖 Restoring Android build cache..."
            
            # Restore project-level build folder
            if [ -d "$ANDROID_BUILD_CACHE/build" ]; then
                cp -R "$ANDROID_BUILD_CACHE/build" ./android/ 2>/dev/null && log_success "✅ Android project build cache restored" || log_warning "❌ Failed to restore Android project build cache"
            fi
            
            # Restore app-level build folder
            if [ -d "$ANDROID_BUILD_CACHE/app_build" ]; then
                cp -R "$ANDROID_BUILD_CACHE/app_build" ./android/app/build 2>/dev/null && log_success "✅ Android app build cache restored" || log_warning "❌ Failed to restore Android app build cache"
            fi
            
            local cache_size=$(du -sh "$ANDROID_BUILD_CACHE" | cut -f1)
            log_success "✅ Android build cache restored - Size: $cache_size"
        fi
    else
        if [[ "$PLATFORM" == "android" || "$PLATFORM" == "all" ]]; then
            if [[ "$CACHE_NODE_MODULES_ONLY" == "--cache-node-modules-only" ]]; then
                log_info "🤖 Skipping Android build cache (--cache-node-modules-only flag set)"
            else
                log_info "🤖 No Android build cache found"
            fi
        else
            log_info "🤖 Skipping Android build cache (platform: $PLATFORM)"
        fi
    fi
    
    show_elapsed_time $step_start_time "Cache restore"
}

# Function to clean all caches
clean_all_caches() {
    log_info "🧹 Cleaning all caches..."
    rm -rf "$CACHE_BASE_DIR"
    log_success "✅ All caches cleaned"
}

# Function to check and manage cache sizes
manage_cache_sizes() {
    local step_start_time=$(date +%s)
    log_info "📊 Checking cache sizes and managing storage..."
    
    # Define size limits (in MB)
    local MAX_TOTAL_CACHE_SIZE_MB=10240  # 10GB total cache limit
    local MAX_SINGLE_CACHE_SIZE_MB=3072  # 3GB per cache type limit
    
    if [ ! -d "$CACHE_BASE_DIR" ]; then
        log_info "📦 No cache directory found"
        return 0
    fi
    
    # Check total cache size
    local total_cache_size_kb=$(du -sk "$CACHE_BASE_DIR" 2>/dev/null | cut -f1)
    local total_cache_size_mb=$((total_cache_size_kb / 1024))
    
    log_info "📊 Total cache size: ${total_cache_size_mb}MB"
    
    # If total cache exceeds limit, clean oldest caches
    if [ $total_cache_size_mb -gt $MAX_TOTAL_CACHE_SIZE_MB ]; then
        log_warning "⚠️  Total cache size (${total_cache_size_mb}MB) exceeds limit (${MAX_TOTAL_CACHE_SIZE_MB}MB)"
        log_info "🧹 Cleaning oldest caches to free up space..."
        
        # Clean in priority order (least impactful first)
        clean_gradle_cache_if_large $MAX_SINGLE_CACHE_SIZE_MB
        clean_yarn_cache_if_large $MAX_SINGLE_CACHE_SIZE_MB
        clean_android_build_cache_if_large $MAX_SINGLE_CACHE_SIZE_MB
        clean_pods_cache_if_large $MAX_SINGLE_CACHE_SIZE_MB
        
        # Recalculate after cleanup
        total_cache_size_kb=$(du -sk "$CACHE_BASE_DIR" 2>/dev/null | cut -f1)
        total_cache_size_mb=$((total_cache_size_kb / 1024))
        log_info "📊 Cache size after cleanup: ${total_cache_size_mb}MB"
    else
        log_success "✅ Cache size within limits"
    fi
    
    show_elapsed_time $step_start_time "Checking cache"
}

# Function to clean gradle cache if too large
clean_gradle_cache_if_large() {
    local max_size_mb=$1
    if [ -d "$GRADLE_CACHE_DIR" ]; then
        local cache_size_kb=$(du -sk "$GRADLE_CACHE_DIR" 2>/dev/null | cut -f1)
        local cache_size_mb=$((cache_size_kb / 1024))
        if [ $cache_size_mb -gt $max_size_mb ]; then
            log_warning "🐘 Gradle cache (${cache_size_mb}MB) exceeds limit, cleaning..."
            rm -rf "$GRADLE_CACHE_DIR"
            mkdir -p "$GRADLE_CACHE_DIR"
            log_success "✅ Gradle cache cleaned"
        fi
    fi
}

# Function to clean yarn cache if too large
clean_yarn_cache_if_large() {
    local max_size_mb=$1
    if [ -d "$YARN_CACHE_DIR" ]; then
        local cache_size_kb=$(du -sk "$YARN_CACHE_DIR" 2>/dev/null | cut -f1)
        local cache_size_mb=$((cache_size_kb / 1024))
        if [ $cache_size_mb -gt $max_size_mb ]; then
            log_warning "🧶 Yarn cache (${cache_size_mb}MB) exceeds limit, cleaning..."
            rm -rf "$YARN_CACHE_DIR"
            mkdir -p "$YARN_CACHE_DIR"
            log_success "✅ Yarn cache cleaned"
        fi
    fi
}

# Function to clean android build cache if too large
clean_android_build_cache_if_large() {
    local max_size_mb=$1
    if [ -d "$ANDROID_BUILD_CACHE" ]; then
        local cache_size_kb=$(du -sk "$ANDROID_BUILD_CACHE" 2>/dev/null | cut -f1)
        local cache_size_mb=$((cache_size_kb / 1024))
        if [ $cache_size_mb -gt $max_size_mb ]; then
            log_warning "🤖 Android build cache (${cache_size_mb}MB) exceeds limit, cleaning..."
            rm -rf "$ANDROID_BUILD_CACHE"
            log_success "✅ Android build cache cleaned"
        fi
    fi
}

# Function to clean pods cache if too large
clean_pods_cache_if_large() {
    local max_size_mb=$1
    if [ -d "$PODS_CACHE_DIR" ]; then
        local cache_size_kb=$(du -sk "$PODS_CACHE_DIR" 2>/dev/null | cut -f1)
        local cache_size_mb=$((cache_size_kb / 1024))
        if [ $cache_size_mb -gt $max_size_mb ]; then
            log_warning "🍎 Pods cache (${cache_size_mb}MB) exceeds limit, cleaning..."
            rm -rf "$PODS_CACHE_DIR"
            log_success "✅ Pods cache cleaned"
        fi
    fi
}

# Function to clean old build artifacts
clean_old_artifacts() {
    local step_start_time=$(date +%s)
    log_info "🗑️  Cleaning old build artifacts..."
    
    if [ ! -d "$ARTIFACTS_PATH" ]; then
        log_info "📁 No artifacts directory found at: $ARTIFACTS_PATH"
        return 0
    fi
    
    log_info "📁 Using artifacts path: $ARTIFACTS_PATH"
    
    # Keep only last 10 builds for each platform
    local keep_count=10
    
    # Clean old Android builds (keep newest 10)
    if [ -d "$ARTIFACTS_PATH/android_builds" ]; then
        log_info "🤖 Cleaning old Android builds..."
        cd "$ARTIFACTS_PATH/android_builds"
        local android_count=$(ls -1 *.apk 2>/dev/null | wc -l)
        if [ $android_count -gt $keep_count ]; then
            local delete_count=$((android_count - keep_count))
            ls -1t *.apk | tail -n $delete_count | xargs rm -f
            log_success "✅ Removed $delete_count old Android builds"
        else
            log_info "📦 Android builds within limit ($android_count <= $keep_count)"
        fi
    fi
    
    # Clean old iOS builds (keep newest 10)
    if [ -d "$ARTIFACTS_PATH/ios_builds" ]; then
        log_info "🍎 Cleaning old iOS builds..."
        cd "$ARTIFACTS_PATH/ios_builds"
        local ios_count=$(ls -1 *.tgz 2>/dev/null | wc -l)
        if [ $ios_count -gt $keep_count ]; then
            local delete_count=$((ios_count - keep_count))
            ls -1t *.tgz | tail -n $delete_count | xargs rm -f
            log_success "✅ Removed $delete_count old iOS builds"
        else
            log_info "📦 iOS builds within limit ($ios_count <= $keep_count)"
        fi
    fi
    
    # Calculate total artifacts size
    cd "$ARTIFACTS_PATH"
    local total_size=$(du -sh . 2>/dev/null | cut -f1)
    log_info "📊 Total artifacts size: $total_size"
    
    show_elapsed_time $step_start_time "Clean Old artifacts"
}

# Function to handle build failure
handle_build_failure() {
    local exit_code=$1
    log_error "❌ Build failed with exit code: $exit_code"
    
    if [ $RETRY_COUNT -lt $MAX_RETRIES ]; then
        RETRY_COUNT=$((RETRY_COUNT + 1))
        log_warning "🔄 Retrying build (attempt $((RETRY_COUNT + 1))/$((MAX_RETRIES + 1))) with clean cache..."
        clean_all_caches
        ./scripts/cleanDeep.sh "$PLATFORM"
        # Force no cache restore on retry, but preserve cache save setting
        NO_CACHE_RESTORE="--no-cache-restore"
        main_build_process
    else
        log_error "❌ Build failed after $((MAX_RETRIES + 1)) attempts"
        exit $exit_code
    fi
}

# Main build process
main_build_process() {
    # trap 'handle_build_failure $?' ERR
    
    # Set artifacts path (use custom path or default)
    if [ -n "$ARTIFACTS_PATH_PARAM" ]; then
        ARTIFACTS_PATH="$ARTIFACTS_PATH_PARAM"
        log_info "🎯 Using custom artifacts path: $ARTIFACTS_PATH"
    else
        ARTIFACTS_PATH="~/builds/master/react"
        log_info "🎯 Using default artifacts path: $ARTIFACTS_PATH"
    fi
    
    log_info "🚀 Starting Jenkins build process for platform: $PLATFORM (attempt $((RETRY_COUNT + 1))/$((MAX_RETRIES + 1)))..."
    
    # Validate platform parameter
    if [[ "$PLATFORM" != "ios" && "$PLATFORM" != "android" && "$PLATFORM" != "all" ]]; then
        log_error "❌ Invalid platform '$PLATFORM'. Use 'ios', 'android', or 'all'"
        echo "Usage: $0 <ios|android|all|clean-cache|clean-artifacts|cache-info> [OPTIONS]"
        echo "Build Commands:"
        echo "  ios                          - Build iOS app only"
        echo "  android                      - Build Android app only" 
        echo "  all                          - Build both platforms"
        echo "Maintenance Commands:"
        echo "  clean-cache                  - Clean all build caches"
        echo "  clean-artifacts              - Clean old build artifacts (keep latest 10)"
        echo "  cache-info                   - Show cache sizes and manage if needed"
        echo "Build Options:"
        echo "  --no-cache-restore           - Skip cache restoration (fresh build)"
        echo "  --no-cache-save              - Skip cache saving (don't update cache after build)"
        echo "  --cache-node-modules-only    - Cache only node_modules, skip iOS Pods and Android build cache"
        echo "  --artifacts-path <path>      - Custom path for build artifacts (default: ~/builds/master/react)"
        exit 1
    fi
    
    # Initialize workspace
    local init_start_time=$(date +%s)
    log_info "🏗️  Initializing workspace..."
    export PATH=/usr/local/bin:$PATH
    export LANG=en_US.UTF-8
    log_info "👤 User: $(whoami)"
    cd $WORKSPACE
    log_info "📁 Working directory: $(pwd)"
    log_info "🔧 PATH: $PATH"
    log_info "📦 Node version: $(node --version)"
    if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
        log_info "💎 Ruby version: $(ruby --version)"
    fi
    show_elapsed_time $init_start_time "Init Workspace"
    
    # Restore cache first (or skip if requested)
    restore_cache
    
    # Manage cache sizes to prevent memory issues
    #vmanage_cache_sizes
    
    # Copy configurations
    local config_start_time=$(date +%s)
    log_info "⚙️  Copying app configurations..."
    
    # Check if config source exists
    if [ ! -d "../REACT_APPLICATION_CONFIGS" ]; then
        log_error "❌ REACT_APPLICATION_CONFIGS directory not found"
        exit 1
    fi
    
    cp ../REACT_APPLICATION_CONFIGS/.yarnrc.yml . && log_success "✅ .yarnrc.yml copied" || log_error "❌ Failed to copy .yarnrc.yml"
    
    # Only copy app.config.json if it doesn't exist (allows external updates)
    if [ ! -f "app.config.json" ]; then
        cp ../REACT_APPLICATION_CONFIGS/app.config.json . && log_success "✅ app.config.json copied" || log_error "❌ Failed to copy app.config.json"

        # Update app config to default values
        # jq '.ENVIRONMENT = "local" | .LOCAL_IP = "10.0.15.52" ' app.config.json > appConfig.tmp && mv appConfig.tmp app.config.json
        # log_info "⚙️  App configuration updated:"
        # jq '.' app.config.json
    else
        log_info "📋 app.config.json already exists, using existing file"
    fi
    
    cp ../REACT_APPLICATION_CONFIGS/app.credentials.json . && log_success "✅ app.credentials.json copied" || log_error "❌ Failed to copy app.credentials.json"
    cp ../REACT_APPLICATION_CONFIGS/android/local.properties ./android && log_success "✅ local.properties copied" || log_error "❌ Failed to copy local.properties"
    cp ../REACT_APPLICATION_CONFIGS/android/app/gsapp_dev.keystore ./android/app && log_success "✅ gsapp_dev.keystore copied" || log_error "❌ Failed to copy gsapp_dev.keystore"
    cp ../REACT_APPLICATION_CONFIGS/android/app/gskeystore.keystore ./android/app && log_success "✅ gskeystore.keystore copied" || log_error "❌ Failed to copy gskeystore.keystore"
    cp ../REACT_APPLICATION_CONFIGS/android/app/keystore.properties ./android/app && log_success "✅ keystore.properties copied" || log_error "❌ Failed to copy keystore.properties"
    cp ../REACT_APPLICATION_CONFIGS/android/app/google-services.json ./android/app && log_success "✅ google-services.json copied" || log_error "❌ Failed to copy google-services.json"
    cp ../REACT_APPLICATION_CONFIGS/android/app/src/main/assets/containers/* ./android/app/src/main/assets/containers && log_success "✅ Container assets copied" || log_error "❌ Failed to copy container assets"
    
    export PRODUCTION=1
    log_info "🏭 PRODUCTION environment set"
    
    show_elapsed_time $config_start_time "Set up configs"
    
    cd $WORKSPACE
    
    # Install dependencies
    local deps_start_time=$(date +%s)
    log_info "📚 Installing 3rd party modules and pods..."
    
    # SDK Authentication
    log_info "🔐 Authenticating with SDK..."
    ./scripts/sdkAuth.sh && log_success "✅ SDK authentication completed" || log_error "❌ SDK authentication failed"
    
    # Yarn installation with cache
    export YARN_ENABLE_IMMUTABLE_INSTALLS=false
    log_info "🧶 Installing yarn dependencies..."
    
    # Check if we can skip yarn install (if node_modules exists and package.json hasn't changed)
    # Skip this optimization if --no-cache-restore is set
    if [[ "$NO_CACHE_RESTORE" != "--no-cache-restore" ]] && [ -d "node_modules" ] && [ -f "yarn.lock" ]; then
        # Check if package.json is newer than node_modules
        if [ "package.json" -nt "node_modules" ] || [ "yarn.lock" -nt "node_modules" ]; then
            log_info "📦 Package files changed, running yarn install..."
            if ! yarn install; then
                log_error "❌ Yarn install failed - exiting build"
                exit 1
            fi
            log_success "✅ Yarn dependencies installed"
        else
            log_info "📦 Dependencies are up to date, skipping yarn install"
        fi
    else
        log_info "📦 Running fresh yarn install..."
        if ! yarn install; then
            log_error "❌ Yarn install failed - exiting build"
            exit 1
        fi
        log_success "✅ Yarn dependencies installed"
    fi
    
    show_elapsed_time $deps_start_time "Installing Node dependencies"
    
    # Save pre-codegen cache (optimal node_modules size before codegen bloat)
    save_pre_codegen_cache
    
    cd $WORKSPACE
    
    # iOS Dependencies (if building iOS)
    if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
        local ios_deps_start_time=$(date +%s)
        log_info "🍎 Installing iOS dependencies..."
        cd ios
        
        # Check if Bundler is available
        if command -v bundle >/dev/null 2>&1; then
            log_info "⌛ Attempting bundle exec pod install..."
            if bundle exec pod install --repo-update 2>/dev/null; then
                log_success "✅ Pods installed via bundle exec with repo update"
            elif rm -rf Pods Podfile.lock && bundle exec pod install 2>/dev/null; then
                log_success "✅ Pods installed via bundle exec without repo update"
            else
                log_warning "⚠️  Bundle exec pod install failed, installing Ruby gems first..."
                bundle install && log_success "✅ Ruby gems installed" || log_error "❌ Bundle install failed"
                
                log_info "⌛ Installing Pods after bundle install..."
                if bundle exec pod install --repo-update; then
                    log_success "✅ Pods installed via bundle exec with repo update"
                elif bundle exec pod install; then
                    log_success "✅ Pods installed via bundle exec without repo update"
                else
                    log_error "❌ Pod install failed via bundle exec"
                    exit 1
                fi
            fi
        else
            log_error "❌ Bundler not found. Bundler is required for iOS setup."
            exit 1
        fi
        cd ..
        show_elapsed_time $ios_deps_start_time "Installing iOS dependencies"
    else
        log_info "🍎 Skipping iOS dependencies (platform: $PLATFORM)"
    fi
    
    cd $WORKSPACE
    
    # Generate JS bundle
    # local bundle_start_time=$(date +%s)
    # if [[ "$PLATFORM" == "ios" ]]; then
    #     log_info "📱 Generating iOS JavaScript bundle..."
    #     if ! yarn bundle:ios; then
    #         log_error "❌ iOS bundle generation failed - exiting build"
    #         exit 1
    #     fi
    #     log_success "✅ iOS bundle generated"
    # elif [[ "$PLATFORM" == "android" ]]; then
    #     log_info "📱 Generating Android JavaScript bundle..."
    #     if ! yarn bundle:android; then
    #         log_error "❌ Android bundle generation failed - exiting build"
    #         exit 1
    #     fi
    #     log_success "✅ Android bundle generated"
    # else
    #     log_info "📱 Generating JavaScript bundles for both platforms..."
    #     if ! yarn bundle; then
    #         log_error "❌ Bundle generation failed - exiting build"
    #         exit 1
    #     fi
    #     log_success "✅ Both bundles generated"
    # fi
    # show_elapsed_time $bundle_start_time "Generating JS bundle"
    
    # Build the app
    local build_start_time=$(date +%s)
    
    # Android Build
    if [[ "$PLATFORM" == "android" || "$PLATFORM" == "all" ]]; then
        # Configure Java       
        if [[ "$OSTYPE" == "linux-gnu"* ]]; then
            log_info "☕ Configuring JAVA_HOME for Linux..."
            export JAVA_HOME=/usr/lib/jvm/jdk-17.0.16+8
        else
            log_info "☕ Configuring JAVA_HOME for Mac OSX..."
            export JAVA_HOME=/Library/Java/JavaVirtualMachines/zulu-17.jdk/Contents/Home
        fi

        log_info "☕ JAVA_HOME set to: $JAVA_HOME"

        log_info "🔨 Building Android app in Release mode..."
        cd android
        
        # Use gradle daemon for better performance
        export GRADLE_OPTS="-Dorg.gradle.daemon=true -Dorg.gradle.parallel=true -Dorg.gradle.configureondemand=true -Dorg.gradle.caching=true"

        ./gradlew assembleRelease && log_success "✅ Android app built successfully" || log_error "❌ Android build failed"
        cd ..
        
        # Verify Android build output
        if [ -e ./android/app/build/outputs/apk/release/app-release.apk ]; then
            local apk_size=$(du -h ./android/app/build/outputs/apk/release/app-release.apk | cut -f1)
            log_success "✅ Android APK built successfully - Size: $apk_size"
        else
            log_error "❌ Could not build app-release.apk. Aboting..."
            exit 1
        fi
    else
        log_info "🤖 Skipping Android build (platform: $PLATFORM)"
    fi
    
    # iOS Build  
    if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
        log_info "🔨 Building iOS app in Release mode..."
        
        # Build iOS app using xcodebuild
        # yarn react-native run-ios --mode=Release --no-packager && log_success "✅ iOS app built successfully" || log_error "❌ iOS build failed"
        cd ios
        xcodebuild -workspace GigSkyConsumerApp.xcworkspace -scheme GigSkyConsumerApp -configuration Release -sdk iphonesimulator && log_success "✅ iOS app built successfully" || log_error "❌ iOS build failed"
        cd ..
        
        # Verify iOS build output
        if [ -d ./ios/build/Products/Release-iphonesimulator/GigSkyConsumerApp.app ]; then
            log_success "✅ iOS archive created successfully"
        elif [ -d ./ios/Build/Products/Release-iphonesimulator/GigSkyConsumerApp.app ]; then
            log_success "✅ iOS archive created successfully"
        else
            log_error "❌ Could not build iOS archive. Aborting..."
            exit 1
        fi
    else
        log_info "🍎 Skipping iOS build (platform: $PLATFORM)"
    fi
    
    show_elapsed_time $build_start_time "Building artifact(s)"
    
    # Save post-build cache (iOS pods, gradle cache maintained via env vars)
    save_post_build_cache
    
    # Deploy artifacts
    local deploy_start_time=$(date +%s)
    log_info "🚀 Deploying build artifacts..."
    log_info "📁 Using artifacts path: $ARTIFACTS_PATH"
    
    # Clean old artifacts to prevent disk space issues
    clean_old_artifacts
    
    # Create the folder if it doesn't exist
    if [ ! -d "$ARTIFACTS_PATH" ]; then
        mkdir -p "$ARTIFACTS_PATH"
        log_info "📁 Created folder: $ARTIFACTS_PATH"
    else
        log_info "📁 Folder already exists: $ARTIFACTS_PATH"
    fi
    
    # Create timestamped deployment to avoid conflicts with test jobs
    TIMESTAMP=$(date +%d%m%Y_%H%M%S)
    BUILD_ID_SUFFIX=""
    if [ ! -z "$BUILD_NUMBER" ]; then
        BUILD_ID_SUFFIX="_build$BUILD_NUMBER"
    fi
    
    # Deploy Android artifacts
    cd $WORKSPACE
    if [[ "$PLATFORM" == "android" || "$PLATFORM" == "all" ]]; then

        if [ ! -z "./android/app/build/outputs/apk/release/app-release.apk" ]; then
            log_info "🤖 Android APK available for deployment"
        else
            log_error "❌ Could not find app-release.apk. Aborting Android deployment..."
            exit 1
        fi

        # Create timestamped APK name to avoid conflicts
        APK_NAME="app-release_${TIMESTAMP}${BUILD_ID_SUFFIX}.apk"
        export ANDROID_APK_NAME=$APK_NAME

        # Create android_builds directory if it doesn't exist
        mkdir -p "$ARTIFACTS_PATH/android_builds"
        
        # Copy to organized android_builds folder
        cp android/app/build/outputs/apk/release/app-release.apk "$ARTIFACTS_PATH/android_builds/$APK_NAME" && log_success "✅ Android APK copied to android_builds/$APK_NAME"
        
        # Create/update a symlink to the latest build in main directory
        cd "$ARTIFACTS_PATH"
        ln -sf "android_builds/$APK_NAME" app-release-latest.apk && log_success "✅ Updated latest APK symlink"
        
        # Artifacts ready for deployment
        log_info "📦 Android APK artifacts ready for deployment:"
        log_info "   📁 Organized APK: $ARTIFACTS_PATH/android_builds/$APK_NAME"
        log_info "   🔗 Latest APK link: $ARTIFACTS_PATH/app-release-latest.apk"
    fi
    
    # Deploy iOS artifacts (if built)
    cd $WORKSPACE
    if [[ "$PLATFORM" == "ios" || "$PLATFORM" == "all" ]]; then
        # Check for iOS build artifacts
        IOS_BUILD_PATH=""
        if [ -d ./ios/build/Products/Release-iphonesimulator/GigSkyConsumerApp.app ]; then
            IOS_BUILD_PATH="./ios/build/Products/Release-iphonesimulator"
        elif [ -d ./ios/Build/Products/Release-iphonesimulator/GigSkyConsumerApp.app ]; then
            IOS_BUILD_PATH="./ios/Build/Products/Release-iphonesimulator"
        fi

        if [ ! -z "$IOS_BUILD_PATH" ]; then
            log_info "🍎 iOS archive available for deployment"
        else
            log_error "❌ Could not find GigSkyConsumerApp.app. Aborting iOS deployment..."
            exit 1
        fi

        cd "$IOS_BUILD_PATH"

        echo "Built GigSkyConsumerApp.app. Publishing build ..."

        # Create timestamped iOS archive to avoid conflicts
        ARCHIVE_NAME="gigskyconsumerapp_${TIMESTAMP}${BUILD_ID_SUFFIX}.tgz"
        export IOS_ARCHIVE_NAME=$ARCHIVE_NAME
        tar -czf "$ARCHIVE_NAME" GigSkyConsumerApp.app
        
        # Create ios_builds directory if it doesn't exist
        mkdir -p "$ARTIFACTS_PATH/ios_builds"
        
        # Copy to organized ios_builds folder
        cp "$ARCHIVE_NAME" "$ARTIFACTS_PATH/ios_builds/" && log_success "✅ iOS archive copied to ios_builds/$ARCHIVE_NAME"
        
        # Create/update symlink to latest iOS build in main directory
        cd "$ARTIFACTS_PATH"
        ln -sf "ios_builds/$ARCHIVE_NAME" gigskyconsumerapp-latest.tgz && log_success "✅ Updated latest iOS archive symlink"

        # Artifacts ready for deployment
        log_info "📦 iOS archive artifacts ready for deployment:"
        log_info "   📁 Organized archive: $ARTIFACTS_PATH/ios_builds/$ARCHIVE_NAME"
        log_info "   🔗 Latest archive link: $ARTIFACTS_PATH/gigskyconsumerapp-latest.tgz"

        cd $WORKSPACE
    fi
    
    show_elapsed_time $deploy_start_time "Deploying artifact(s)"
    
    # Final success message
    show_elapsed_time $BUILD_START_TIME "TOTAL"
    log_success "🎉 Build completed successfully for platform: $PLATFORM!"
    
    # Display cache information and tips
    if [[ "$NO_CACHE_SAVE" == "--no-cache-save" ]]; then
        log_info "💡 Cache saving was skipped. Use without --no-cache-save to improve future build times."
    elif [[ "$CACHE_NODE_MODULES_ONLY" == "--cache-node-modules-only" ]]; then
        log_info "💾 Node modules only cache information:"
        if [ -d "$NODE_MODULES_PRE_CODEGEN_CACHE" ]; then
            local cache_size=$(du -sh "$NODE_MODULES_PRE_CODEGEN_CACHE" | cut -f1)
            log_info "📦 Optimized node_modules cache size: $cache_size"
        fi
        if [ -d "$YARN_CACHE_DIR" ]; then
            local yarn_cache_size=$(du -sh "$YARN_CACHE_DIR" | cut -f1)
            log_info "🧶 Yarn cache size: $yarn_cache_size"
        fi
        log_info "💡 iOS Pods and Android build caches were skipped (--cache-node-modules-only mode)"
    else
        log_info "💾 Cache information:"
        if [ -d "$NODE_MODULES_PRE_CODEGEN_CACHE" ]; then
            local cache_size=$(du -sh "$NODE_MODULES_PRE_CODEGEN_CACHE" | cut -f1)
            log_info "📦 Optimized node_modules cache size: $cache_size"
        fi
        if [ -d "$YARN_CACHE_DIR" ]; then
            local yarn_cache_size=$(du -sh "$YARN_CACHE_DIR" | cut -f1)
            log_info "🧶 Yarn cache size: $yarn_cache_size"
        fi
        if [ -d "$GRADLE_CACHE_DIR" ]; then
            local gradle_cache_size=$(du -sh "$GRADLE_CACHE_DIR" | cut -f1)
            log_info "🐘 Gradle cache size: $gradle_cache_size"
        fi
        if [ -d "$ANDROID_BUILD_CACHE" ]; then
            local android_build_cache_size=$(du -sh "$ANDROID_BUILD_CACHE" | cut -f1)
            log_info "🤖 Android build cache size: $android_build_cache_size"
        fi
        if [ -d "$PODS_CACHE_DIR" ]; then
            local pods_cache_size=$(du -sh "$PODS_CACHE_DIR" | cut -f1)
            log_info "🍎 Pods cache size: $pods_cache_size"
        fi
    fi
    
    if [[ "$NO_CACHE_RESTORE" == "--no-cache-restore" ]]; then
        log_info "💡 Fresh build completed. Optimized cache available for next build."
    else
        log_info "💡 Next build will use optimized cache for faster execution."
    fi
}

# Cleanup function for script termination
cleanup() {
    local exit_code=$?
    if [ $exit_code -ne 0 ]; then
        log_error "🚨 Script terminated unexpectedly with exit code: $exit_code"
        show_elapsed_time $BUILD_START_TIME
    fi
}

# Set up cleanup trap
trap cleanup EXIT

# Handle special commands that need artifacts path configuration
if [[ "$PLATFORM" == "clean-cache" ]]; then
    log_info "🧹 Cache cleanup requested..."
    clean_all_caches
    exit 0
elif [[ "$PLATFORM" == "clean-artifacts" ]]; then
    # Set artifacts path for clean-artifacts command
    if [ -n "$ARTIFACTS_PATH_PARAM" ]; then
        ARTIFACTS_PATH="$ARTIFACTS_PATH_PARAM"
        log_info "🎯 Using custom artifacts path for cleanup: $ARTIFACTS_PATH"
    else
        ARTIFACTS_PATH="~/builds/master/react"
        log_info "🎯 Using default artifacts path for cleanup: $ARTIFACTS_PATH"
    fi
    log_info "🗑️  Artifact cleanup requested..."
    clean_old_artifacts
    exit 0
elif [[ "$PLATFORM" == "cache-info" ]]; then
    log_info "📊 Cache information requested..."
    manage_cache_sizes
    exit 0
fi

# Execute main build process
main_build_process

