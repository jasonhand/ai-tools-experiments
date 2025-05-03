// Docker build test script using Puppeteer
const puppeteer = require('puppeteer');

async function testDockerBuild() {
  console.log('Starting Docker build test...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to the Docker container's served site
    console.log('Navigating to Docker container site...');
    await page.goto('http://localhost:4321', { waitUntil: 'networkidle2' });
    
    // Take a screenshot of the homepage
    await page.screenshot({ path: './tests/screenshots/docker-homepage.png' });
    console.log('Homepage screenshot saved');
    
    // Test navigation to an episode page
    console.log('Testing navigation to episode page...');
    const episodeLinks = await page.$$('.recording-card a');
    if (episodeLinks.length > 0) {
      await episodeLinks[0].click();
      await page.waitForNavigation({ waitUntil: 'networkidle2' });
      await page.screenshot({ path: './tests/screenshots/docker-episode-page.png' });
      console.log('Episode page screenshot saved');
    } else {
      console.log('No episode links found on homepage');
    }
    
    // Check for critical elements
    const headerExists = await page.$('header');
    const footerExists = await page.$('footer');
    const mainContentExists = await page.$('main');
    
    // Check for play button overlays on video thumbnails
    await page.goto('http://localhost:4321', { waitUntil: 'networkidle2' });
    const playButtonOverlays = await page.$$('.play-button-overlay');
    const playButtonSVGs = await page.$$('.play-button-overlay svg');
    
    // Test play button overlay functionality
    if (playButtonOverlays.length > 0) {
      // Take a screenshot of a card with play button overlay
      const firstCard = await page.$('.recording-card');
      if (firstCard) {
        await firstCard.screenshot({ path: './tests/screenshots/play-button-overlay.png' });
        console.log('Play button overlay screenshot saved');
      }
      
      // Test hover effect on play button overlay
      const firstOverlay = playButtonOverlays[0];
      await firstOverlay.hover();
      await page.waitForTimeout(500); // Wait for hover effect
      await page.screenshot({ path: './tests/screenshots/play-button-hover.png' });
      console.log('Play button hover effect screenshot saved');
    }
    
    console.log('Critical elements check:');
    console.log(`- Header exists: ${!!headerExists}`);
    console.log(`- Footer exists: ${!!footerExists}`);
    console.log(`- Main content exists: ${!!mainContentExists}`);
    console.log(`- Play button overlays exist: ${playButtonOverlays.length > 0}`);
    console.log(`- Play button SVGs exist: ${playButtonSVGs.length > 0}`);
    
    console.log('Docker build test completed successfully');
    return true;
  } catch (error) {
    console.error('Error during Docker build test:', error);
    return false;
  } finally {
    await browser.close();
  }
}

// Run the test
testDockerBuild().then(success => {
  if (!success) {
    console.error('Docker build test failed');
    process.exit(1);
  }
});
