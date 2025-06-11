#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class QuizDatasetUpdater {
    constructor() {
        this.episodesDir = path.join(__dirname, 'src/content/episodes');
        this.datasetPath = path.join(__dirname, 'public/quiz-dataset.json');
    }

    extractFrontmatter(content) {
        const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
        if (!match) return null;
        
        try {
            return yaml.load(match[1]);
        } catch (error) {
            console.error('Error parsing YAML:', error);
            return null;
        }
    }

    extractTakeaways() {
        const files = fs.readdirSync(this.episodesDir).filter(file => file.endsWith('.mdx'));
        const allTakeaways = [];
        
        files.forEach(file => {
            const filePath = path.join(this.episodesDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const frontmatter = this.extractFrontmatter(content);
            
            if (frontmatter && frontmatter.takeaways) {
                frontmatter.takeaways.forEach(takeaway => {
                    allTakeaways.push({
                        episode: frontmatter.episodeNumber,
                        title: frontmatter.title,
                        text: takeaway.text,
                        tools: takeaway.tools || [],
                        tags: frontmatter.tags || []
                    });
                });
            }
        });
        
        return allTakeaways;
    }

    generateQuizQuestions(takeaways) {
        const questions = [];
        
        takeaways.forEach((takeaway, index) => {
            // Generate multiple choice question
            const mcq = {
                id: `mcq_${takeaway.episode}_${index + 1}`,
                type: 'multiple-choice',
                episode: takeaway.episode,
                question: this.generateMCQuestion(takeaway),
                options: this.generateMCOptions(takeaway, takeaways),
                correctAnswer: 0,
                explanation: takeaway.text,
                tools: takeaway.tools,
                tags: takeaway.tags
            };
            questions.push(mcq);
            
            // Generate true/false question if applicable
            if (this.canGenerateTrueFalse(takeaway)) {
                const tfq = {
                    id: `tf_${takeaway.episode}_${index + 1}`,
                    type: 'true-false',
                    episode: takeaway.episode,
                    question: this.generateTFQuestion(takeaway),
                    correctAnswer: true,
                    explanation: takeaway.text,
                    tools: takeaway.tools,
                    tags: takeaway.tags
                };
                questions.push(tfq);
            }
            
            // Generate fill-in-the-blank if applicable
            if (this.canGenerateFillBlank(takeaway)) {
                const fibq = {
                    id: `fib_${takeaway.episode}_${index + 1}`,
                    type: 'fill-in-blank',
                    episode: takeaway.episode,
                    question: this.generateFIBQuestion(takeaway),
                    correctAnswer: this.extractKeyword(takeaway),
                    explanation: takeaway.text,
                    tools: takeaway.tools,
                    tags: takeaway.tags
                };
                questions.push(fibq);
            }
        });
        
        return questions;
    }

    generateMCQuestion(takeaway) {
        const text = takeaway.text || '';
        
        if (text.includes('is a')) {
            return `What is ${takeaway.tools[0] || 'the tool mentioned'}?`;
        } else if (text.includes('allows') || text.includes('provides')) {
            return `What does ${takeaway.tools[0] || 'this tool'} provide or allow?`;
        } else if (text.includes('when') || text.includes('make sure')) {
            return `What should you do when working with ${takeaway.tools[0] || 'this tool'}?`;
        } else {
            return `Based on Episode ${takeaway.episode}, which statement is correct about ${takeaway.tools[0] || 'the discussed topic'}?`;
        }
    }

    generateMCOptions(takeaway, allTakeaways) {
        const options = [takeaway.text];
        
        const otherTakeaways = allTakeaways
            .filter(t => t.episode !== takeaway.episode && t.tools.some(tool => takeaway.tools.includes(tool)))
            .slice(0, 2);
        
        otherTakeaways.forEach(other => {
            options.push(other.text);
        });
        
        while (options.length < 4) {
            options.push(`This is not the correct approach for ${takeaway.tools[0] || 'this tool'}`);
        }
        
        return options.slice(0, 4);
    }

    canGenerateTrueFalse(takeaway) {
        const text = (takeaway.text || '').toLowerCase();
        return text.includes('is ') || text.includes('allows') || text.includes('provides') || 
               text.includes('can ') || text.includes('will ') || text.includes('should');
    }

    generateTFQuestion(takeaway) {
        return takeaway.text;
    }

    canGenerateFillBlank(takeaway) {
        return takeaway.tools && takeaway.tools.length > 0 && takeaway.text && takeaway.text.includes(takeaway.tools[0]);
    }

    generateFIBQuestion(takeaway) {
        const tool = takeaway.tools[0];
        return (takeaway.text || '').replace(tool, '____');
    }

    extractKeyword(takeaway) {
        return takeaway.tools[0] || '';
    }

    updateDataset() {
        console.log('🔄 Updating quiz dataset...');
        
        const takeaways = this.extractTakeaways();
        const questions = this.generateQuizQuestions(takeaways);

        const quizDataset = {
            metadata: {
                version: "1.0",
                generated: new Date().toISOString(),
                totalQuestions: questions.length,
                episodes: [...new Set(takeaways.map(t => t.episode))].sort((a, b) => a - b),
                tools: [...new Set(takeaways.flatMap(t => t.tools))].sort()
            },
            questions: questions
        };

        fs.writeFileSync(this.datasetPath, JSON.stringify(quizDataset, null, 2));
        
        console.log(`✅ Generated ${questions.length} quiz questions from ${takeaways.length} takeaways across ${quizDataset.metadata.episodes.length} episodes`);
        console.log(`📁 Quiz dataset updated at: ${this.datasetPath}`);
        
        return quizDataset;
    }

    watchForChanges() {
        console.log(`👀 Watching for changes in ${this.episodesDir}...`);
        
        fs.watch(this.episodesDir, { recursive: true }, (eventType, filename) => {
            if (filename && filename.endsWith('.mdx')) {
                console.log(`📝 Detected change in ${filename}`);
                setTimeout(() => {
                    this.updateDataset();
                }, 1000); // Debounce updates
            }
        });
        
        console.log('🚀 File watcher started. Press Ctrl+C to stop.');
    }
}

// CLI Interface
const updater = new QuizDatasetUpdater();

const command = process.argv[2];

switch (command) {
    case 'watch':
        updater.updateDataset(); // Initial update
        updater.watchForChanges();
        break;
    case 'update':
        updater.updateDataset();
        break;
    default:
        console.log('Usage:');
        console.log('  node update-quiz-dataset.js update  - Update the dataset once');
        console.log('  node update-quiz-dataset.js watch   - Watch for changes and auto-update');
        break;
}