// Modern Transcript Interface

document.addEventListener('DOMContentLoaded', function() {
    
    // Wait for episode-sections.js to apply classes
    setTimeout(() => {
        
        // Look for the transcript section that episode-sections.js created
        let transcriptSection = document.querySelector('.section-transcript');
        
        if (!transcriptSection) {
            // Try to find the transcript header and its next sibling
            const transcriptHeader = document.querySelector('.section-transcript-header');
            if (transcriptHeader) {
                transcriptSection = transcriptHeader.nextElementSibling;
                if (transcriptSection) {
                    transcriptSection.classList.add('section-transcript');
                }
            }
        }
        
        if (!transcriptSection) {
            // Last resort - look for any element that might contain transcript content
            // But exclude the main episode-content container to avoid replacing everything
            const possibleSections = document.querySelectorAll('div:not(.episode-content), pre, code, .transcript');
            for (let section of possibleSections) {
                const text = section.textContent.toLowerCase();
                // Look for common transcript indicators - be more specific
                if ((text.includes('[00:') || text.includes('(00:') || 
                     text.includes('00:00') || text.includes('0:00')) &&
                    text.length > 200 && // Must be substantial content
                    !section.classList.contains('episode-content') && // Don't select the main container
                    !section.querySelector('.video-container') && // Don't select containers with video
                    !section.querySelector('h1, h2, h3')) { // Don't select containers with headers
                    transcriptSection = section;
                    transcriptSection.classList.add('section-transcript');
                    break;
                }
            }
        }
        
        if (!transcriptSection) {
            // Try one more aggressive search
            const allElements = document.querySelectorAll('*');
            for (let element of allElements) {
                const text = element.textContent;
                if (text.includes('[00:00:') && text.includes('**') && text.length > 500) {
                    
                    // Use this element as transcript section
                    transcriptSection = element;
                    transcriptSection.classList.add('section-transcript');
                    break;
                }
            }
            
            if (!transcriptSection) {
                return;
            }
        }

        // Create the new transcript structure
        createTranscriptInterface(transcriptSection);
        
        // Initialize functionality
        initializeTranscriptControls();
        
        // Attach timestamp handlers after a short delay to ensure content is rendered
        setTimeout(() => {
            attachTimestampHandlers();
        }, 100);
    }, 600); // Wait 600ms for episode-sections.js to finish (it waits 500ms)
});

function createTranscriptInterface(transcriptSection) {
    // Hide any existing transcript headers to avoid duplicates
    // Only hide headers that are specifically transcript-related and not the main content
    const transcriptHeaders = document.querySelectorAll('.section-transcript-header');
    transcriptHeaders.forEach(header => {
        header.style.display = 'none';
    });
    
    // Remove any existing transcript navigation controls (Top/Bottom buttons)
    const transcriptNavigation = document.querySelectorAll('.transcript-navigation');
    transcriptNavigation.forEach(nav => {
        nav.remove();
    });
    
    // Also hide any h2 that immediately precedes this transcript section
    const parentElement = transcriptSection.parentElement;
    if (parentElement) {
        const previousSibling = transcriptSection.previousElementSibling;
        if (previousSibling && previousSibling.tagName === 'H2' && 
            previousSibling.textContent.toLowerCase().includes('full transcript')) {
            previousSibling.style.display = 'none';
        }
    }
    
    // Get the original transcript content
    const originalContent = transcriptSection.innerHTML;
    
    // Create new structure
    transcriptSection.innerHTML = `
        <div class="transcript-header">
            <h3>Full Transcript</h3>
            <span class="transcript-toggle">▼</span>
        </div>
        <div class="transcript-content">
            <div class="transcript-controls">
                <input type="text" class="transcript-search" placeholder="Search transcript..." />
            </div>
            <div class="transcript-text transcript-bubble-mode" id="transcript-text">
            </div>
        </div>
    `;
    
    // Process transcript content and add entries individually
    const transcriptTextContainer = transcriptSection.querySelector('#transcript-text');
    
    const entries = processTranscriptEntries(originalContent);
    
    if (entries.length === 0) {
        transcriptTextContainer.innerHTML = '<div class="transcript-entry"><div class="speech-bubble">No transcript content found or unable to parse.</div></div>';
        return;
    }
    
    entries.forEach((entry, index) => {
        const entryElement = createTranscriptEntry(entry, index);
        transcriptTextContainer.appendChild(entryElement);
    });
    
    // Start collapsed
    transcriptSection.classList.add('transcript-collapsed');
    
    // Add event listeners after creating the HTML
    const header = transcriptSection.querySelector('.transcript-header');
    
    if (header) {
        header.addEventListener('click', toggleTranscript);
        header.style.cursor = 'pointer';
    }
    
    // Initialize controls and timestamp handlers
    setTimeout(() => {
        initializeTranscriptControls();
    }, 100);
}

