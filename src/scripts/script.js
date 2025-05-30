document.addEventListener('DOMContentLoaded', function() {
    // Add visually-hidden class to all resource card titles
    const resourceCardTitles = document.querySelectorAll('.resource-card-content h2');
    resourceCardTitles.forEach(title => {
        title.classList.add('visually-hidden');
    });
    
    // Easter Egg functionality
    initializeEasterEgg();
    
    // Add play icons to any video containers that don't have them
    addPlayIconsToVideos();
    
    // Make video thumbnails clickable
    makeVideoContainersClickable();
    
    // Add bubbles to resource card images
    const resourceCardImages = document.querySelectorAll('.resource-card-image');
    resourceCardImages.forEach(imageContainer => {
        // Create 4 bubble elements
        for (let i = 0; i < 4; i++) {
            const bubble = document.createElement('div');
            bubble.className = 'bubble';
            imageContainer.appendChild(bubble);
        }
    });
    
    // Adjust paths for resources based on page location
    const isInPagesDir = window.location.pathname.includes('/pages/');
    const pathPrefix = isInPagesDir ? '../' : '';
    
    const form = document.getElementById('datadog-form');
    
    // Add automatic sorting for episode cards on the index page
    sortEpisodesByDate();
    
    // Make transcript timestamps clickable
    const makeTimestampsClickable = function() {
        // Get YouTube video ID from meta property or chapter markers
        let videoId = '';
        const chapterMarkers = document.querySelector('.chapter-markers');
        if (chapterMarkers) {
            const firstChapterLink = chapterMarkers.querySelector('a');
            if (firstChapterLink) {
                const href = firstChapterLink.getAttribute('href');
                if (href.includes('youtu.be/')) {
                    videoId = href.split('youtu.be/')[1].split('?')[0];
                } else if (href.includes('youtube.com/watch?v=')) {
                    videoId = href.split('v=')[1].split('&')[0];
                }
            }
        }
        
        if (!videoId) {
            const videoContainer = document.querySelector('.video-container a');
            if (videoContainer) {
                const href = videoContainer.getAttribute('href');
                if (href.includes('youtu.be/')) {
                    videoId = href.split('youtu.be/')[1].split('?')[0];
                } else if (href.includes('youtube.com/watch?v=')) {
                    videoId = href.split('v=')[1].split('&')[0];
                }
            }
        }
        
        if (!videoId) return;
        
        // Find all transcript timestamps
        const timestampElements = document.querySelectorAll('.transcript-timestamp');
        
        timestampElements.forEach(function(element) {
            const timestamp = element.textContent;
            // Extract time in [HH:MM:SS] format
            const timeMatch = timestamp.match(/\[(\d{2}):(\d{2}):(\d{2})\]/);
            
            if (timeMatch) {
                // Convert to seconds for YouTube t parameter
                const hours = parseInt(timeMatch[1], 10);
                const minutes = parseInt(timeMatch[2], 10);
                const seconds = parseInt(timeMatch[3], 10);
                const totalSeconds = hours * 3600 + minutes * 60 + seconds;
                
                // Create a wrapper link element
                const link = document.createElement('a');
                link.href = `https://youtu.be/${videoId}?t=${totalSeconds}`;
                link.target = '_blank';
                link.classList.add('timestamp-link');
                link.title = 'Click to watch this part of the video';
                
                // Add styling to show it's clickable
                element.style.cursor = 'pointer';
                element.style.color = '#0066cc';
                element.style.textDecoration = 'underline';
                
                // Replace the timestamp element with the link element
                const parent = element.parentNode;
                parent.insertBefore(link, element);
                link.appendChild(element);
            }
        });
    };
    
    // Run the timestamp conversion function
    makeTimestampsClickable();
    
    // Handle the feedback form
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const tool = document.getElementById('tool').value;
            const feedback = document.getElementById('feedback').value;
            
            // Create payload for Datadog
            const payload = {
                message: 'User Feedback Submission',
                ddsource: 'website',
                ddtags: `tool:${tool || 'not_specified'}`,
                hostname: window.location.hostname,
                service: 'ai-tools-website',
                status: 'info',
                user: {
                    name: name,
                    email: email
                },
                feedback: feedback,
                timestamp: new Date().toISOString()
            };
            
            // Send to Datadog Logs API via our proxy
            sendToDatadog(payload);
        });
    }
    
    function sendToDatadog(payload) {
        console.log('Preparing to send data to Datadog via proxy...');
        
        // Display sending state
        const submitButton = document.querySelector('#datadog-form button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = 'Sending...';
        submitButton.disabled = true;
        
        // Log what we're sending
        console.log('Payload being sent:', payload);

        // We'll use a proxy endpoint to avoid CORS issues
        // This requires deploying to Netlify with the serverless function
        let proxyUrl;
        
        // Determine if we're in development or production
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            // For local development testing (will be mocked)
            console.log('Development mode - simulating successful send');
            
            // Simulate a successful response after a delay
            setTimeout(() => {
                console.log('Development mode - simulated successful response');
                
                // Reset button
                submitButton.textContent = originalButtonText;
                submitButton.disabled = false;
                
                // Show success message and clear form
                alert('Feedback submitted (development mode)!');
                clearForm();
            }, 1000);
            
            return;
        } else {
            // For production - use the deployed Netlify function
            proxyUrl = '/api/datadog';
        }
        
        fetch(proxyUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify([payload])
        })
        .then(response => {
            console.log('Proxy response status:', response.status);
            
            // Try to get response text even if not OK
            return response.text().then(text => {
                console.log('Proxy response text:', text);
                
                // Try to parse as JSON if possible
                let jsonResponse = null;
                try {
                    jsonResponse = JSON.parse(text);
                } catch (e) {
                    // Not JSON, that's fine
                }
                
                return { 
                    ok: response.ok, 
                    status: response.status, 
                    text: text,
                    json: jsonResponse
                };
            });
        })
        .then(result => {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            
            if (result.ok) {
                console.log('Successfully sent to Datadog via proxy!');
                alert('Thank you for your feedback!');
                clearForm();
            } else {
                throw new Error(`Failed to submit feedback: ${result.status} - ${result.text}`);
            }
        })
        .catch(error => {
            // Reset button state
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            
            console.error('Error submitting feedback:', error);
            alert('There was a problem submitting your feedback. Please try again later.');
        });
    }
    
    function clearForm() {
        document.getElementById('name').value = '';
        document.getElementById('email').value = '';
        document.getElementById('tool').selectedIndex = 0;
        document.getElementById('feedback').value = '';
    }

    // Initialize additional features
    initializeSuggestionForm();
    generateResourceThumbnails();
    initializeTagFilters();
    initializeMobileMenuDirectLinks();
    
    // Generate thumbnail images for resources
    function generateResourceThumbnails() {
        const resourceCards = document.querySelectorAll('.resource-card');
        
        resourceCards.forEach(card => {
            const imageContainer = card.querySelector('.resource-card-image');
            if (!imageContainer) return;
            
            const img = imageContainer.querySelector('img');
            if (!img) return;
            
            if (!img.complete || img.naturalHeight === 0 || img.src.includes('resource-placeholder.jpg')) {
                // Get details to generate a unique but consistent thumbnail
                const title = card.querySelector('h2').textContent;
                const sourceElement = card.querySelector('.resource-source');
                const source = sourceElement ? sourceElement.textContent : 'source';
                
                // Check screen size
                const isMobile = window.innerWidth <= 768;
                
                // Create a canvas element with responsive dimensions
                const canvas = document.createElement('canvas');
                canvas.width = 400; // Keep width consistent for aspect ratio
                canvas.height = isMobile ? 220 : 200; // Slightly taller on mobile for more text space
                const ctx = canvas.getContext('2d');
                
                // Generate a color based on the title and source
                const hash = stringToHash(title + source);
                const hue = hash % 360;
                const saturation = 70;
                const lightness = 65;
                
                // Fill with gradient background
                const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
                gradient.addColorStop(0, `hsl(${hue}, ${saturation}%, ${lightness}%)`);
                gradient.addColorStop(1, `hsl(${(hue + 40) % 360}, ${saturation}%, ${lightness}%)`);
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                
                // Add a pattern overlay for texture
                ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
                for (let i = 0; i < canvas.width; i += 20) {
                    for (let j = 0; j < canvas.height; j += 20) {
                        if ((i + j) % 40 === 0) {
                            ctx.fillRect(i, j, 10, 10);
                        }
                    }
                }
                
                // Draw a semi-transparent white background with darker edges for better visibility
                // Increase padding for mobile devices
                const padding = isMobile ? 30 : 20; // More padding on mobile
                ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
                ctx.fillRect(padding, padding, canvas.width - (padding * 2), canvas.height - (padding * 2));
                
                // Extract date and author information
                const dateElement = card.querySelector('.resource-date');
                const date = dateElement ? dateElement.textContent : '';
                
                const authorElement = card.querySelector('.resource-source');
                const author = authorElement ? authorElement.textContent : '';
                
                // Prepare to draw the title with proper padding
                ctx.textAlign = 'left'; // Left align for better readability
                ctx.textBaseline = 'top';
                
                // Calculate maximum width with much more restrictive constraints for mobile
                // This ensures text doesn't reach the edges on small screens
                const maxTextWidth = isMobile 
                    ? canvas.width - (padding * 4) // Much tighter constraints on mobile
                    : canvas.width - (padding * 3);
                
                // Handle long titles - split into multiple lines with proper padding
                const titlePadding = isMobile ? 40 : 30; // Much more padding on mobile for title
                
                // We already checked for mobile above, no need to redefine
                
                // Adjust font size for mobile - even smaller on very small screens
                const verySmallScreen = window.innerWidth <= 375; // iPhone SE and similar
                const baseFontSize = verySmallScreen ? 14 : (isMobile ? 16 : 20);
                ctx.font = `bold ${baseFontSize}px Inter, sans-serif`; // Set font before measuring
                
                // Adjust max width for mobile - even narrower on very small screens
                const mobileAdjustedMaxWidth = verySmallScreen
                    ? maxTextWidth - 40 // Extremely narrow for very small screens
                    : (isMobile ? maxTextWidth - 30 : maxTextWidth);
                
                // Word splitting and line formation
                const words = title.split(' ');
                let lines = [];
                let currentLine = words[0];
                
                for (let i = 1; i < words.length; i++) {
                    const testLine = currentLine + ' ' + words[i];
                    const testWidth = ctx.measureText(testLine).width;
                    
                    if (testWidth < mobileAdjustedMaxWidth) {
                        currentLine = testLine;
                    } else {
                        lines.push(currentLine);
                        currentLine = words[i];
                    }
                }
                lines.push(currentLine);
                
                // On mobile, limit to 4 lines to fit more content 
                // On desktop, keep at 3 lines
                const maxLines = isMobile ? 4 : 3;
                
                // Limit lines and add ellipsis if needed
                if (lines.length > maxLines) {
                    lines = lines.slice(0, maxLines);
                    // Only add ellipsis if the last line is getting cut off
                    const lastLineWidth = ctx.measureText(lines[maxLines-1]).width;
                    if (lastLineWidth > mobileAdjustedMaxWidth) {
                        // Find a good cutoff point to add ellipsis
                        let shortenedLine = lines[maxLines-1];
                        while (ctx.measureText(shortenedLine + '...').width > mobileAdjustedMaxWidth && shortenedLine.length > 0) {
                            shortenedLine = shortenedLine.slice(0, -1);
                        }
                        lines[maxLines-1] = shortenedLine + '...';
                    }
                }
                
                // Adjust line height based on font size
                const lineHeight = baseFontSize * 1.3; 
                
                // Adjust top padding for mobile to give more space
                const topPadding = isMobile ? 30 : 40;
                
                // Draw each line of title with black text and proper padding
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                
                lines.forEach((line, index) => {
                    ctx.fillText(line, titlePadding, topPadding + (index * lineHeight));
                });
                
                // Draw a semi-transparent footer bar for metadata
                ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
                const footerHeight = isMobile ? 35 : 40;
                ctx.fillRect(0, canvas.height - footerHeight, canvas.width, footerHeight);
                
                // Draw the author at the lower left and date at the lower right
                const metaFontSize = isMobile ? 12 : 14;
                ctx.font = `${metaFontSize}px Inter, sans-serif`;
                
                // For very long author names on mobile, truncate with ellipsis
                let displayAuthor = author;
                // More aggressive truncation on mobile
                if (verySmallScreen && author.length > 10) {
                    displayAuthor = author.substring(0, 9) + '...';
                } else if (isMobile && author.length > 12) {
                    displayAuthor = author.substring(0, 11) + '...';
                }
                
                // Extra side padding for metadata text on mobile
                const metaPadding = isMobile ? padding + 10 : padding;
                
                // Author on the left - adjust y-position based on footer height
                ctx.textAlign = 'left';
                ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                ctx.fillText(displayAuthor, metaPadding, canvas.height - (footerHeight/2) - (metaFontSize/2) + 1);
                
                // Date on the right - adjust y-position the same way
                ctx.textAlign = 'right';
                // Use padding + 10 for right side as well on mobile
                ctx.fillText(date, canvas.width - metaPadding, canvas.height - (footerHeight/2) - (metaFontSize/2) + 1);
                
                // Replace the image source with canvas data
                img.src = canvas.toDataURL('image/png');
                
                // Set image properties
                img.alt = title;
                img.style.objectFit = 'cover';
                img.style.width = '100%';
                img.style.height = '100%';
            }
        });
    }
    
    // Helper function to get initials from title
    function getInitials(title) {
        // Split by spaces and get first letters of first two words
        const words = title.split(' ').filter(word => word.length > 0);
        
        if (words.length === 1) {
            // If only one word, take first two letters
            return words[0].substring(0, 2).toUpperCase();
        } else {
            // Take first letter of first two words
            return (words[0][0] + words[1][0]).toUpperCase();
        }
    }
    
    // Helper function to convert string to a hash number
    function stringToHash(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
    }

    // Initialize resource suggestion form
    function initializeSuggestionForm() {
        const suggestButton = document.getElementById('suggest-resource-btn');
        const resourceForm = document.getElementById('resource-form');
        const suggestionForm = document.getElementById('resource-suggestion-form');

        if (!suggestButton || !resourceForm || !suggestionForm) return;

        // Toggle form visibility
        suggestButton.addEventListener('click', function() {
            resourceForm.classList.toggle('hidden');
            if (!resourceForm.classList.contains('hidden')) {
                const firstInput = resourceForm.querySelector('input');
                if (firstInput) firstInput.focus();
            }
        });

        // Handle form submission
        suggestionForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const title = document.getElementById('resource-title').value;
            const url = document.getElementById('resource-url').value;
            const source = document.getElementById('resource-source').value;
            const category = document.getElementById('resource-category').value;
            const description = document.getElementById('resource-description').value;
            const name = document.getElementById('your-name').value;
            const email = document.getElementById('your-email').value;
            
            // Create payload
            const payload = {
                message: 'Resource Suggestion',
                ddsource: 'website',
                ddtags: `category:${category}`,
                hostname: window.location.hostname,
                service: 'ai-tools-website',
                status: 'info',
                resource: {
                    title: title,
                    url: url,
                    source: source,
                    category: category,
                    description: description
                },
                user: {
                    name: name || 'Anonymous',
                    email: email || 'Not provided'
                },
                timestamp: new Date().toISOString()
            };
            
            // For now, just show an alert
            console.log('Resource suggestion payload:', payload);
            alert('Thank you for your resource suggestion! Our team will review it shortly.');
            
            // Clear form and hide it
            suggestionForm.reset();
            resourceForm.classList.add('hidden');
        });
    }

    // Initialize Prism.js if it's available
    if (typeof Prism !== 'undefined') {
        Prism.highlightAll();
    }
    
    // Initialize any tag filters on the page
    function initializeTagFilters() {
        const tagFilters = document.querySelectorAll('.tag-filter');
        const categoryFilter = document.getElementById('episode-category-filter');
        const tagButtonsContainer = document.querySelector('.tag-buttons');
        
        if (tagFilters.length === 0) return;
        
        // Add visual feedback for touch devices
        if (tagButtonsContainer) {
            // Prevent horizontal scrolling from triggering filter changes unintentionally
            tagButtonsContainer.addEventListener('scroll', function(e) {
                // Set a flag to indicate the container is scrolling
                tagButtonsContainer.setAttribute('data-scrolling', 'true');
                
                // Clear the flag after scrolling stops
                clearTimeout(tagButtonsContainer.scrollTimeout);
                tagButtonsContainer.scrollTimeout = setTimeout(function() {
                    tagButtonsContainer.setAttribute('data-scrolling', 'false');
                }, 150);
            });
        }
        
        // Handle category filtering
        if (categoryFilter) {
            categoryFilter.addEventListener('change', function() {
                const selectedCategory = this.value;
                const cards = document.querySelectorAll('.recording-card, .resource-card');
                
                cards.forEach(card => {
                    const cardCategory = card.getAttribute('data-category');
                    
                    if (selectedCategory === 'all' || cardCategory === selectedCategory) {
                        // Only show if it also passes the tag filters
                        const activeFilters = Array.from(document.querySelectorAll('.tag-filter.active'))
                            .map(el => el.getAttribute('data-tag'));
                        
                        if (shouldShowCardByTags(card, activeFilters)) {
                            card.style.display = 'block';
                        }
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        }
        
        // Handle tag filtering
        tagFilters.forEach(filter => {
            filter.addEventListener('click', function(e) {
                // Don't activate the filter if the container is still scrolling (prevents accidental activations)
                if (tagButtonsContainer && tagButtonsContainer.getAttribute('data-scrolling') === 'true') {
                    return;
                }
                
                const tag = this.getAttribute('data-tag');
                
                // Add tactile feedback for mobile
                this.style.transform = 'scale(0.95)';
                setTimeout(() => {
                    this.style.transform = '';
                }, 150);
                
                // Make this the only active tag of its group
                const otherTagsInGroup = Array.from(
                    this.closest('.tag-buttons').querySelectorAll('.tag-filter')
                ).filter(t => t !== this);
                
                otherTagsInGroup.forEach(t => t.classList.remove('active'));
                this.classList.add('active');
                
                // Get all currently active filters
                const activeFilters = Array.from(document.querySelectorAll('.tag-filter.active'))
                    .map(el => el.getAttribute('data-tag'));
                
                // Filter the cards
                filterCardsByTags(activeFilters);
            });
        });
    }

    function filterCardsByTags(activeTags) {
        // Works for both recording-card and resource-card
        const cards = document.querySelectorAll('.recording-card, .resource-card');
        const categoryFilter = document.getElementById('episode-category-filter');
        const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
        
        cards.forEach(card => {
            const cardCategory = card.getAttribute('data-category');
            const categoryMatch = selectedCategory === 'all' || cardCategory === selectedCategory;
            const tagMatch = shouldShowCardByTags(card, activeTags);
            
            card.style.display = (categoryMatch && tagMatch) ? 'block' : 'none';
        });
    }

    function shouldShowCardByTags(card, activeTags) {
        if (activeTags.length === 0 || activeTags.includes('all')) {
            return true;
        }
        
        const cardTags = card.getAttribute('data-tags') ? 
            card.getAttribute('data-tags').split(',') : [];
        
        // Check if the card has at least one of the active tags
        return activeTags.some(tag => cardTags.includes(tag));
    }

    // COMPLETELY NEW mobile menu implementation using direct links
    function initializeMobileMenuDirectLinks() {
        console.log('Initializing mobile menu with direct links approach');
        
        // Query DOM elements
        const siteHeader = document.querySelector('.site-header');
        const headerContainer = document.querySelector('.site-header .container');
        const existingMenu = document.querySelector('.hamburger-menu');
        if (existingMenu) existingMenu.remove();
        
        const existingOverlay = document.querySelector('.menu-overlay');
        if (existingOverlay) existingOverlay.remove();
        
        const nav = document.querySelector('.site-header nav');
        
        if (!siteHeader || !headerContainer || !nav) {
            console.error('Required elements not found for mobile menu');
            return;
        }
        
        // Create hamburger menu button
        const hamburgerMenu = document.createElement('div');
        hamburgerMenu.className = 'hamburger-menu';
        hamburgerMenu.setAttribute('role', 'button');
        hamburgerMenu.setAttribute('tabindex', '0');
        hamburgerMenu.setAttribute('aria-label', 'Toggle navigation menu');
        
        // Create hamburger icon
        const logoImg = document.createElement('img');
        logoImg.src = '../images/ai-tools-lab-logo.png';
        if (!logoImg.src || logoImg.src.includes('undefined')) {
            logoImg.src = './images/ai-tools-lab-logo.png';
        }
        logoImg.width = 24;
        logoImg.height = 24;
        logoImg.alt = "Menu";
        
        // Add icon to hamburger menu
        hamburgerMenu.appendChild(logoImg);
        
        // Add hamburger menu to header
        headerContainer.appendChild(hamburgerMenu);
        
        // Create overlay
        const menuOverlay = document.createElement('div');
        menuOverlay.className = 'menu-overlay';
        document.body.appendChild(menuOverlay);
        
        // Get all navigation items and convert to direct links
        const navItems = nav.querySelectorAll('a');
        const navLinks = [];
        
        navItems.forEach(item => {
            navLinks.push({
                href: item.getAttribute('href'),
                text: item.textContent,
                isActive: item.classList.contains('active')
            });
        });
        
        // Create mobile navigation container that will replace the nav element when open
        const mobileNavContainer = document.createElement('div');
        mobileNavContainer.className = 'mobile-nav-container';
        mobileNavContainer.style.display = 'none';
        mobileNavContainer.style.position = 'fixed';
        mobileNavContainer.style.top = '0';
        mobileNavContainer.style.right = '0';
        mobileNavContainer.style.width = '80%';
        mobileNavContainer.style.maxWidth = '300px';
        mobileNavContainer.style.height = '100vh';
        mobileNavContainer.style.backgroundColor = '#3E2D73';
        mobileNavContainer.style.zIndex = '2001';
        mobileNavContainer.style.paddingTop = '80px';
        mobileNavContainer.style.boxShadow = '-2px 0 5px rgba(0, 0, 0, 0.2)';
        mobileNavContainer.style.overflowY = 'auto';
        
        // Build mobile nav HTML directly
        let mobileNavHTML = '<ul style="list-style: none; padding: 20px;">';
        navLinks.forEach(link => {
            mobileNavHTML += `
            <li style="margin-bottom: 15px;">
                <a href="${link.href}" 
                   style="
                      color: white; 
                      text-decoration: none; 
                      font-size: 18px; 
                      display: block; 
                      padding: 10px;
                      ${link.isActive ? 'font-weight: bold; background-color: rgba(255,255,255,0.1); border-radius: 5px;' : ''}
                   "
                >${link.text}</a>
            </li>`;
        });
        mobileNavHTML += '</ul>';
        
        mobileNavContainer.innerHTML = mobileNavHTML;
        document.body.appendChild(mobileNavContainer);
        
        // Toggle function that doesn't reference the original nav
        function toggleMenu() {
            if (mobileNavContainer.style.display === 'none') {
                // Open menu
                mobileNavContainer.style.display = 'block';
                hamburgerMenu.classList.add('active');
                menuOverlay.classList.add('active');
            } else {
                // Close menu
                mobileNavContainer.style.display = 'none';
                hamburgerMenu.classList.remove('active');
                menuOverlay.classList.remove('active');
            }
            document.body.classList.toggle('menu-open');
        }
        
        // Toggle menu on hamburger click
        hamburgerMenu.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleMenu();
        });
        
        // Close menu when clicking overlay
        menuOverlay.addEventListener('click', function() {
            toggleMenu();
        });
        
        // Show hamburger on smaller screens, hide on larger
        if (window.innerWidth <= 768) {
            hamburgerMenu.style.display = 'flex';
        } else {
            hamburgerMenu.style.display = 'none';
        }
        
        // Close menu on resize
        window.addEventListener('resize', function() {
            if (mobileNavContainer.style.display !== 'none') {
                toggleMenu();
            }
            
            // Show hamburger on smaller screens, hide on larger
            if (window.innerWidth <= 768) {
                hamburgerMenu.style.display = 'flex';
            } else {
                hamburgerMenu.style.display = 'none';
            }
        });
        
        console.log('Mobile menu initialized with direct links approach');
    }
    
    function getCardDate(card) {
        // Extract date from either recording-card or resource-card
        const dateElement = card.querySelector('.recording-date') || card.querySelector('.resource-date');
        if (!dateElement) return new Date(0); // Return epoch if no date found
        
        const dateText = dateElement.textContent.trim();
        
        // Parse the date in format "Month DD, YYYY"
        try {
            // Use Date.parse for standard format
            const parsedDate = new Date(dateText);
            
            // Check if valid date was parsed
            if (!isNaN(parsedDate.getTime())) {
                return parsedDate;
            }
            
            // Fallback to manual parsing for "Month DD, YYYY" format
            const parts = dateText.match(/(\w+)\s+(\d+),\s+(\d+)/);
            if (parts) {
                const month = getMonthNumber(parts[1]);
                const day = parseInt(parts[2], 10);
                const year = parseInt(parts[3], 10);
                return new Date(year, month, day);
            }
            
            // If we can't parse the date, return epoch
            return new Date(0);
        } catch (e) {
            console.warn('Error parsing date:', dateText, e);
            return new Date(0);
        }
    }

    // Helper function to convert month name to number (0-11)
    function getMonthNumber(monthName) {
        const months = {
            'January': 0, 'February': 1, 'March': 2, 'April': 3, 
            'May': 4, 'June': 5, 'July': 6, 'August': 7,
            'September': 8, 'October': 9, 'November': 10, 'December': 11
        };
        
        return months[monthName] || 0;
    }

    // Function to sort episode cards by date (newest first)
    function sortEpisodesByDate() {
        // Only run on index page
        if (!window.location.pathname.includes('index.html')) return;
        
        const cardsContainer = document.querySelector('.recording-grid');
        if (!cardsContainer) return;
        
        console.log('Sorting episodes by date (newest first)');
        
        const cards = Array.from(cardsContainer.children);
        
        // Sort cards by date (newest first)
        cards.sort((a, b) => {
            const dateA = getCardDate(a);
            const dateB = getCardDate(b);
            
            return new Date(dateB) - new Date(dateA); // Newest first
        });
        
        // Remove existing cards
        cards.forEach(card => card.remove());
        
        // Append sorted cards
        cards.forEach(card => cardsContainer.appendChild(card));
        
        console.log('Episodes sorted successfully');
    }

    // Make video containers clickable (thumbnail area)
    function makeVideoContainersClickable() {
        const videoContainers = document.querySelectorAll('.video-container');
        
        videoContainers.forEach(container => {
            const link = container.querySelector('a');
            
            if (link) {
                const linkHref = link.getAttribute('href');
                const linkTarget = link.getAttribute('target');
                
                // Make the entire container clickable
                container.addEventListener('click', function(e) {
                    // Don't interfere if the click is on the actual link or its children
                    if (e.target.closest('a')) {
                        // Let the normal link behavior happen
                        return;
                    }
                    
                    // Only handle clicks directly on the container or other elements (like images)
                    if (e.target === container || e.target.tagName === 'IMG' || e.target.classList.contains('play-icon')) {
                        e.preventDefault();
                        // Open the link in the same way the anchor would
                        if (linkTarget === '_blank') {
                            window.open(linkHref, '_blank', 'noopener,noreferrer');
                        } else {
                            window.location.href = linkHref;
                        }
                    }
                });
                
                // Add aria attributes for accessibility
                container.setAttribute('role', 'button');
                container.setAttribute('aria-label', 'Watch video');
                container.style.cursor = 'pointer';
            }
        });
    }

    // Add play icons to video containers
    function addPlayIconsToVideos() {
        const videoContainers = document.querySelectorAll('.video-container');
        
        videoContainers.forEach(container => {
            const link = container.querySelector('a');
            
            if (link) {
                // Check if there is already a play-icon span
                let playIcon = link.querySelector('.play-icon');
                
                // If not, create and add it
                if (!playIcon) {
                    playIcon = document.createElement('span');
                    playIcon.className = 'play-icon';
                    link.appendChild(playIcon);
                }
            }
        });
    }

    // Initialize the easter egg functionality
    function initializeEasterEgg() {
        const easterEgg = document.getElementById('easter-egg');
        const modal = document.getElementById('easter-egg-modal');
        const closeBtn = document.querySelector('.easter-egg-close');
        
        if (!easterEgg || !modal || !closeBtn) return;
        
        // Show modal when Pi symbol is clicked
        easterEgg.addEventListener('click', function() {
            modal.style.display = 'flex';
            setTimeout(() => {
                modal.classList.add('show');
            }, 10);
        });
        
        // Close modal when X is clicked
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('show');
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        });
        
        // Close modal when clicking outside of it
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                modal.classList.remove('show');
                setTimeout(() => {
                    modal.style.display = 'none';
                }, 300);
            }
        });
    }
});