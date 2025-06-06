// Automatically apply section classes to episode content based on headings
document.addEventListener('DOMContentLoaded', function() {
    // Wait a moment for content to fully render
    setTimeout(() => {
        // Find ALL h2 elements on the page (not just in episode-content)
        const headings = document.querySelectorAll('h2');
        
        headings.forEach((heading, index) => {
            const headingText = heading.textContent.toLowerCase().trim();
            let nextElement = heading.nextElementSibling;
            
            // Skip whitespace text nodes
            while (nextElement && nextElement.nodeType === 3) {
                nextElement = nextElement.nextElementSibling;
            }
            
            // Apply classes based on heading content
            if (headingText.includes('jump to') && nextElement && nextElement.tagName === 'UL') {
                nextElement.classList.add('section-jump-to');
            }
            else if (headingText.includes('resources') && nextElement && nextElement.tagName === 'UL') {
                nextElement.classList.add('section-resources');
            }
            else if ((headingText.includes('key takeaways') || headingText.includes('takeaways')) && nextElement && nextElement.tagName === 'UL') {
                nextElement.classList.add('section-takeaways');
            }
            else if (headingText.includes('full transcript')) {
                heading.classList.add('section-transcript-header');
                
                // Look for transcript content
                let transcriptElement = nextElement;
                
                if (transcriptElement && transcriptElement.classList.contains('transcript-navigation')) {
                    transcriptElement = transcriptElement.nextElementSibling;
                    if (transcriptElement && transcriptElement.classList.contains('timestamp-note')) {
                        transcriptElement = transcriptElement.nextElementSibling;
                    }
                }
                
                if (transcriptElement && (transcriptElement.classList.contains('transcript') || transcriptElement.tagName === 'DIV')) {
                    transcriptElement.classList.add('section-transcript');
                }
            }
        });
        
        // Apply summary styling - find content between Summary and Jump To headers
        const summaryHeader = Array.from(headings).find(h => h.textContent.toLowerCase().includes('summary'));
        const jumpToHeader = Array.from(headings).find(h => h.textContent.toLowerCase().includes('jump to'));
        
        if (summaryHeader && jumpToHeader) {
            const summaryElements = [];
            let currentElement = summaryHeader.nextElementSibling;
            
            // Collect all elements between Summary and Jump To headers
            while (currentElement && currentElement !== jumpToHeader) {
                // Skip whitespace text nodes
                if (currentElement.nodeType === 1) {
                    summaryElements.push(currentElement);
                }
                currentElement = currentElement.nextElementSibling;
            }
            
            if (summaryElements.length > 0) {
                // Create a wrapper container for all summary content
                const summaryContainer = document.createElement('div');
                summaryContainer.classList.add('section-summary');
                
                // Insert the container before the first summary element
                const firstElement = summaryElements[0];
                firstElement.parentNode.insertBefore(summaryContainer, firstElement);
                
                // Move all summary elements into the container
                summaryElements.forEach(element => {
                    summaryContainer.appendChild(element);
                });
            }
        } else {
            
            // Try to find summary content automatically
            // Look for the first few paragraphs in the episode content that might be summary
            const episodeContent = document.querySelector('.episode-content .markdown-content');
            if (episodeContent) {
                // First, try to find Jump To section by looking for h2 with "Jump To" text
                const jumpToHeader = Array.from(episodeContent.querySelectorAll('h2')).find(h => 
                    h.textContent.toLowerCase().includes('jump to')
                );
                
                let jumpToElement = null;
                if (jumpToHeader) {
                    // Look for the UL that follows the Jump To header
                    let nextElement = jumpToHeader.nextElementSibling;
                    while (nextElement && nextElement.nodeType === 3) {
                        nextElement = nextElement.nextElementSibling;
                    }
                    if (nextElement && nextElement.tagName === 'UL') {
                        jumpToElement = nextElement;
                    }
                }
                
                // If we found the Jump To element, look for content before it
                if (jumpToElement) {
                    const summaryElements = [];
                    let currentElement = episodeContent.firstElementChild;
                    
                    // Collect paragraphs and lists before the Jump To section
                    while (currentElement && currentElement !== jumpToHeader) {
                        if ((currentElement.tagName === 'P' && currentElement.textContent.trim().length > 10) ||
                            (currentElement.tagName === 'UL' && currentElement.textContent.trim().length > 20)) {
                            summaryElements.push(currentElement);
                        }
                        currentElement = currentElement.nextElementSibling;
                    }
                    
                    // Only create summary container if we found substantial content
                    if (summaryElements.length > 0 && summaryElements.length <= 5) {
                        // Create a wrapper container for summary content
                        const summaryContainer = document.createElement('div');
                        summaryContainer.classList.add('section-summary');
                        
                        // Insert the container before the first summary element
                        const firstElement = summaryElements[0];
                        firstElement.parentNode.insertBefore(summaryContainer, firstElement);
                        
                        // Move summary elements into the container
                        summaryElements.forEach(element => {
                            summaryContainer.appendChild(element);
                        });
                    }
                } else {
                    
                    // Fallback: look for first few content elements that might be summary
                    const summaryElements = [];
                    let currentElement = episodeContent.firstElementChild;
                    let elementCount = 0;
                    
                    while (currentElement && elementCount < 5) {
                        if ((currentElement.tagName === 'P' && currentElement.textContent.trim().length > 10) ||
                            (currentElement.tagName === 'UL' && currentElement.textContent.trim().length > 20)) {
                            summaryElements.push(currentElement);
                            elementCount++;
                        }
                        currentElement = currentElement.nextElementSibling;
                    }
                    
                    if (summaryElements.length > 0 && summaryElements.length <= 3) {
                        // Create a wrapper container for summary content
                        const summaryContainer = document.createElement('div');
                        summaryContainer.classList.add('section-summary');
                        
                        // Insert the container before the first summary element
                        const firstElement = summaryElements[0];
                        firstElement.parentNode.insertBefore(summaryContainer, firstElement);
                        
                        // Move summary elements into the container
                        summaryElements.forEach(element => {
                            summaryContainer.appendChild(element);
                        });
                    }
                }
            }
        }
        
        // If no transcript header was found, try to find transcript content directly
        const existingTranscript = document.querySelector('.section-transcript');
        if (!existingTranscript) {
            const allElements = document.querySelectorAll('div, pre, code');
            
            for (let element of allElements) {
                const text = element.textContent.toLowerCase();
                // Look for transcript indicators but exclude the main episode container
                if ((text.includes('[00:') || text.includes('(00:') || text.includes('00:00')) &&
                    text.length > 300 && // Must be substantial content
                    !element.classList.contains('episode-content') && // Don't select main container
                    !element.querySelector('.video-container') && // Don't select video containers
                    !element.querySelector('h1, h2, h3, .section-jump-to, .section-resources')) { // Don't select other sections
                    
                    element.classList.add('section-transcript');
                    break;
                }
            }
        }
    }, 500); // Wait 500ms for content to fully load
}); 