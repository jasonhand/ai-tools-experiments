import { defineCollection, z } from 'astro:content';

// Define the schema for the transcripts collection
const transcriptsCollection = defineCollection({
  type: 'content',
  // Schema defines the structure and types for transcript frontmatter/metadata
  schema: z.object({
    // Optional title that can be extracted from HTML or provided directly
    title: z.string().optional(),
    // Optional date for when the episode was recorded
    date: z.string().or(z.date()).optional(),
    // Optional array of tags for categorization
    tags: z.array(z.string()).optional(),
    // Optional YouTube ID for embedding
    youtubeId: z.string().optional(),
    // Optional thumbnail path
    thumbnail: z.string().optional(),
    // Optional description or summary
    description: z.string().optional(),
  }),
});

// Export the collections object with all defined collections
export const collections = {
  'transcripts': transcriptsCollection,
};
