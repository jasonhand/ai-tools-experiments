#!/usr/bin/env node

/**
 * Process Transcript Command
 * 
 * This script processes a transcription file and creates all necessary files
 * for a new episode in the AI Tools Lab project.
 * 
 * Usage: node process-transcript.js <episode-number> <youtube-url>
 * Example: node process-transcript.js ep39 https://youtu.be/DmodEkDvcTU
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

// Get episode number and YouTube URL from command line arguments
const episodeNumber = process.argv[2];
const youtubeUrl = process.argv[3];

if (!episodeNumber || !youtubeUrl) {
  console.error('Error: Please provide both episode number and YouTube URL');
  console.error('Usage: node process-transcript.js <episode-number> <youtube-url>');
  console.error('Example: node process-transcript.js ep39 https://youtu.be/DmodEkDvcTU');
  process.exit(1);
}

// Validate episode number format
if (!episodeNumber.match(/^ep\d+$/)) {
  console.error('Error: Episode number must be in format "epXX" (e.g., ep39)');
  process.exit(1);
}

// Function to extract YouTube video ID from URL
function extractYouTubeVideoId(url) {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/watch\?.*v=([^&\n?#]+)/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
}

// Validate and extract YouTube video ID
const videoId = extractYouTubeVideoId(youtubeUrl);
if (!videoId) {
  console.error('Error: Invalid YouTube URL format');
  console.error('Supported formats:');
  console.error('  - https://youtu.be/VIDEO_ID');
  console.error('  - https://youtube.com/watch?v=VIDEO_ID');
  console.error('  - https://www.youtube.com/watch?v=VIDEO_ID');
  process.exit(1);
}

const transcriptPath = path.join(projectRoot, 'transcripts', `${episodeNumber}.md`);

// Check if transcript file exists
if (!fs.existsSync(transcriptPath)) {
  console.error(`Error: Transcript file not found: ${transcriptPath}`);
  process.exit(1);
}

console.log(`Processing transcript for ${episodeNumber}...`);
console.log(`YouTube URL: ${youtubeUrl}`);
console.log(`Extracted Video ID: ${videoId}`);
console.log(`Reading transcript from: ${transcriptPath}`);

// Read the transcript content
const transcriptContent = fs.readFileSync(transcriptPath, 'utf8');

console.log('Transcript loaded successfully!');
console.log('\nNext steps:');
console.log('1. Use Claude AI to analyze the transcript content');
console.log('2. Extract title, description, participants, takeaways, resources');
console.log('3. Create the content file at src/content/episodes/' + episodeNumber + '.mdx');
console.log('   - Hero image will use: ../images/thumbnails/default.png');
console.log('   - Video ID will be: ' + videoId);
console.log('4. Create the Astro page at src/pages/episodes/' + episodeNumber + '.astro');
console.log('5. Update navigation/index as needed');

console.log('\nTranscript preview (first 500 characters):');
console.log('='.repeat(50));
console.log(transcriptContent.substring(0, 500) + '...');
console.log('='.repeat(50));

// For now, this script just validates and shows the transcript
// The actual processing will be done by Claude AI through the slash command
console.log('\nUse Claude AI to complete the processing with the slash command:');
console.log(`/process-transcript ${episodeNumber} ${youtubeUrl}`);