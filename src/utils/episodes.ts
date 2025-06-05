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