document.addEventListener('DOMContentLoaded', function() {
    // Initialize external link handling for all pages
    initializeExternalLinks();
    
    // Initialize observations page filtering if on observations page
    if (window.location.pathname.includes('/observations')) {
        initializeObservationsFiltering();
    }
    
    // Make transcript timestamps clickable if on episode page
    if (window.location.pathname.includes('/episodes/')) {
        makeTimestampsClickable();
    }
    
    // Handle feedback form if present
    const form = document.getElementById('datadog-form');
    if (form) {
        initializeFeedbackForm(form);
    }
    
    // Initialize easter egg functionality
    initializeEasterEgg();
});

function initializeExternalLinks() {
    // Get current domain
    const currentDomain = window.location.hostname;
    
    // Function to check if a URL is external
    function isExternalLink(url) {
        try {
            // Handle relative URLs (they're internal)
            if (url.startsWith('/') || url.startsWith('#') || url.startsWith('?')) {
                return false;
            }
            
            // Handle protocol-relative URLs
            if (url.startsWith('//')) {
                url = window.location.protocol + url;
            }
            
            // Handle URLs without protocol
            if (!url.includes('://')) {
                // If it doesn't contain a protocol and doesn't start with /, it might be a relative URL
                return false;
            }
            
            const linkDomain = new URL(url).hostname;
            return linkDomain !== currentDomain;
        } catch (e) {
            // If URL parsing fails, assume it's internal
            return false;
        }
    }
    
    // Function to update a link for external behavior
    function updateExternalLink(link) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
        
        // Add visual indicator (optional)
        if (!link.querySelector('.external-link-icon')) {
            const icon = document.createElement('span');
            icon.className = 'external-link-icon';
            icon.innerHTML = ' ↗';
            icon.style.fontSize = '0.8em';
            icon.style.opacity = '0.7';
            link.appendChild(icon);
        }
    }
    
    // Process existing links
    function processLinks() {
        const links = document.querySelectorAll('a[href]');
        links.forEach(link => {
            const href = link.getAttribute('href');
            if (href && isExternalLink(href)) {
                updateExternalLink(link);
            }
        });
    }
    
    // Initial processing
    processLinks();
    
    // Set up mutation observer to handle dynamically added links
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            mutation.addedNodes.forEach(function(node) {
                if (node.nodeType === Node.ELEMENT_NODE) {
                    // Check if the added node is a link
                    if (node.tagName === 'A' && node.hasAttribute('href')) {
                        const href = node.getAttribute('href');
                        if (href && isExternalLink(href)) {
                            updateExternalLink(node);
                        }
                    }
                    
                    // Check for links within the added node
                    const links = node.querySelectorAll ? node.querySelectorAll('a[href]') : [];
                    links.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href && isExternalLink(href)) {
                            updateExternalLink(link);
                        }
                    });
                }
            });
        });
    });
    
    // Start observing
    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
}

function initializeObservationsFiltering() {
    const searchInputs = document.querySelectorAll('.filter-search');
    const filterItems = document.querySelectorAll('.filter-item');
    const resetButtons = document.querySelectorAll('.reset-filters');
    const takeawayCards = document.querySelectorAll('.takeaway-card');
    const emptyState = document.getElementById('empty-state');
    
    let activeFilters = {
        search: '',
        tools: []
    };
    
    // Search functionality
    searchInputs.forEach(input => {
        input.addEventListener('input', function() {
            activeFilters.search = this.value.toLowerCase();
            // Sync search inputs
            searchInputs.forEach(otherInput => {
                if (otherInput !== this) {
                    otherInput.value = this.value;
                }
            });
            filterCards();
        });
    });
    
    // Filter item clicks
    filterItems.forEach(item => {
        item.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;
            
            if (filterType === 'tool') {
                const index = activeFilters.tools.indexOf(filterValue);
                if (index > -1) {
                    activeFilters.tools.splice(index, 1);
                    this.classList.remove('active');
                } else {
                    activeFilters.tools.push(filterValue);
                    this.classList.add('active');
                }
                
                // Sync filter states across desktop and mobile
                const allFilterItems = document.querySelectorAll(`[data-filter="${filterType}"][data-value="${filterValue}"]`);
                allFilterItems.forEach(filterItem => {
                    if (this.classList.contains('active')) {
                        filterItem.classList.add('active');
                    } else {
                        filterItem.classList.remove('active');
                    }
                });
            }
            
            filterCards();
        });
    });
    
    // Reset filters
    resetButtons.forEach(button => {
        button.addEventListener('click', function() {
            activeFilters = { search: '', tools: [] };
            searchInputs.forEach(input => input.value = '');
            filterItems.forEach(item => item.classList.remove('active'));
            filterCards();
        });
    });
    
    function filterCards() {
        let visibleCount = 0;
        
        takeawayCards.forEach(card => {
            let shouldShow = true;
            
            // Search filter
            if (activeFilters.search) {
                const cardText = card.textContent.toLowerCase();
                if (!cardText.includes(activeFilters.search)) {
                    shouldShow = false;
                }
            }
            
            // Tool filters
            if (activeFilters.tools.length > 0) {
                const cardTools = card.dataset.tools.split(',');
                const hasMatchingTool = activeFilters.tools.some(tool => 
                    cardTools.includes(tool)
                );
                if (!hasMatchingTool) {
                    shouldShow = false;
                }
            }
            
            if (shouldShow) {
                card.style.display = 'block';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });
        
        // Show/hide empty state
        if (emptyState) {
            emptyState.style.display = visibleCount === 0 ? 'block' : 'none';
        }
    }
}