function processTranscriptEntries(content) {
    
    // Remove any existing styling and structure
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;
    
    // Extract text content and process it
    let textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    // Clean up the text content for better readability
    textContent = cleanTranscriptText(textContent);
    
    // Split into entries based on timestamps or natural breaks
    const entries = parseTranscriptEntries(textContent);
    
    return entries;
}

function createTranscriptEntry(entry, index) {
    
    const entryDiv = document.createElement('div');
    entryDiv.className = 'transcript-entry';
    
    if (entry.timestamp && entry.speaker && entry.text) {
        entryDiv.classList.add('speaker-entry');
        
        // Create timestamp element
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.setAttribute('data-time', entry.timestamp);
        timestampSpan.textContent = entry.timestamp;
        
        // Create speech bubble
        const speechBubble = document.createElement('div');
        speechBubble.className = 'speech-bubble';
        
        // Create speaker name
        const speakerName = document.createElement('strong');
        speakerName.className = 'speaker-name';
        speakerName.textContent = entry.speaker + ':';
        
        // Format text with bold markdown
        const formattedText = entry.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        
        speechBubble.appendChild(speakerName);
        speechBubble.innerHTML += ' ' + formattedText;
        
        entryDiv.appendChild(timestampSpan);
        entryDiv.appendChild(speechBubble);
        
    } else if (entry.timestamp && entry.text) {
        entryDiv.classList.add('timestamp-entry');
        
        // Create timestamp element
        const timestampSpan = document.createElement('span');
        timestampSpan.className = 'timestamp';
        timestampSpan.setAttribute('data-time', entry.timestamp);
        timestampSpan.textContent = entry.timestamp;
        
        // Create speech bubble
        const speechBubble = document.createElement('div');
        speechBubble.className = 'speech-bubble';
        
        // Format text with bold markdown
        const formattedText = entry.text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        speechBubble.innerHTML = formattedText;
        
        entryDiv.appendChild(timestampSpan);
        entryDiv.appendChild(speechBubble);
        
    } else {
        entryDiv.classList.add('text-entry');
        
        // Create speech bubble
        const speechBubble = document.createElement('div');
        speechBubble.className = 'speech-bubble';
        
        // Format text with bold markdown
        const formattedText = (entry.text || entry).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        speechBubble.innerHTML = formattedText;
        
        entryDiv.appendChild(speechBubble);
    }
    
    return entryDiv;
}

function cleanTranscriptText(text) {
    // Remove excessive whitespace and normalize line breaks
    text = text.replace(/\s+/g, ' '); // Replace multiple spaces with single space
    text = text.replace(/\n\s*\n/g, '\n'); // Remove empty lines
    text = text.replace(/\r\n/g, '\n'); // Normalize line endings
    text = text.replace(/\r/g, '\n'); // Convert remaining carriage returns
    
    // Remove excessive line breaks (more than 2 consecutive)
    text = text.replace(/\n{3,}/g, '\n\n');
    
    // Clean up around timestamps
    text = text.replace(/\n+(\[?\d{1,2}:\d{2})/g, '\n$1'); // Single line before timestamps
    text = text.replace(/(\[?\d{1,2}:\d{2}[^\]]*\]?)\s*\n+/g, '$1 '); // Single space after timestamps
    
    // Remove trailing/leading whitespace
    text = text.trim();
    
    // Fix spacing around punctuation
    text = text.replace(/\s+([,.!?;:])/g, '$1'); // Remove space before punctuation
    text = text.replace(/([,.!?;:])\s*/g, '$1 '); // Single space after punctuation
    
    // Fix capitalization after periods
    text = text.replace(/\.\s+([a-z])/g, (match, letter) => '. ' + letter.toUpperCase());
    
    return text;
}

