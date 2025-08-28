# AI Tools Lab Project Rules Document

This document serves as a rules file and project requirements guide for Claude and other AI assistants working on the AI Tools Lab project. It establishes guidelines, standards, and context to maintain consistency across sessions.

## Project Overview

AI Tools Lab is a website documenting technical demonstrations of AI-related developer tools. It contains:
- Episode pages with notes, resources, and transcripts
- Resource library with curated articles
- Dictionary for AI-related terms
- Observations page capturing insights
- About page with project information

The site aims to help developers navigate the AI era through discussions, demos, and firsthand experiences with AI tools.

## Site Structure

- **Main Page (`index.html`)**: Lists all episodes with filtering capabilities
- **Episode Pages (`ep*.html`)**: Individual pages for each tool demo with:
  - Summary
  - Video link/embed
  - Chapter markers (timestamps)
  - Resources section
  - Key takeaways
  - Full transcript
- **Resources Page**: Curated collection of articles and tools
- **Dictionary**: AI terminology explained
- **Observations**: Insights gathered across episodes

## Directory Structure

- `pages/`: HTML files (index.html, resources.html, ep*.html, etc.)
- `images/`: Image assets
- `resources/`: Resource content
- `transcripts/`: Full episode transcripts
- `styles.css`: Main stylesheet
- `script.js`: JavaScript functionality
- `dictionary/`: Dictionary content

## Formatting Standards

### Episode Pages
- Consistent header structure (h1 for title, h2 for sections)
- Summary paragraph at the top
- Video container with YouTube thumbnail
- Jump To section with timestamp links
- Resources section with relevant links
- Key Takeaways as bullet points
- Full transcript with speaker names in bold and timestamps

### Transcripts
- Format: `[00:00:00] **Speaker Name:** Text content`
- Empty line between speaker segments
- Timestamps at the beginning of each speaker change
- Speaker names in bold

### HTML Structure
- Standard header with navigation
- Main content in container div
- Footer with site information
- Consistent class naming

## Adding New Content

### New Episodes
1. Create a new HTML file in `pages/` named `epXX.html`
2. Add corresponding transcript file in `transcripts/` named `epXX-transcript.md`
3. Update link in `pages/index.html`
4. Follow existing episode format structure

### New Resources
1. Update resource cards in `resources.html`
2. Add thumbnails to `images/` if needed

## Technical Guidelines

### Markdown Formatting
- Use markdown formatting for transcripts
- Keep consistent indentation
- Preserve speaker attribution format
- Maintain empty lines between speakers

### HTML Editing
- Maintain existing class names
- Keep consistent indentation
- Follow the established structure for episode pages

### JavaScript
- Use existing filtering and navigation functions
- Maintain compatibility with existing event handlers

## Content Guidelines

### Episode Format
- ~30-40 minute technical demonstrations
- Hands-on experiences with AI-related tools
- Focus on practical usage examples
- Include key takeaways
- Provide relevant resources

### Transcripts
- Full verbatim transcription
- Maintain all speaker attributions
- Include all timestamps
- Keep natural conversational flow

## Data Privacy & Security

- Do not include sensitive information in transcripts
- Avoid sharing API keys or credentials
- Respect attribution and licensing for external resources

## Episode Content Schema Requirements

When creating episode content files (`src/content/episodes/epXX.mdx`), ensure all data follows the Astro content schema defined in `src/content/config.ts`:

### Resource Types
Resources must use one of these valid type values:
- `tool` - Software tools and applications
- `documentation` - Official docs, guides, manuals
- `article` - Blog posts, news articles, reports
- `video` - Video content and tutorials
- `repository` - Code repositories and GitHub projects
- `platform` - Services, platforms, and websites

### URL Requirements
- All URLs must be valid, complete URLs (not `#` or empty)
- Use placeholder URLs like `https://example.com` for unavailable resources rather than invalid URLs

### Takeaway Categories (Optional)
- `technical` - Technical insights and findings
- `strategic` - Business and strategic considerations
- `workflow` - Process and workflow improvements
- `productivity` - Productivity gains and optimizations
- `accessibility` - Accessibility and usability insights

### Priority Levels (Optional)
- `high` - Critical insights
- `medium` - Important insights
- `low` - Nice-to-know insights

## LLM Usage in This Project

AI Tools Lab itself leverages LLMs (Large Language Models) like Claude for several aspects of the project workflow:

1. **Transcript Processing**:
   - Cleaning up and formatting raw transcripts into proper markdown format
   - Ensuring consistent speaker attribution and timestamp formatting
   - Fixing transcription errors or unclear segments

2. **Content Generation**:
   - Summarizing transcripts to create concise episode summaries
   - Extracting and formulating key takeaways from episode discussions
   - Identifying and listing relevant resources mentioned in episodes
   - Generating timestamps and chapter markers for video navigation

3. **HTML Generation**:
   - Creating new episode HTML files from transcript content
   - Updating existing HTML with new information
   - Ensuring consistent formatting across pages

4. **Resource Management**:
   - Reading markdown files containing resource URLs
   - Generating or updating the resources.html page
   - Organizing resources into appropriate categories

5. **Content Continuity**:
   - Maintaining project context across editing sessions
   - Following established patterns and conventions
   - Ensuring consistency in formatting and structure

When using LLMs for this project, provide clear instructions about which specific task you're working on, and refer to this document for guidelines and standards.

## Running Locally

To test the site locally, use Python's built-in HTTP server:

```bash
python -m http.server
```

Then visit http://localhost:8000 in your browser.

## Project Goals

1. Educate on new AI technologies, tools, and processes
2. Build credibility and thought leadership
3. Share knowledge about developer tools in the AI space
4. Document firsthand experiences with emerging tools

---

This document will be maintained and updated throughout the project lifecycle. When working on this project, please refer to this document to ensure consistency and alignment with project requirements.