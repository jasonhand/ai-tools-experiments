# Process Transcript - Claude Implementation

This is the actual implementation of the process-transcript slash command for Claude AI.

## Command: /episode_builder

When this command is executed with an episode number, YouTube URL, and Streamyard ID (e.g., `/episode_builder ep39 https://youtu.be/DmodEkDvcTU sy_unique_id_here`), Claude should:

### Step 1: Validate Input
- Check that the episode number is provided and in correct format (epXX)
- Check that the YouTube URL is provided and extract the video ID
- Check that the Streamyard unique ID is provided
- Verify that the transcript file exists in `/transcripts/<episode-number>.txt`

### Step 2: Download Streamyard Thumbnail
- Use the Streamyard unique ID to construct the thumbnail URL: `https://storage.googleapis.com/streamyard-app/media/<unique_id>/poster.jpg`
- Download the image using curl and save it to `public/images/sy_thumbnails/<episode-number>.jpg`
- Verify the download was successful
- Update the heroImg path in the frontmatter to use `/images/sy_thumbnails/<episode-number>.jpg`

### Step 3: Read and Analyze Transcript
- Read the full transcript content
- Extract key information including:
  - Main topic and themes discussed
  - Participants/speakers (from **Speaker Name:** patterns)
  - Tools and technologies mentioned
  - Key insights and learning points
  - Timestamps for chapter markers
  - Resources or links mentioned

### Step 4: Generate Content File
Create `src/content/episodes/<episode-number>.mdx` with:
- **ONLY frontmatter** following the established schema (NO transcript content):
  ```yaml
  ---
  title: "Generated title based on content"
  description: "2-3 sentence summary for meta tags"
  heroImg: "/images/sy_thumbnails/<episode-number>.jpg"
  videoId: "EXTRACTED_VIDEO_ID"
  episodeNumber: <number>
  date: "YYYY-MM-DDTHH:mm:ss.sssZ"
  author: "jasonhand24@gmail.com"
  participants: ["Jason Hand", "Other Speaker"]
  tags: ["relevant", "tags", "extracted"]
  
  takeaways:
    - text: "Key insight from episode"
      tools: ["Tool Name", "Technology"]
    - text: "Another key insight"
      tools: ["Another Tool", "Technology"]
  
  resources:
    - name: "Resource Name"
      url: "https://example.com"
      description: "Description of resource"
      type: "platform" # or "tool", "documentation", "article", "video", "repository"
    - name: "Another Resource"
      url: "https://example.com"
      description: "Description of another resource"
      type: "tool"
  
  jumpTo:
    - title: "Chapter Title"
      url: "https://youtu.be/VIDEO_ID?t=SECONDS"
      timestamp: "HH:MM:SS"
    - title: "Another Chapter"
      url: "https://youtu.be/VIDEO_ID?t=SECONDS"
      timestamp: "HH:MM:SS"

  summary: "A comprehensive paragraph summary that will be displayed prominently after the hero section on the episode page. This should capture the essence of the episode, main topics discussed, key tools/technologies mentioned, and the value viewers will get from watching. This replaces the old 'Episode Summary' heading approach."
  ---
  ```

**CRITICAL REQUIREMENTS**:
- The MDX file contains ONLY the frontmatter above - NO transcript content
- The `summary` field is REQUIRED and will be displayed as the main episode description paragraph 
- The `description` field is for meta tags only
- All resources must include the `type` field
- JumpTo URLs should use youtu.be format with ?t= parameter for timestamps
- The layout component handles displaying the summary in the episode-content div

### Step 5: Generate Astro Page
Create `src/pages/episodes/<episode-number>.astro` with:
```astro
---
import ContentCollectionEpisodeLayout from '../../layouts/ContentCollectionEpisodeLayout.astro';
import { getEntry } from 'astro:content';

const episode = await getEntry('episodes', '<episode-number>');
---

<ContentCollectionEpisodeLayout episode={episode} />
```

### Step 6: Test Build
After creating both files, run `npm run build` to ensure:
- Schema validation passes
- All required fields are present
- Layout renders correctly
- No TypeScript errors

### Step 7: Provide Summary
Report on what was successfully created:
- `public/images/sy_thumbnails/<episode-number>.jpg` - Downloaded Streamyard thumbnail
- `src/content/episodes/<episode-number>.mdx` - Episode metadata file
- `src/pages/episodes/<episode-number>.astro` - Episode page route
- Build status (successful/failed)
- Any issues that need to be resolved

## Notes for Claude:
- **CRITICAL**: The MDX file contains ONLY frontmatter metadata - NO transcript content
- The `summary` field is displayed as the main paragraph after the hero section (no heading needed)
- The `description` field is only for meta tags, not display
- The Streamyard thumbnail must be downloaded before creating the MDX file so the correct heroImg path can be used
- Ensure the `public/images/sy_thumbnails/` directory exists before downloading the image
- The heroImg path in the frontmatter should be `/images/sy_thumbnails/<episode-number>.jpg` (without "public" prefix as that's the web root)
- **IMPORTANT**: Before creating new episode files, read an existing episode page (for example ep53) to understand:
  - The exact frontmatter structure and field formatting
  - How takeaways are written and formatted
  - How resources are organized and described
  - The style and tone used for titles, descriptions, and summaries
  - How chapter markers are titled and timestamped
  - Any patterns or conventions used across episodes
- Use these existing episodes as templates to ensure consistency in structure, style, and formatting
- Transcript files are in `.txt` format, not `.md` format
- Focus on educational value and extracting actionable insights
- Be accurate with technical terms and tool names
- Generate professional, engaging content that matches the project's tone
- Always test the build after creating files to catch schema validation errors
- The layout component (ContentCollectionEpisodeLayout) handles all display logic
- Summary text appears inside the episode-content div for proper styling
- JumpTo timestamps should be converted to YouTube ?t= parameters
- All resources require a `type` field for proper categorization