function makeTimestampsClickable() {
    // Get YouTube video ID from chapter markers or video container
    let videoId = '';
    const chapterMarkers = document.querySelector('.chapter-markers');
    if (chapterMarkers) {
        const firstChapterLink = chapterMarkers.querySelector('a');
        if (firstChapterLink) {
            const href = firstChapterLink.getAttribute('href');
            videoId = extractVideoId(href);
        }
    }
    
    if (!videoId) {
        const videoContainer = document.querySelector('.video-container a');
        if (videoContainer) {
            const href = videoContainer.getAttribute('href');
            videoId = extractVideoId(href);
        }
    }
    
    if (!videoId) return;
    
    // Find all transcript timestamps
    const timestampElements = document.querySelectorAll('.transcript-timestamp');
    
    timestampElements.forEach(function(element) {
        const timestamp = element.textContent;
        const timeMatch = timestamp.match(/\[(\d{2}):(\d{2}):(\d{2})\]/);
        
        if (timeMatch) {
            const hours = parseInt(timeMatch[1], 10);
            const minutes = parseInt(timeMatch[2], 10);
            const seconds = parseInt(timeMatch[3], 10);
            const totalSeconds = hours * 3600 + minutes * 60 + seconds;
            
            const link = document.createElement('a');
            link.href = `https://youtu.be/${videoId}?t=${totalSeconds}`;
            link.target = '_blank';
            link.classList.add('timestamp-link');
            link.title = 'Click to watch this part of the video';
            
            element.style.cursor = 'pointer';
            element.style.color = '#0066cc';
            element.style.textDecoration = 'underline';
            
            const parent = element.parentNode;
            parent.insertBefore(link, element);
            link.appendChild(element);
        }
    });
}

function extractVideoId(url) {
    if (url.includes('youtu.be/')) {
        return url.split('youtu.be/')[1].split('?')[0];
    } else if (url.includes('youtube.com/watch?v=')) {
        return url.split('v=')[1].split('&')[0];
    }
    return '';
}

function initializeFeedbackForm(form) {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const tool = document.getElementById('tool').value;
        const feedback = document.getElementById('feedback').value;
        
        const payload = {
            message: 'User Feedback Submission',
            ddsource: 'website',
            ddtags: `tool:${tool || 'not_specified'}`,
            hostname: window.location.hostname,
            service: 'ai-tools-website',
            status: 'info',
            user: { name: name, email: email },
            feedback: feedback,
            timestamp: new Date().toISOString()
        };
        
        sendToDatadog(payload);
    });
}

function sendToDatadog(payload) {
    const submitButton = document.querySelector('#datadog-form button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Development mode simulation
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        setTimeout(() => {
            submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
            alert('Feedback submitted (development mode)!');
            clearForm();
        }, 1000);
        return;
    }
    
    // Production - use Netlify function
    fetch('/api/datadog', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify([payload])
    })
    .then(response => response.text())
    .then(() => {
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        alert('Feedback submitted successfully!');
        clearForm();
    })
    .catch(error => {
        console.error('Error:', error);
        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;
        alert('Error submitting feedback. Please try again.');
    });
}

function clearForm() {
    const form = document.getElementById('datadog-form');
    if (form) {
        form.reset();
    }
}

function initializeEasterEgg() {
    const easterEggTrigger = document.getElementById('easter-egg');
    if (!easterEggTrigger) return;
    
    // Get current state from localStorage (false = normal, true = alternate)
    let isAlternateMode = localStorage.getItem('heroImageMode') === 'alternate';
    
    // Apply current state on page load
    if (isAlternateMode) {
        toggleHeroImages(true);
        toggleTheme(true);
    }
    
    // Add click handler to pi symbol
    easterEggTrigger.addEventListener('click', function(e) {
        e.preventDefault();
        
        // Toggle the mode
        isAlternateMode = !isAlternateMode;
        
        // Save to localStorage
        localStorage.setItem('heroImageMode', isAlternateMode ? 'alternate' : 'normal');
        
        // Apply the toggles
        toggleHeroImages(isAlternateMode);
        toggleTheme(isAlternateMode);
        
        // Visual feedback
        showEasterEggFeedback(easterEggTrigger, isAlternateMode);
    });
}

