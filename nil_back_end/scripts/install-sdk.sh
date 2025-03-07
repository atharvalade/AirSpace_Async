#!/bin/bash

# Script to install the =nil; SDK

echo "Installing =nil; SDK..."

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "Error: npm is not installed. Please install Node.js and npm first."
    exit 1
fi

# Install the SDK
npm install @nil-foundation/sdk

# Check if installation was successful
if [ $? -eq 0 ]; then
    echo "=nil; SDK installed successfully!"
    echo "You can now run 'npm run create-account' to create a new smart account and top it up with tokens."
else
    echo "Error: Failed to install =nil; SDK."
    echo "Please check your internet connection and try again."
    exit 1
fi 