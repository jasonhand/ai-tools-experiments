#!/bin/bash

# Run YouTube Data Fetcher Script using a dedicated virtual environment
# This approach avoids issues with externally managed Python environments

# Name of virtual environment
VENV_NAME="youtube_fetch_venv"

# Directory for virtual environment (relative to script location)
VENV_DIR="$(dirname "$0")/$VENV_NAME"

# Make sure we're in the project root directory
cd "$(dirname "$0")/.."

echo "Setting up Python virtual environment for YouTube data fetching..."

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "Error: Python 3 is required but not found."
    exit 1
fi

# Create virtual environment if it doesn't exist
if [ ! -d "$VENV_DIR" ]; then
    echo "Creating new Python virtual environment..."
    python3 -m venv "$VENV_DIR"
    if [ $? -ne 0 ]; then
        echo "Error: Failed to create virtual environment."
        exit 1
    fi
    echo "Virtual environment created successfully."
else
    echo "Using existing virtual environment."
fi

# Activate the virtual environment
echo "Activating virtual environment..."
# Check OS type for different activation commands
if [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    source "$VENV_DIR/Scripts/activate"
else
    # Unix/Linux/macOS
    source "$VENV_DIR/bin/activate"
fi

# Install required packages in the virtual environment
echo "Installing required packages..."
pip install beautifulsoup4 requests

# Make the Python script executable
chmod +x scripts/fetch_youtube_data_no_api.py

# Run the script
echo "Running YouTube data fetcher script..."
python scripts/fetch_youtube_data_no_api.py

# Store exit status
EXIT_STATUS=$?

# Deactivate the virtual environment
deactivate

if [ $EXIT_STATUS -eq 0 ]; then
    echo "YouTube data fetch completed successfully!"
    exit 0
else
    echo "Error: YouTube data fetch failed with exit code $EXIT_STATUS."
    exit $EXIT_STATUS
fi
