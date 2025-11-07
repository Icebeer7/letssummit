#!/bin/bash

# Build Cache Management Script
# Provides utilities for managing build caches

CACHE_BASE_DIR="../REACT_APPLICATION_CONFIGS/build_cache"
NODE_MODULES_CACHE="$CACHE_BASE_DIR/node_modules"
NODE_MODULES_PRE_CODEGEN_CACHE="$CACHE_BASE_DIR/node_modules_pre_codegen"
YARN_CACHE_DIR="$CACHE_BASE_DIR/yarn_cache"
GRADLE_CACHE_DIR="$CACHE_BASE_DIR/gradle_cache"
PODS_CACHE_DIR="$CACHE_BASE_DIR/pods_cache"
ANDROID_BUILD_CACHE="$CACHE_BASE_DIR/android_build"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to get directory size
get_dir_size() {
    local dir=$1
    if [ -d "$dir" ]; then
        du -sh "$dir" | cut -f1
    else
        echo "0B"
    fi
}

# Function to show cache status
show_cache_status() {
    log_info "🔍 Build Cache Status Report"
    echo "=========================================="
    printf "%-25s %-10s %-15s\n" "Cache Type" "Size" "Status"
    echo "=========================================="
    
    # Node modules cache (legacy)
    local node_size=$(get_dir_size "$NODE_MODULES_CACHE")
    local node_status="❌ Not Found"
    if [ -d "$NODE_MODULES_CACHE" ]; then
        node_status="✅ Available"
    fi
    printf "%-25s %-10s %-15s\n" "node_modules (legacy)" "$node_size" "$node_status"
    
    # Node modules pre-codegen cache (optimized)
    local node_pre_size=$(get_dir_size "$NODE_MODULES_PRE_CODEGEN_CACHE")
    local node_pre_status="❌ Not Found"
    if [ -d "$NODE_MODULES_PRE_CODEGEN_CACHE" ]; then
        node_pre_status="✅ Available"
    fi
    printf "%-25s %-10s %-15s\n" "node_modules (optimized)" "$node_pre_size" "$node_pre_status"
    
    # Yarn cache
    local yarn_size=$(get_dir_size "$YARN_CACHE_DIR")
    local yarn_status="❌ Not Found"
    if [ -d "$YARN_CACHE_DIR" ]; then
        yarn_status="✅ Available"
    fi
    printf "%-25s %-10s %-15s\n" "yarn_cache" "$yarn_size" "$yarn_status"
    
    # Gradle cache
    local gradle_size=$(get_dir_size "$GRADLE_CACHE_DIR")
    local gradle_status="❌ Not Found"
    if [ -d "$GRADLE_CACHE_DIR" ]; then
        gradle_status="✅ Available"
    fi
    printf "%-25s %-10s %-15s\n" "gradle_cache" "$gradle_size" "$gradle_status"
    
    # Pods cache
    local pods_size=$(get_dir_size "$PODS_CACHE_DIR")
    local pods_status="❌ Not Found"
    if [ -d "$PODS_CACHE_DIR" ]; then
        pods_status="✅ Available"
    fi
    printf "%-25s %-10s %-15s\n" "pods_cache" "$pods_size" "$pods_status"
    
    # Android build cache
    local android_size=$(get_dir_size "$ANDROID_BUILD_CACHE")
    local android_status="❌ Not Found"
    if [ -d "$ANDROID_BUILD_CACHE" ]; then
        android_status="✅ Available"
    fi
    printf "%-25s %-10s %-15s\n" "android_build" "$android_size" "$android_status"
    
    echo "=========================================="
    echo "Note: Build artifacts (APK/IPA) are not cached as they don't improve build speed"
    echo "=========================================="
    
    # Total cache size
    if [ -d "$CACHE_BASE_DIR" ]; then
        local total_size=$(get_dir_size "$CACHE_BASE_DIR")
        log_success "💿 Total cache size: $total_size"
    else
        log_warning "💿 No cache directory found"
    fi
}

# Function to clean specific cache type
clean_cache_type() {
    local cache_type=$1
    
    case $cache_type in
        "node_modules")
            if [ -d "$NODE_MODULES_CACHE" ]; then
                log_info "🧹 Cleaning legacy node_modules cache..."
                rm -rf "$NODE_MODULES_CACHE"
                log_success "✅ Legacy node_modules cache cleaned"
            fi
            if [ -d "$NODE_MODULES_PRE_CODEGEN_CACHE" ]; then
                log_info "🧹 Cleaning optimized node_modules cache..."
                rm -rf "$NODE_MODULES_PRE_CODEGEN_CACHE"
                log_success "✅ Optimized node_modules cache cleaned"
            fi
            if [ ! -d "$NODE_MODULES_CACHE" ] && [ ! -d "$NODE_MODULES_PRE_CODEGEN_CACHE" ]; then
                log_warning "❌ No node_modules cache found"
            fi
            ;;
        "yarn")
            if [ -d "$YARN_CACHE_DIR" ]; then
                log_info "🧹 Cleaning yarn cache..."
                rm -rf "$YARN_CACHE_DIR"
                log_success "✅ Yarn cache cleaned"
            else
                log_warning "❌ Yarn cache not found"
            fi
            ;;
        "gradle")
            if [ -d "$GRADLE_CACHE_DIR" ]; then
                log_info "🧹 Cleaning gradle cache..."
                rm -rf "$GRADLE_CACHE_DIR"
                log_success "✅ Gradle cache cleaned"
            else
                log_warning "❌ Gradle cache not found"
            fi
            ;;
        "pods")
            if [ -d "$PODS_CACHE_DIR" ]; then
                log_info "🧹 Cleaning pods cache..."
                rm -rf "$PODS_CACHE_DIR"
                log_success "✅ Pods cache cleaned"
            else
                log_warning "❌ Pods cache not found"
            fi
            ;;
        "android_build")
            if [ -d "$ANDROID_BUILD_CACHE" ]; then
                log_info "🧹 Cleaning Android build cache..."
                rm -rf "$ANDROID_BUILD_CACHE"
                log_success "✅ Android build cache cleaned"
            else
                log_warning "❌ Android build cache not found"
            fi
            ;;
        "all")
            if [ -d "$CACHE_BASE_DIR" ]; then
                log_info "🧹 Cleaning all caches..."
                rm -rf "$CACHE_BASE_DIR"
                log_success "✅ All caches cleaned"
            else
                log_warning "❌ No cache directory found"
            fi
            ;;
        *)
            log_error "❌ Unknown cache type: $cache_type"
            log_info "Available types: node_modules, yarn, gradle, pods, android_build, all"
            exit 1
            ;;
    esac
}

