# Process Transcript Command

This command processes a transcription file from the `/transcripts` directory and creates all necessary files for a new episode in the AI Tools Lab project.

## Usage

```
/process-transcript <episode-number> <youtube-url>
```

Example: `/process-transcript ep39 https://youtu.be/DmodEkDvcTU`

## What it does

1. **Extracts YouTube video ID** from the provided URL (supports youtu.be and youtube.com formats)
2. **Reads the transcription file** from `/transcripts/<episode-number>.md`
3. **Extracts key information** including:
   - Episode title and description
   - Participants/speakers
   - Key takeaways
   - Resources mentioned
   - Chapter markers/timestamps
4. **Creates the content file** at `src/content/episodes/<episode-number>.mdx` with proper frontmatter
   - Uses `default.png` as the hero image (`../images/thumbnails/default.png`)
   - Includes the extracted YouTube video ID
5. **Creates the Astro page** at `src/pages/episodes/<episode-number>.astro`
6. **Updates the main index** to include the new episode

## File Structure Created

- `src/content/episodes/<episode-number>.mdx` - Episode content with metadata
- `src/pages/episodes/<episode-number>.astro` - Episode page route
- Updates to main navigation/index as needed

## Requirements

- Transcription file must exist in `/transcripts/<episode-number>.md`
- YouTube URL must be provided (supports youtu.be and youtube.com formats)
- Transcription must follow the standard format with timestamps and speaker names
- Episode number must be unique
- Default hero image (`default.png`) must exist in `src/images/thumbnails/`

## Implementation

The command uses AI assistance to:
- Analyze the transcript content
- Generate appropriate title and description
- Extract key takeaways and resources
- Create properly formatted frontmatter
- Generate chapter markers from timestamps