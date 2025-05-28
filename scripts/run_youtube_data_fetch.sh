#!/bin/bash

# Run YouTube Data Fetcher Script (No API Version)
# This shell script runs the fetch_youtube_data_no_api.py script
# and handles any missing dependencies by installing them automatically.

# Function to check if a Python package is installed
check_package() {
  python3 -c "import $1" 2>/dev/null
  return $?
}

# Make sure we're in the project root directory
cd "$(dirname "$0")/.."

echo "Checking for required Python packages..."

# Check for BeautifulSoup
if ! check_package "bs4"; then
  echo "Installing BeautifulSoup4..."
  pip3 install beautifulsoup4
fi

# Check for requests
if ! check_package "requests"; then
  echo "Installing requests..."
  pip3 install requests
fi

# Make the Python script executable
chmod +x scripts/fetch_youtube_data_no_api.py

echo "Running YouTube data fetcher script..."
python3 scripts/fetch_youtube_data_no_api.py

if [ $? -eq 0 ]; then
  echo "YouTube data fetch completed successfully!"
else
  echo "Error: YouTube data fetch failed."
  exit 1
fi
