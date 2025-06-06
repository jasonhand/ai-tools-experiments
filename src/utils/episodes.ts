export interface Episode {
    number: number;
    title: string;
    description: string;
    heroImg: string;
    date: string;
    tags: string[];
    videoId?: string;
    author?: string;
}

export interface EpisodeWithTakeaways extends Episode {
    takeaways: string[];
}

// Function to extract takeaways from MDX content
function extractTakeawaysFromContent(content: string): string[] {
    let takeaways: string[] = [];
    
    // Find the "Key Takeaways" section
    const keyTakeawaysMatch = content.match(/## Key Takeaways\s*\n([\s\S]*?)(?=\n##|$)/);
    
    if (keyTakeawaysMatch) {
        const takeawaysSection = keyTakeawaysMatch[1];
        
        // Extract bullet points (lines starting with -)
        const bulletMatches = takeawaysSection.match(/^- (.+)$/gm);
        
        if (bulletMatches) {
            bulletMatches.forEach(match => {
                // Remove the "- " prefix and clean up the text
                const takeaway = match.replace(/^- /, '').trim();
                if (takeaway) {
                    takeaways.push(takeaway);
                }
            });
        }
    }
    
    // Fallback: if no takeaways found, generate basic ones from tags and content
    if (takeaways.length === 0) {
        // Try to extract tags from frontmatter for fallback
        const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        let tags: string[] = [];
        
        if (frontmatterMatch) {
            const frontmatterContent = frontmatterMatch[1];
            const tagsMatch = frontmatterContent.match(/Tags:\s*\[(.*?)\]/);
            if (tagsMatch) {
                tags = tagsMatch[1]
                    .split(',')
                    .map(tag => tag.trim().replace(/"/g, ''))
                    .filter(tag => tag.length > 0);
            }
        }
        
        // Generate fallback takeaways
        takeaways = [
            `Explores practical applications of ${tags[0] || 'AI tools'} in development workflows`,
            "Demonstrates real-world implementation examples and best practices",
            "Provides insights into modern developer productivity and tool adoption"
        ];
    }
    
    return takeaways;
}

// Function to parse simple YAML frontmatter
function parseFrontmatter(frontmatterContent: string): any {
    const frontmatter: any = {};
    
    frontmatterContent.split('\n').forEach(line => {
        const match = line.match(/^(\w+):\s*(.+)$/);
        if (match) {
            const [, key, value] = match;
            if (key === 'Tags') {
                // Parse array format: ["tag1", "tag2"]
                const tagsMatch = value.match(/\[(.*)\]/);
                if (tagsMatch) {
                    frontmatter[key] = tagsMatch[1]
                        .split(',')
                        .map(tag => tag.trim().replace(/"/g, ''))
                        .filter(tag => tag.length > 0);
                } else {
                    frontmatter[key] = [];
                }
            } else {
                frontmatter[key] = value.replace(/"/g, '');
            }
        }
    });
    
    return frontmatter;
}

// New function to get episodes with real takeaways
export async function getAllEpisodesWithTakeaways(): Promise<EpisodeWithTakeaways[]> {
    // Get all episode MDX files with raw content
    const episodeFiles = await import.meta.glob('../pages/episodes/*.mdx', { 
        query: '?raw', 
        import: 'default' 
    });
    
    const episodes: EpisodeWithTakeaways[] = [];

    for (const path in episodeFiles) {
        try {
            // Get the raw content
            const rawContent = await episodeFiles[path]() as string;
            
            // Extract frontmatter
            const frontmatterMatch = rawContent.match(/^---\n([\s\S]*?)\n---/);
            if (!frontmatterMatch) continue;
            
            // Parse frontmatter
            const frontmatter = parseFrontmatter(frontmatterMatch[1]);
            
            if (frontmatter.EpisodeNumber) {
                // Extract takeaways from the content
                const takeaways = extractTakeawaysFromContent(rawContent);
                
                episodes.push({
                    number: parseInt(frontmatter.EpisodeNumber),
                    title: frontmatter.Title || '',
                    description: frontmatter.Description || '',
                    heroImg: frontmatter.HeroImg || '',
                    date: frontmatter.Date || '',
                    tags: frontmatter.Tags || [],
                    videoId: frontmatter.VideoID,
                    author: frontmatter.Author,
                    takeaways: takeaways
                });
            }
        } catch (error) {
            console.error(`Error processing episode file ${path}:`, error);
        }
    }

    // Sort by episode number (descending - newest first)
    return episodes.sort((a, b) => b.number - a.number);
}

export async function getAllEpisodes(): Promise<Episode[]> {
    // Get all episode MDX files
    const episodeFiles = await import.meta.glob('../pages/episodes/*.mdx');
    const episodes: Episode[] = [];

    for (const path in episodeFiles) {
        const module = await episodeFiles[path]() as any;
        const frontmatter = module.frontmatter;
        
        if (frontmatter && frontmatter.EpisodeNumber) {
            episodes.push({
                number: parseInt(frontmatter.EpisodeNumber),
                title: frontmatter.Title,
                description: frontmatter.Description,
                heroImg: frontmatter.HeroImg,
                date: frontmatter.Date,
                tags: frontmatter.Tags || [],
                videoId: frontmatter.VideoID,
                author: frontmatter.Author
            });
        }
    }

    // Sort by episode number (descending - newest first)
    return episodes.sort((a, b) => b.number - a.number);
}

export async function getFeaturedEpisode(): Promise<Episode | null> {
    const episodes = await getAllEpisodes();
    return episodes.length > 0 ? episodes[0] : null;
}

export async function getEpisodeByNumber(episodeNumber: number): Promise<Episode | null> {
    const episodes = await getAllEpisodes();
    return episodes.find(ep => ep.number === episodeNumber) || null;
}

export function getAllTags(episodes: Episode[]): string[] {
    const allTags = episodes.flatMap(episode => episode.tags);
    return [...new Set(allTags)].sort();
} 