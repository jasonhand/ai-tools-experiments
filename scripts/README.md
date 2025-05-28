# YouTube Data Fetch Scripts

This directory contains scripts to fetch YouTube video data and update the todo.md file with accurate publication dates and other metadata.

## Scripts Overview

### fetch_youtube_data_no_api.py

This script fetches YouTube video data without requiring an API key. It uses web scraping to extract publication dates and other information from YouTube video pages.

**Dependencies:**
- Python 3
- BeautifulSoup4
- Requests

**How it works:**
1. Reads all MDX files in the src/pages/episodes directory to extract YouTube video IDs
2. Fetches metadata (especially publication dates) for each video from YouTube
3. Updates the todo.md file with the fetched dates and status information

### fetch_youtube_data.py

This is a more robust version that uses the official YouTube Data API. It requires an API key from Google.

**Dependencies:**
- Python 3
- Google API Client (`google-api-python-client`)

**How it works:**
Similar to the no-API version but uses the official API for more accurate and reliable data.

### run_youtube_data_fetch.sh

A convenience script that:
1. Checks for required Python dependencies and installs them if missing
2. Makes sure the Python scripts are executable
3. Runs the no-API version of the script
4. Reports success or failure

## How to Use

### Option 1: Using the Shell Script (Recommended)

Simply run the shell script from the project root directory:

```bash
./scripts/run_youtube_data_fetch.sh
```

This will automatically check for dependencies, install them if needed, and run the script.

### Option 2: Running the Python Script Directly

For the no-API version:

```bash
python3 scripts/fetch_youtube_data_no_api.py
```

For the API version (requires a YouTube API key):

```bash
python3 scripts/fetch_youtube_data.py YOUR_API_KEY
```

## Obtaining a YouTube API Key (Optional)

If you want to use the API version:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the YouTube Data API v3
4. Create credentials for an API key
5. Use that key when running the script

## Notes

- The no-API version is slower and might be less reliable, but it doesn't require any API keys
- YouTube has rate limits for scraping, so the script includes delays to avoid being blocked
- If the script fails to fetch data for some videos, try running it again later
- The API version is faster and more reliable but requires an API key and has quota limits
