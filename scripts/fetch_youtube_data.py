#!/usr/bin/env python3
"""
YouTube Data Fetcher

This script fetches information from YouTube for videos based on their IDs.
It then outputs the data in a format ready to be incorporated into the todo.md file.

Usage: python fetch_youtube_data.py API_KEY
"""

import sys
import os
import re
import json
import datetime
from urllib.request import urlopen
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError

def get_video_ids_from_mdx_files(base_path):
    """Extract video IDs from MDX files in the episodes directory."""
    video_ids = {}
    episodes_path = os.path.join(base_path, 'src', 'pages', 'episodes')
    
    if not os.path.exists(episodes_path):
        print(f"Error: Directory not found: {episodes_path}")
        return video_ids
    
    # Regular expression to match VideoID field in MDX frontmatter
    video_id_pattern = re.compile(r'VideoID:\s*"([^"]+)"')
    
    for filename in sorted(os.listdir(episodes_path)):
        if filename.endswith('.mdx') and filename.startswith('ep'):
            file_path = os.path.join(episodes_path, filename)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    match = video_id_pattern.search(content)
                    if match:
                        video_id = match.group(1)
                        episode_name = os.path.splitext(filename)[0]
                        video_ids[episode_name] = video_id
            except Exception as e:
                print(f"Error reading {filename}: {e}")
    
    return video_ids

def get_youtube_video_details(api_key, video_ids):
    """Fetch video details from YouTube API."""
    youtube = build('youtube', 'v3', developerKey=api_key)
    
    # Process videos in batches to minimize API calls
    batch_size = 50  # YouTube API allows up to 50 IDs per request
    results = {}
    
    # Convert dict values to a list
    video_id_list = list(video_ids.values())
    
    for i in range(0, len(video_id_list), batch_size):
        batch = video_id_list[i:i+batch_size]
        
        try:
            response = youtube.videos().list(
                part="snippet,statistics,contentDetails",
                id=",".join(batch)
            ).execute()
            
            for item in response.get('items', []):
                video_id = item['id']
                snippet = item.get('snippet', {})
                statistics = item.get('statistics', {})
                content_details = item.get('contentDetails', {})
                
                # Find the episode name for this video ID
                episode_name = next((ep for ep, vid in video_ids.items() if vid == video_id), None)
                
                if episode_name:
                    published_at = snippet.get('publishedAt')
                    if published_at:
                        # Convert to datetime object
                        pub_date = datetime.datetime.fromisoformat(published_at.replace('Z', '+00:00'))
                        formatted_date = pub_date.strftime('%Y-%m-%d')
                    else:
                        formatted_date = "Unknown"
                        
                    results[episode_name] = {
                        'video_id': video_id,
                        'title': snippet.get('title', 'Unknown'),
                        'description': snippet.get('description', 'No description'),
                        'published_at': formatted_date,
                        'view_count': statistics.get('viewCount', 'N/A'),
                        'duration': content_details.get('duration', 'Unknown')
                    }
        
        except HttpError as e:
            print(f"An HTTP error occurred: {e}")
            break
    
    return results

def update_todo_md(base_path, video_data):
    """Update the todo.md file with the fetched YouTube data."""
    todo_path = os.path.join(base_path, 'todo.md')
    
    if not os.path.exists(todo_path):
        print(f"Error: File not found: {todo_path}")
        return
    
    try:
        with open(todo_path, 'r', encoding='utf-8') as f:
            todo_content = f.read()
        
        # Find the YouTube Date Verification table
        table_pattern = re.compile(r'(### YouTube Date Verification.*?)\n\n', re.DOTALL)
        match = table_pattern.search(todo_content)
        
        if not match:
            print("Error: Could not find YouTube Date Verification table in todo.md")
            return
            
        table_section = match.group(1)
        
        # Process each row in the table
        rows = table_section.split('\n')
        header_rows = rows[:2]  # Keep the header and separator lines
        data_rows = []
        
        for row in rows[2:]:  # Skip header and separator lines
            if '|' not in row:
                continue
                
            parts = [p.strip() for p in row.split('|')]
            if len(parts) < 6 or not parts[1]:  # Check for empty or invalid rows
                continue
                
            episode_name = parts[1].strip()
            if episode_name in video_data:
                data = video_data[episode_name]
                current_date = parts[3].strip()
                youtube_date = data['published_at']
                
                # Check for date mismatch
                status = "Date match" if current_date == youtube_date else f"Date mismatch (YouTube: {youtube_date})"
                
                # Create updated row
                updated_row = f"| {episode_name} | {data['video_id']} | {current_date} | {youtube_date} | {status} |"
                data_rows.append(updated_row)
            else:
                data_rows.append(row)  # Keep existing row if no data found
        
        # Create updated table
        updated_table = '\n'.join(header_rows + data_rows)
        
        # Replace the old table with the updated one
        updated_content = todo_content.replace(table_section, updated_table)
        
        # Write the updated content back to todo.md
        with open(todo_path, 'w', encoding='utf-8') as f:
            f.write(updated_content)
            
        print(f"Successfully updated todo.md with YouTube data for {len(video_data)} videos.")
        
    except Exception as e:
        print(f"Error updating todo.md: {e}")

def main():
    if len(sys.argv) != 2:
        print("Usage: python fetch_youtube_data.py API_KEY")
        sys.exit(1)
        
    api_key = sys.argv[1]
    base_path = os.getcwd()
    
    print("Fetching video IDs from MDX files...")
    video_ids = get_video_ids_from_mdx_files(base_path)
    
    if not video_ids:
        print("No video IDs found. Exiting.")
        sys.exit(1)
        
    print(f"Found {len(video_ids)} video IDs.")
    
    print("Fetching data from YouTube API...")
    video_data = get_youtube_video_details(api_key, video_ids)
    
    if not video_data:
        print("No data retrieved from YouTube API. Exiting.")
        sys.exit(1)
        
    print(f"Retrieved data for {len(video_data)} videos.")
    
    print("Updating todo.md...")
    update_todo_md(base_path, video_data)

if __name__ == "__main__":
    main()