# Function to backup current workspace to cache
backup_to_cache() {
    log_info "💾 Backing up current workspace to cache..."
    
    mkdir -p "$CACHE_BASE_DIR"
    
    # Backup node_modules if it exists
    if [ -d "node_modules" ]; then
        log_info "📦 Backing up node_modules..."
        rm -rf "$NODE_MODULES_PRE_CODEGEN_CACHE"
        cp -R ./node_modules "$NODE_MODULES_PRE_CODEGEN_CACHE" && log_success "✅ node_modules backed up" || log_warning "❌ Failed to backup node_modules"
        
        # Also backup yarn.lock for comparison
        if [ -f "yarn.lock" ]; then
            cp yarn.lock "$NODE_MODULES_PRE_CODEGEN_CACHE/../yarn.lock" 2>/dev/null && log_success "✅ yarn.lock backed up" || log_warning "❌ Failed to backup yarn.lock"
        fi
    else
        log_warning "⚠️  No node_modules directory found"
    fi
    
    # Backup iOS Pods if they exist
    if [ -d "ios/Pods" ]; then
        log_info "🍎 Backing up iOS Pods..."
        rm -rf "$PODS_CACHE_DIR"
        mkdir -p "$PODS_CACHE_DIR"
        cp -R ./ios/Pods "$PODS_CACHE_DIR/" && log_success "✅ iOS Pods backed up" || log_warning "❌ Failed to backup iOS Pods"
        
        if [ -f "ios/Podfile.lock" ]; then
            cp ./ios/Podfile.lock "$PODS_CACHE_DIR/" 2>/dev/null && log_success "✅ Podfile.lock backed up" || log_warning "❌ Failed to backup Podfile.lock"
        fi
    else
        log_warning "⚠️  No iOS Pods directory found"
    fi
    
    # Backup Android build folders if they exist
    if [ -d "android/build" ] || [ -d "android/app/build" ]; then
        log_info "🤖 Backing up Android build folders..."
        rm -rf "$ANDROID_BUILD_CACHE"
        mkdir -p "$ANDROID_BUILD_CACHE"
        
        if [ -d "android/build" ]; then
            cp -R ./android/build "$ANDROID_BUILD_CACHE/project_build" && log_success "✅ Android project build backed up" || log_warning "❌ Failed to backup Android project build"
        fi
        
        if [ -d "android/app/build" ]; then
            cp -R ./android/app/build "$ANDROID_BUILD_CACHE/app_build" && log_success "✅ Android app build backed up" || log_warning "❌ Failed to backup Android app build"
        fi
    else
        log_warning "⚠️  No Android build directories found"
    fi
    
    log_success "🎉 Workspace backup completed"
}

# Function to show usage
show_usage() {
    echo "Usage: $0 <command> [cache_type]"
    echo ""
    echo "Commands:"
    echo "  status                   Show cache status and sizes"
    echo "  clean <cache_type>       Clean specific cache type"
    echo "  backup                   Backup current workspace to cache"
    echo ""
    echo "Cache Types for clean command:"
    echo "  node_modules             Clean node_modules cache (both legacy and optimized)"
    echo "  yarn                     Clean yarn cache"
    echo "  gradle                   Clean gradle cache"
    echo "  pods                     Clean iOS pods cache"
    echo "  android_build            Clean Android build cache"
    echo "  all                      Clean all caches"
    echo ""
    echo "Note: Build artifacts (APK/IPA) are not cached for performance reasons"
    echo ""
    echo "Examples:"
    echo "  $0 status"
    echo "  $0 clean all"
    echo "  $0 clean node_modules"
    echo "  $0 clean android_build"
    echo "  $0 backup"
}

# Main script logic
case $1 in
    "status")
        show_cache_status
        ;;
    "clean")
        if [ -z "$2" ]; then
            log_error "❌ Cache type required for clean command"
            show_usage
            exit 1
        fi
        clean_cache_type "$2"
        ;;
    "backup")
        backup_to_cache
        ;;
    *)
        log_error "❌ Invalid command: $1"
        show_usage
        exit 1
        ;;
esac
