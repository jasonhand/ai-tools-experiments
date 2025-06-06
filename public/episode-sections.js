// Automatically apply section classes to episode content based on headings
document.addEventListener('DOMContentLoaded', function() {
    console.log('Episode sections script loaded');
    
    // Wait a moment for content to fully render
    setTimeout(() => {
        // Find ALL h2 elements on the page (not just in episode-content)
        const headings = document.querySelectorAll('h2');
        console.log('Found headings:', headings.length);
        
        headings.forEach((heading, index) => {
            const headingText = heading.textContent.toLowerCase().trim();
            let nextElement = heading.nextElementSibling;
            
            // Skip whitespace text nodes
            while (nextElement && nextElement.nodeType === 3) {
                nextElement = nextElement.nextElementSibling;
            }
            
            console.log(`Heading ${index}: "${headingText}", Next element:`, nextElement?.tagName);
            
            // Apply classes based on heading content
            if (headingText.includes('jump to') && nextElement && nextElement.tagName === 'UL') {
                nextElement.classList.add('section-jump-to');
                console.log('✅ Applied section-jump-to class');
            }
            else if (headingText.includes('resources') && nextElement && nextElement.tagName === 'UL') {
                nextElement.classList.add('section-resources');
                console.log('✅ Applied section-resources class');
            }
            else if ((headingText.includes('key takeaways') || headingText.includes('takeaways')) && nextElement && nextElement.tagName === 'UL') {
                nextElement.classList.add('section-takeaways');
                console.log('✅ Applied section-takeaways class');
            }
            else if (headingText.includes('full transcript')) {
                heading.classList.add('section-transcript-header');
                console.log('✅ Applied section-transcript-header class');
                
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
                    console.log('✅ Applied section-transcript class');
                }
            }
        });
        
        // Apply summary styling - find content between Summary and Jump To headers
        const summaryHeader = Array.from(headings).find(h => h.textContent.toLowerCase().includes('summary'));
        const jumpToHeader = Array.from(headings).find(h => h.textContent.toLowerCase().includes('jump to'));
        
        if (summaryHeader && jumpToHeader) {
            console.log('Found Summary and Jump To headers, collecting content between them');
            
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
                
                console.log(`✅ Created summary container with ${summaryElements.length} elements`);
            }
        } else {
            console.log('Could not find both Summary and Jump To headers, trying to find summary content automatically...');
            
            // Try to find summary content automatically
            // Look for the first few paragraphs in the episode content that might be summary
            const episodeContent = document.querySelector('.episode-content .markdown-content');
            if (episodeContent) {
                const jumpToList = episodeContent.querySelector('.section-jump-to');
                if (jumpToList) {
                    console.log('Found Jump To list, looking for content before it...');
                    
                    const summaryElements = [];
                    let currentElement = episodeContent.firstElementChild;
                    
                    // Collect paragraphs before the Jump To section
                    while (currentElement && !currentElement.classList.contains('section-jump-to')) {
                        if (currentElement.tagName === 'P' && currentElement.textContent.trim().length > 50) {
                            summaryElements.push(currentElement);
                        }
                        currentElement = currentElement.nextElementSibling;
                    }
                    
                    // Only create summary container if we found substantial content
                    if (summaryElements.length > 0 && summaryElements.length <= 3) {
                        console.log(`Found ${summaryElements.length} potential summary paragraphs`);
                        
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
                        
                        console.log(`✅ Created automatic summary container with ${summaryElements.length} elements`);
                    }
                }
            }
        }
        
        // If no transcript header was found, try to find transcript content directly
        const existingTranscript = document.querySelector('.section-transcript');
        if (!existingTranscript) {
            console.log('No transcript header found, searching for transcript content...');
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
                    console.log('✅ Found and marked transcript content without header:', element);
                    console.log('Content preview:', text.substring(0, 150) + '...');
                    break;
                }
            }
        }
        
        console.log('🎉 Episode sections styling complete!');
    }, 500); // Wait 500ms for content to fully load
}); 