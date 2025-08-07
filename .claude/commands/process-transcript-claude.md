# Process Transcript - Claude Implementation

This is the actual implementation of the process-transcript slash command for Claude AI.

## Command: /process-transcript

When this command is executed with an episode number and YouTube URL (e.g., `/process-transcript ep39 https://youtu.be/DmodEkDvcTU`), Claude should:

### Step 1: Validate Input
- Check that the episode number is provided and in correct format (epXX)
- Check that the YouTube URL is provided and extract the video ID
- Verify that the transcript file exists in `/transcripts/<episode-number>.md`

### Step 2: Read and Analyze Transcript
- Read the full transcript content
- Extract key information including:
  - Main topic and themes discussed
  - Participants/speakers (from **Speaker Name:** patterns)
  - Tools and technologies mentioned
  - Key insights and learning points
  - Timestamps for chapter markers
  - Resources or links mentioned

### Step 3: Generate Content File
Create `src/content/episodes/<episode-number>.mdx` with:
- **Frontmatter** following the established schema:
  ```yaml
  ---
  title: "Generated title based on content"
  description: "2-3 sentence summary"
  heroImg: "../images/thumbnails/default.png"
  videoId: "EXTRACTED_VIDEO_ID"
  episodeNumber: <number>
  date: "YYYY-MM-DDTHH:mm:ss.sssZ"
  author: "jasonhand24@gmail.com"
  participants: ["Jason Hand", "Other Speaker"]
  tags: ["relevant", "tags", "extracted"]
  
  takeaways:
    - text: "Key insight from episode"
      tools: ["Tool Name", "Technology"]
  
  resources:
    - name: "Resource Name"
      url: "https://example.com"
      description: "Description of resource"
  
  jumpTo:
    - title: "Chapter Title"
      url: "https://www.youtube.com/watch?v=VIDEO_ID&t=SECONDS"
      timestamp: "HH:MM:SS"
  ---
  ```

### Step 4: Generate Astro Page
Create `src/pages/episodes/<episode-number>.astro` with:
```astro
---
import { getEntry } from 'astro:content';
import ContentCollectionEpisodeLayout from '../../layouts/ContentCollectionEpisodeLayout.astro';

const episode = await getEntry('episodes', '<episode-number>');

if (!episode) {
  throw new Error('Episode <episode-number> not found');
}
---

<ContentCollectionEpisodeLayout episode={episode} />
```

### Step 5: Provide Summary
- List what files were created
- Mention any missing information (like video ID) that needs to be added later
- Suggest next steps for completing the episode

## Notes for Claude:
- Use existing episodes (like ep38) as templates for structure and style
- Focus on educational value and extracting actionable insights
- Be accurate with technical terms and tool names
- Generate professional, engaging content that matches the project's tone