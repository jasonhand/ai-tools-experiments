#!/usr/bin/env python3
"""
YouTube Data Fetcher (No API Key Required)

This script fetches basic information from YouTube videos based on their IDs without requiring an API key.
It uses web scraping to get the publication date of YouTube videos from their pages.
The script then outputs the data in a format ready to be incorporated into the todo.md file.

Usage: python fetch_youtube_data_no_api.py
"""

import os
import re
import json
import datetime
import time
import urllib.request
import urllib.parse
import requests
from bs4 import BeautifulSoup

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

def get_youtube_video_details(video_ids):
    """Fetch video details from YouTube pages using scraping."""
    results = {}
    total_videos = len(video_ids)
    current_video = 0
    
    for episode_name, video_id in video_ids.items():
        current_video += 1
        print(f"Processing video {current_video}/{total_videos}: {episode_name} (ID: {video_id})")
        
        video_url = f"https://www.youtube.com/watch?v={video_id}"
        
        try:
            # Use a User-Agent to avoid being blocked
            headers = {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
            response = requests.get(video_url, headers=headers)
            
            if response.status_code == 200:
                soup = BeautifulSoup(response.text, 'html.parser')
                
                # Try to find the publication date in meta tags
                publish_date = None
                for meta in soup.find_all('meta'):
                    if meta.get('itemprop') == 'datePublished':
                        publish_date = meta.get('content')
                        break
                
                if not publish_date:
                    # Look for the publication date in the page content
                    date_pattern = re.search(r'"publishDate":"([^"]+)"', response.text)
                    if date_pattern:
                        publish_date = date_pattern.group(1)
                
                # Format the date if found
                formatted_date = "Unknown"
                if publish_date:
                    try:
                        # Handle different date formats
                        if 'T' in publish_date:
                            # ISO format like 2023-04-26T14:30:00
                            pub_date = datetime.datetime.fromisoformat(publish_date.replace('Z', '+00:00'))
                            formatted_date = pub_date.strftime('%Y-%m-%d')
                        else:
                            # Other format like 2023-04-26
                            formatted_date = publish_date.split(' ')[0]  # Just take the date part
                    except Exception as e:
                        print(f"  Error parsing date {publish_date}: {e}")
                
                # Try to get the title
                title = "Unknown Title"
                title_tag = soup.find('title')
                if title_tag:
                    # YouTube titles usually end with " - YouTube"
                    title = title_tag.text.replace(' - YouTube', '')
                
                results[episode_name] = {
                    'video_id': video_id,
                    'title': title,
                    'published_at': formatted_date,
                }
                
                print(f"  Found data: {formatted_date} - {title}")
            else:
                print(f"  Error: Could not fetch video page. Status code: {response.status_code}")
            
            # Be nice to YouTube and don't hammer their servers
            time.sleep(1)
            
        except Exception as e:
            print(f"  Error processing {video_id}: {e}")
    
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
        table_pattern = re.compile(r'(### YouTube Date Verification.*?)(?=\n\n|\Z)', re.DOTALL)
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
    base_path = os.getcwd()
    
    print("Fetching video IDs from MDX files...")
    video_ids = get_video_ids_from_mdx_files(base_path)
    
    if not video_ids:
        print("No video IDs found. Exiting.")
        return
        
    print(f"Found {len(video_ids)} video IDs.")
    
    print("Fetching data from YouTube pages...")
    video_data = get_youtube_video_details(video_ids)
    
    if not video_data:
        print("No data retrieved from YouTube. Exiting.")
        return
        
    print(f"Retrieved data for {len(video_data)} videos.")
    
    print("Updating todo.md...")
    update_todo_md(base_path, video_data)
    print("Done!")

if __name__ == "__main__":
    main()
