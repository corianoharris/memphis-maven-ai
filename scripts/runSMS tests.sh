#!/bin/bash

# Memphis 211/311 AI Assistant - SMS Testing Script
# This script provides easy commands to test SMS functionality

echo "🎵 Memphis 211/311 AI Assistant - SMS Testing Script"
echo "=================================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the project root directory"
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo ""
fi

# Function to run basic test
run_basic_test() {
    echo "🧪 Running basic SMS test..."
    echo "----------------------------"
    npm run test-sms basic
    echo ""
}

# Function to run scenario tests
run_scenario_tests() {
    echo "🧪 Running scenario tests..."
    echo "----------------------------"
    
    echo "1️⃣ Testing pothole scenario..."
    npm run test-sms advanced --scenario=pothole
    echo ""
    
    echo "2️⃣ Testing emergency scenario..."
    npm run test-sms advanced --scenario=emergency
    echo ""
    
    echo "3️⃣ Testing community scenario..."
    npm run test-sms advanced --scenario=community
    echo ""
}

# Function to run custom message test
run_custom_test() {
    local message="$1"
    if [ -z "$message" ]; then
        message="I need help with trash pickup"
    fi
    
    echo "🧪 Running custom message test..."
    echo "--------------------------------"
    echo "Message: \"$message\""
    echo ""
    npm run test-sms advanced --custom="$message"
    echo ""
}

# Function to run all tests
run_all_tests() {
    echo "🚀 Running all SMS tests..."
    echo "=========================="
    echo ""
    
    run_basic_test
    run_scenario_tests
    run_custom_test "I need help with my water bill"
    run_custom_test "There's a broken streetlight on my block"
    run_custom_test "I need food assistance programs"
    
    echo "✅ All tests completed!"
}

# Function to show help
show_help() {
    echo "Usage: $0 [command]"
    echo ""
    echo "Commands:"
    echo "  basic       Run basic SMS test"
    echo "  scenarios   Run all scenario tests (pothole, emergency, community)"
    echo "  custom      Run custom message test with default message"
    echo "  all         Run all tests"
    echo "  help        Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 basic"
    echo "  $0 scenarios"
    echo "  $0 custom"
    echo "  $0 all"
    echo ""
    echo "For custom messages, edit the script or use npm directly:"
    echo "  npm run test-sms advanced --custom=\"Your message here\""
}

# Main script logic
case "$1" in
    "basic")
        run_basic_test
        ;;
    "scenarios")
        run_scenario_tests
        ;;
    "custom")
        run_custom_test
        ;;
    "all")
        run_all_tests
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    "")
        echo "No command specified. Use '$0 help' for usage information."
        echo ""
        show_help
        ;;
    *)
        echo "Unknown command: $1"
        echo "Use '$0 help' for usage information."
        exit 1
        ;;
esac
