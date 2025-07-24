#!/bin/bash

# Script validation for update.sh
# This script checks the syntax and basic functionality of update.sh

echo "Validating update.sh script..."

# Check if file exists
if [[ ! -f "update.sh" ]]; then
    echo "ERROR: update.sh not found"
    exit 1
fi

# Check bash syntax
echo "Checking bash syntax..."
if bash -n update.sh; then
    echo "✓ Syntax check passed"
else
    echo "✗ Syntax errors found"
    exit 1
fi

# Check for required functions
echo "Checking required functions..."
required_functions=(
    "show_help"
    "parse_arguments" 
    "log"
    "error"
    "success"
    "warning"
    "check_prerequisites"
    "create_backup"
    "restore_backup"
    "update_dependencies"
    "build_application"
    "update_database"
    "health_check"
    "cleanup"
    "main_update"
)

for func in "${required_functions[@]}"; do
    if grep -q "^${func}()" update.sh; then
        echo "✓ Function $func found"
    else
        echo "✗ Function $func missing"
        exit 1
    fi
done

# Check for Ubuntu-specific optimizations
echo "Checking Ubuntu optimizations..."
ubuntu_features=(
    "apt-get"
    "systemctl"
    "ubuntu"
    "DEBIAN_FRONTEND"
    "NodeSource"
)

for feature in "${ubuntu_features[@]}"; do
    if grep -q "$feature" update.sh; then
        echo "✓ Ubuntu feature $feature found"
    else
        echo "? Ubuntu feature $feature not found (may be optional)"
    fi
done

# Test help function
echo "Testing help function..."
if bash update.sh --help | grep -q "Velink Update System"; then
    echo "✓ Help function works"
else
    echo "✗ Help function failed"
    exit 1
fi

echo "✅ All validation checks passed!"
echo "Script is ready for Ubuntu deployment"
