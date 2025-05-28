#!/usr/bin/env python3
"""
MDX Date Updater Script

This script updates the Date fields in episode MDX files based on the 
YouTube date verification results from todo.md.

Usage: python update_episode_dates.py
"""

import os
import re

def parse_youtube_dates_from_todo():
    """Extract episode dates from the YouTube verification table in todo.md."""
    with open('todo.md', 'r', encoding='utf-8') as f:
        todo_content = f.read()
    
    # Find the YouTube date verification table
    table_section_start = todo_content.find("### YouTube Date Verification")
    if table_section_start == -1:
        print("Error: Could not find YouTube Date Verification section in todo.md")
        return {}
        
    # Extract the table content
    table_content = todo_content[table_section_start:]
    
    # Find the beginning of the table
    table_start = table_content.find("| Episode")
    if table_start == -1:
        print("Error: Could not find table header in YouTube Date Verification section")
        return {}
        
    # Find the end of the table (looking for next section or end of content)
    next_section = table_content.find("##", table_start)
    if next_section == -1:
        table_end = len(table_content)
    else:
        table_end = next_section
    
    # Extract the table rows
    table_rows = table_content[table_start:table_end].strip().split('\n')
    
    # Skip header and separator rows
    data_rows = table_rows[2:]
    
    dates = {}
    print("Extracting YouTube dates from table...")
    
    for row in data_rows:
        if '|' not in row:
            continue
            
        parts = [p.strip() for p in row.split('|')]
        if len(parts) < 6:
            continue
            
        episode = parts[1].strip()
        current_date = parts[3].strip()
        youtube_date = parts[4].strip()  # The YouTube date is actually in column 4
        
        # Check if this is a date mismatch entry
        if "Date mismatch" in youtube_date:
            # Extract the actual date from parentheses
            match = re.search(r'Update to (\d{4}-\d{2}-\d{2})', youtube_date)
            if match:
                actual_date = match.group(1)
                print(f"Found date mismatch for {episode}: Current={current_date}, YouTube={actual_date}")
                dates[episode] = actual_date
            else:
                print(f"Warning: Could not extract YouTube date for {episode} from '{youtube_date}'")
        else:
            print(f"No date mismatch for {episode}")
    
    return dates

def update_episode_mdx_files(dates):
    """Update Date fields in episode MDX files with the correct YouTube dates."""
    episodes_dir = os.path.join('src', 'pages', 'episodes')
    updated_count = 0
    skipped_count = 0
    
    for episode, date in dates.items():
        mdx_file = os.path.join(episodes_dir, f"{episode}.mdx")
        
        if not os.path.exists(mdx_file):
            print(f"Warning: MDX file not found for {episode}")
            skipped_count += 1
            continue
        
        try:
            with open(mdx_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Find the Date field in the frontmatter
            date_pattern = re.compile(r'Date:\s*"([^"]+)"')
            match = date_pattern.search(content)
            
            if match:
                current_date = match.group(1)
                
                if current_date == date:
                    print(f"{episode}: Date already matches YouTube date ({date}), no update needed")
                    skipped_count += 1
                else:
                    # Update the Date field
                    updated_content = content.replace(match.group(0), f'Date: "{date}"')
                    
                    with open(mdx_file, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
                        
                    print(f"{episode}: Updated Date from {current_date} to {date}")
                    updated_count += 1
            else:
                # If no Date field exists, add it after the Title field
                title_pattern = re.compile(r'Title:\s*"([^"]+)"')
                title_match = title_pattern.search(content)
                
                if title_match:
                    # Insert Date field after the Title field
                    title_line = title_match.group(0)
                    updated_content = content.replace(title_line, f'{title_line}\nDate: "{date}"')
                    
                    with open(mdx_file, 'w', encoding='utf-8') as f:
                        f.write(updated_content)
                        
                    print(f"{episode}: Added Date field with value {date}")
                    updated_count += 1
                else:
                    print(f"Warning: Could not find Title field in {episode}.mdx to add Date")
                    skipped_count += 1
                    
        except Exception as e:
            print(f"Error updating {episode}.mdx: {e}")
            skipped_count += 1
    
    return updated_count, skipped_count

def main():
    print("Parsing YouTube dates from todo.md...")
    dates = parse_youtube_dates_from_todo()
    
    if not dates:
        print("No dates found. Exiting.")
        return
        
    print(f"Found {len(dates)} episodes with YouTube dates.")
    
    print("\nUpdating episode MDX files...")
    updated, skipped = update_episode_mdx_files(dates)
    
    print(f"\nSummary: Updated {updated} files, skipped {skipped} files")
    
    if updated > 0:
        print("\nDon't forget to check off items 2 and 3 in the 'YouTube Date Verification Task' section in todo.md!")
    
if __name__ == "__main__":
    main()