function toggleTheme(useAlternate) {
    const body = document.body;
    
    if (useAlternate) {
        body.classList.add('alt-theme');
    } else {
        body.classList.remove('alt-theme');
    }
}

function showEasterEggFeedback(element, isAlternate) {
    // Enhanced visual pulse effect with theme-aware colors
    element.style.transform = isAlternate ? 'scale(1.5) rotate(10deg)' : 'scale(1.5)';
    element.style.transition = 'transform 0.3s ease';
    
    if (isAlternate) {
        element.style.background = 'linear-gradient(45deg, #EC4899, #F97316, #FDE047)';
        element.style.color = '#FFFFFF';
        element.style.boxShadow = '0 0 20px rgba(236, 72, 153, 0.6)';
    } else {
        element.style.background = 'rgba(0, 102, 204, 0.3)';
        element.style.color = '#0066cc';
        element.style.boxShadow = '0 0 10px rgba(0, 102, 204, 0.3)';
    }
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        setTimeout(() => {
            element.style.transform = '';
            element.style.transition = '';
            element.style.background = '';
            element.style.color = '';
            element.style.boxShadow = '';
        }, 300);
    }, 300);
    
    // Enhanced notification messages
    const messages = {
        alternate: 'Alternative universe activated! 🌈✨',
        normal: 'Back to reality! 📺🎯'
    };
    
    showEasterEggNotification(isAlternate ? messages.alternate : messages.normal);
}

function showEasterEggNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        pointer-events: none;
    `;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.opacity = '1';
        notification.style.transform = 'translateY(0)';
    }, 100);
    
    // Animate out and remove
    setTimeout(() => {
        notification.style.opacity = '0';
        notification.style.transform = 'translateY(-20px)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2500);
}

function toggleHeroImages(useAlternate) {
    // Handle all images with thumbnail paths
    const selectors = [
        'img[src*="/images/thumbnails/"]',
        'img[src*="/images/alt-thumbnails/"]',
        'img[src*="../images/thumbnails/"]',
        'img[src*="../images/alt-thumbnails/"]'
    ];
    
    const heroImages = document.querySelectorAll(selectors.join(', '));
    
    heroImages.forEach(img => {
        let currentSrc = img.getAttribute('src');
        let newSrc = getToggledImagePath(currentSrc, useAlternate);
        
        if (newSrc && newSrc !== currentSrc) {
            // Preload the new image before switching
            const tempImg = new Image();
            tempImg.onload = function() {
                img.setAttribute('src', newSrc);
            };
            tempImg.onerror = function() {
                console.warn(`Alternate image not found: ${newSrc}`);
            };
            tempImg.src = newSrc;
        }
    });
    
    // Handle CSS background images
    const elementsWithBgImages = document.querySelectorAll('[style*="background-image"]');
    elementsWithBgImages.forEach(element => {
        const currentStyle = element.getAttribute('style');
        if (currentStyle && (currentStyle.includes('/thumbnails/') || currentStyle.includes('/alt-thumbnails/'))) {
            const newStyle = toggleBackgroundImagePaths(currentStyle, useAlternate);
            if (newStyle !== currentStyle) {
                element.setAttribute('style', newStyle);
            }
        }
    });
}

function getToggledImagePath(currentPath, useAlternate) {
    if (!currentPath) return null;
    
    if (useAlternate) {
        // Switch to alt-thumbnails
        if (currentPath.includes('/images/thumbnails/')) {
            return currentPath.replace('/images/thumbnails/', '/images/alt-thumbnails/');
        } else if (currentPath.includes('../images/thumbnails/')) {
            return currentPath.replace('../images/thumbnails/', '../images/alt-thumbnails/');
        }
    } else {
        // Switch to normal thumbnails
        if (currentPath.includes('/images/alt-thumbnails/')) {
            return currentPath.replace('/images/alt-thumbnails/', '/images/thumbnails/');
        } else if (currentPath.includes('../images/alt-thumbnails/')) {
            return currentPath.replace('../images/alt-thumbnails/', '../images/thumbnails/');
        }
    }
    
    return currentPath; // No change needed
}

function toggleBackgroundImagePaths(styleString, useAlternate) {
    if (useAlternate) {
        return styleString
            .replace(/\/images\/thumbnails\//g, '/images/alt-thumbnails/')
            .replace(/\.\.\/images\/thumbnails\//g, '../images/alt-thumbnails/');
    } else {
        return styleString
            .replace(/\/images\/alt-thumbnails\//g, '/images/thumbnails/')
            .replace(/\.\.\/images\/alt-thumbnails\//g, '../images/thumbnails/');
    }
} 