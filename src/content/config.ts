import { defineCollection, z } from 'astro:content';

// Schema for individual takeaways
const takeawaySchema = z.object({
  text: z.string(),
  category: z.enum(['technical', 'strategic', 'workflow', 'productivity', 'accessibility']).optional(),
  tools: z.array(z.string()).optional(),
  priority: z.enum(['high', 'medium', 'low']).optional(),
});

// Schema for resources
const resourceSchema = z.object({
  name: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
  type: z.enum(['tool', 'documentation', 'article', 'video', 'repository', 'platform']).optional(),
  featured: z.boolean().default(false),
});

// Schema for jump-to sections
const jumpToSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  timestamp: z.string().optional(), // e.g., "00:05:30"
});

// Main episodes collection schema
const episodes = defineCollection({
  type: 'content',
  schema: z.object({
    // Basic episode metadata
    title: z.string(),
    description: z.string(),
    heroImg: z.string(),
    videoId: z.string().optional(),
    episodeNumber: z.number(),
    date: z.string(),
    author: z.string(),
    
    // Tags for categorization
    tags: z.array(z.string()),
    
    // Structured content
    takeaways: z.array(takeawaySchema),
    resources: z.array(resourceSchema),
    jumpTo: z.array(jumpToSchema).optional(),
    
    // Optional fields
    summary: z.string().optional(),
    featured: z.boolean().default(false),
    
    // Transcript metadata
    transcriptAvailable: z.boolean().default(true),
    transcriptContent: z.string().optional(),
  }),
});

export const collections = { episodes }; 