function parseTranscriptEntries(text) {
    
    // Pattern to match: [timestamp] **Speaker Name:** followed by text
    // Example: [00:00:42] **Ryan MacLean:** some text here
    // Also handles spaced timestamps like [00: 00: 42]
    const speakerPattern = /\[(\d{1,2}:\s*\d{2}(?::\s*\d{2})?)\]\s*\*\*([^*]+?)\*\*:?\s*/g;
    
    // Split the text by speaker segments
    const segments = text.split(speakerPattern);
    
    const entries = [];
    
    // Process segments - every 3rd element starting from index 1 contains: timestamp, speaker, text
    for (let i = 1; i < segments.length; i += 3) {
        const timestamp = segments[i];
        const speaker = segments[i + 1];
        const speakerText = segments[i + 2];
        
        if (timestamp && speaker && speakerText) {
            // Clean up the speaker text
            let cleanText = speakerText.trim();
            cleanText = cleanText.replace(/\s+/g, ' '); // Normalize whitespace
            cleanText = cleanText.replace(/^\s*:?\s*/, ''); // Remove leading colon if present
            
            if (cleanText.length > 5) {
                
                // Split very long speaker segments for better readability
                if (cleanText.length > 800) {
                    const sentences = cleanText.split(/(?<=[.!?])\s+/);
                    let currentChunk = '';
                    
                    sentences.forEach((sentence, index) => {
                        if (currentChunk.length + sentence.length < 600) {
                            currentChunk += (currentChunk ? ' ' : '') + sentence;
                        } else {
                            if (currentChunk) {
                                entries.push({
                                    timestamp: timestamp,
                                    speaker: speaker.trim(),
                                    text: currentChunk.trim()
                                });
                            }
                            currentChunk = sentence;
                        }
                    });
                    
                    if (currentChunk) {
                        entries.push({
                            timestamp: timestamp,
                            speaker: speaker.trim(),
                            text: currentChunk.trim()
                        });
                    }
                } else {
                    entries.push({
                        timestamp: timestamp,
                        speaker: speaker.trim(),
                        text: cleanText
                    });
                }
            }
        }
    }
    
    // If no speaker segments found, try fallback patterns
    if (entries.length === 0) {
        
        // Fallback: try to find just timestamps without speaker names
        const timestampPattern = /\[(\d{1,2}:\s*\d{2}(?::\s*\d{2})?)\]/g;
        const timestampMatches = [...text.matchAll(timestampPattern)];
        
        if (timestampMatches.length > 0) {
            
            timestampMatches.forEach((match, i) => {
                const timestamp = match[1];
                const timestampIndex = match.index;
                
                // Get text after this timestamp until next timestamp
                const nextMatch = timestampMatches[i + 1];
                const endIndex = nextMatch ? nextMatch.index : text.length;
                const afterText = text.substring(timestampIndex + match[0].length, endIndex).trim();
                
                if (afterText.length > 10) {
                    entries.push({
                        timestamp: timestamp,
                        text: afterText
                    });
                }
            });
            
            return entries;
        }
        
        // Final fallback: split into paragraphs
        const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim().length > 30);
        return paragraphs.map(p => ({ text: p.trim() }));
    }
    
    return entries;
}

function initializeTranscriptControls() {
    // Search functionality
    const searchInput = document.querySelector('.transcript-search');
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            searchTranscript(this.value);
        });
    }
    
    // Initialize timestamp handlers
    attachTimestampHandlers();
}

function attachTimestampHandlers() {
    // Find all timestamps (with or without data-time attribute)
    const timestamps = document.querySelectorAll('.timestamp');
    
    if (timestamps.length === 0) {
        return;
    }
    
    timestamps.forEach((timestamp, index) => {
        // Set data-time attribute if not present
        if (!timestamp.dataset.time) {
            timestamp.dataset.time = timestamp.textContent.trim();
        }
        
        // Remove any existing click handlers to avoid duplicates
        const newTimestamp = timestamp.cloneNode(true);
        timestamp.parentNode.replaceChild(newTimestamp, timestamp);
        
        // Add click handler
        newTimestamp.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            jumpToTime(this.dataset.time);
        });
        
        // Style as clickable
        newTimestamp.style.cursor = 'pointer';
        newTimestamp.style.userSelect = 'none';
    });
}

