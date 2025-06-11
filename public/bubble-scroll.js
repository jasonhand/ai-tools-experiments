// Bubble Scroll Behavior
document.addEventListener('DOMContentLoaded', function() {
    const bubbles = document.querySelectorAll('.floating-bubble');
    let scrollTimeout;
    let isScrolling = false;

    function pauseBubbleAnimations() {
        bubbles.forEach(bubble => {
            bubble.style.animationPlayState = 'paused';
        });
        isScrolling = true;
    }

    function resumeBubbleAnimations() {
        bubbles.forEach(bubble => {
            bubble.style.animationPlayState = 'running';
        });
        isScrolling = false;
    }

    // Handle scroll events
    window.addEventListener('scroll', function() {
        // Pause animations immediately when scrolling starts
        if (!isScrolling) {
            pauseBubbleAnimations();
        }

        // Clear the previous timeout
        clearTimeout(scrollTimeout);

        // Set a timeout to resume animations when scrolling stops
        scrollTimeout = setTimeout(function() {
            resumeBubbleAnimations();
        }, 150); // Resume after 150ms of no scrolling
    });

    // Initialize bubbles as running
    resumeBubbleAnimations();
}); 