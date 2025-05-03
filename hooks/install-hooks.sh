#!/bin/bash

echo "Installing Git hooks..."

# Create .git/hooks directory if it doesn't exist
mkdir -p .git/hooks

# Copy the post-commit hook
cp hooks/post-commit .git/hooks/

# Make it executable
chmod +x .git/hooks/post-commit

echo "Git hooks installed successfully!"
echo "The post-commit hook will run tests automatically after each commit."