function toggleTranscript() {
    const transcriptSection = document.querySelector('.section-transcript');
    
    if (!transcriptSection) {
        return;
    }
    
    const isCollapsed = transcriptSection.classList.contains('transcript-collapsed');
    
    if (isCollapsed) {
        transcriptSection.classList.remove('transcript-collapsed');
        transcriptSection.classList.add('transcript-expanded');
    } else {
        transcriptSection.classList.add('transcript-collapsed');
        transcriptSection.classList.remove('transcript-expanded');
    }
}

function searchTranscript(query) {
    const transcriptText = document.getElementById('transcript-text');
    if (!transcriptText) return;
    
    // Remove existing highlights
    const existingHighlights = transcriptText.querySelectorAll('mark');
    existingHighlights.forEach(mark => {
        const parent = mark.parentNode;
        parent.replaceChild(document.createTextNode(mark.textContent), mark);
        parent.normalize();
    });
    
    if (!query.trim()) {
        // Re-attach timestamp handlers when search is cleared
        setTimeout(() => {
            attachTimestampHandlers();
        }, 50);
        return;
    }
    
    // Highlight new matches
    const entries = transcriptText.querySelectorAll('.transcript-entry .speech-bubble, .transcript-entry:not(:has(.speech-bubble))');
    let matchCount = 0;
    
    entries.forEach(entry => {
        const text = entry.textContent;
        const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
        
        if (regex.test(text)) {
            matchCount++;
            entry.innerHTML = text.replace(regex, '<mark>$1</mark>');
            
            // Scroll first match into view
            if (matchCount === 1) {
                entry.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
    
    // Re-attach timestamp handlers after search highlighting
    setTimeout(() => {
        attachTimestampHandlers();
    }, 50);
}

function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function jumpToTime(timestamp) {
    
    // Check if we have a YouTube video ID available
    const videoID = window.episodeVideoID;
    
    if (videoID && videoID !== 'undefined' && videoID !== '') {
        
        // Convert timestamp to seconds for YouTube URL
        const seconds = convertTimestampToSeconds(timestamp);
        
        if (seconds !== null) {
            // Create YouTube URL with timestamp
            const youtubeUrl = `https://www.youtube.com/watch?v=${videoID}&t=${seconds}s`;
            
            // Open in new tab
            window.open(youtubeUrl, '_blank');
            
            showNotification(`Opening YouTube at ${timestamp}`);
        } else {
            showNotification(`Invalid timestamp format: ${timestamp}`);
        }
    } else {
        // Fallback if no video ID available
        showNotification(`Timestamp: ${timestamp} (No video available)`);
    }
}

function convertTimestampToSeconds(timestamp) {
    
    // Remove any brackets and clean the timestamp, also remove spaces
    const cleanTimestamp = timestamp.replace(/[\[\]()]/g, '').trim().replace(/\s+/g, '');
    
    // Handle different timestamp formats
    // Examples: "1:23", "01:23", "1:23:45", "01:23:45", "00: 01: 00" -> "00:01:00"
    const timePattern = /^(\d{1,2}):(\d{2})(?::(\d{2}))?$/;
    const match = cleanTimestamp.match(timePattern);
    
    if (!match) {
        return null;
    }
    
    const hours = match[3] ? parseInt(match[1], 10) : 0;
    const minutes = match[3] ? parseInt(match[2], 10) : parseInt(match[1], 10);
    const seconds = match[3] ? parseInt(match[3], 10) : parseInt(match[2], 10);
    
    // Convert to total seconds
    const totalSeconds = (hours * 3600) + (minutes * 60) + seconds;
    
    return totalSeconds;
}

function showNotification(message) {
    // Create a simple notification
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: var(--primary-color);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 1000;
        font-size: 0.9rem;
        font-weight: 500;
        transition: all 0.3s ease;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
        notification.style.opacity = '1';
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        notification.style.opacity = '0';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Make functions globally available
window.toggleTranscript = toggleTranscript;
window.jumpToTime = jumpToTime; 