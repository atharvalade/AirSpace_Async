#!/bin/bash

# Script to add ~/.local/bin to PATH and check for nil CLI

# Add ~/.local/bin to PATH for this session
export PATH="$HOME/.local/bin:$PATH"

echo "Added ~/.local/bin to PATH for this session"

# Check if nil CLI is now accessible
if command -v nil &> /dev/null; then
    echo "Success! The nil CLI is now accessible."
    echo "Running 'nil help' to verify:"
    nil help
else
    echo "Error: nil CLI is still not accessible."
    echo "Please check if it was installed correctly at ~/.local/bin/nil"
    echo "You might need to restart your terminal or run: source ~/.bashrc (or ~/.zshrc)"
    exit 1
fi

# Check if user wants to add this to their shell profile
read -p "Do you want to add ~/.local/bin to your PATH permanently? (y/n): " add_to_profile

if [[ "$add_to_profile" == "y" || "$add_to_profile" == "Y" ]]; then
    # Detect shell
    SHELL_NAME=$(basename "$SHELL")
    
    if [[ "$SHELL_NAME" == "bash" ]]; then
        PROFILE_FILE="$HOME/.bashrc"
    elif [[ "$SHELL_NAME" == "zsh" ]]; then
        PROFILE_FILE="$HOME/.zshrc"
    else
        echo "Unsupported shell: $SHELL_NAME"
        echo "Please manually add the following line to your shell profile:"
        echo 'export PATH="$HOME/.local/bin:$PATH"'
        exit 0
    fi
    
    # Check if PATH already contains ~/.local/bin
    if grep -q "export PATH=\"\$HOME/.local/bin:\$PATH\"" "$PROFILE_FILE"; then
        echo "PATH already contains ~/.local/bin in $PROFILE_FILE"
    else
        # Add to profile
        echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$PROFILE_FILE"
        echo "Added ~/.local/bin to PATH in $PROFILE_FILE"
        echo "Please run: source $PROFILE_FILE"
    fi
else
    echo "No changes made to your shell profile."
    echo "Remember to run this command in new terminal sessions:"
    echo 'export PATH="$HOME/.local/bin:$PATH"'
fi

echo ""
echo "You can now run the wallet setup script:"
echo "npm run wallet-setup" 