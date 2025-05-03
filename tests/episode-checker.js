// Episode checker script using Puppeteer
const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Ensure screenshots directory exists
const screenshotsDir = path.join(__dirname, 'episode-screenshots');
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function checkEpisodes() {
  console.log('Starting episode check...');
  
  // Launch browser
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    
    // Set viewport size
    await page.setViewport({ width: 1280, height: 800 });
    
    // Navigate to homepage
    console.log('Navigating to homepage...');
    await page.goto('http://localhost:4322', { waitUntil: 'networkidle2' });
    
    // Get all episode links
    const episodeLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('.recording-card a'));
      return links.map(link => link.href);
    });
    
    console.log(`Found ${episodeLinks.length} episode links`);
    
    // Create a results object to store our findings
    const results = {
      totalEpisodes: episodeLinks.length,
      checkedEpisodes: 0,
      successfulEpisodes: 0,
      failedEpisodes: [],
      episodeDetails: []
    };
    
    // Check each episode
    for (let i = 0; i < episodeLinks.length; i++) {
      const episodeUrl = episodeLinks[i];
      const episodeId = episodeUrl.split('/').pop();
      
      console.log(`\nChecking episode ${i+1}/${episodeLinks.length}: ${episodeId}`);
      
      try {
        // Navigate to episode page
        await page.goto(episodeUrl, { waitUntil: 'networkidle2' });
        
        // Take screenshot
        await page.screenshot({ path: path.join(screenshotsDir, `episode-${episodeId}.png`) });
        
        // Check for critical elements
        const title = await page.$('h1');
        const titleText = title ? await page.evaluate(el => el.textContent, title) : 'No title found';
        
        const backLink = await page.$('.back-link');
        const transcriptContent = await page.$('.transcript-body-content');
        
        // Check if transcript content has actual content
        const contentText = transcriptContent ? 
          await page.evaluate(el => el.textContent.trim(), transcriptContent) : '';
        
        const hasContent = contentText.length > 50; // Arbitrary threshold to check if there's meaningful content
        
        const episodeResult = {
          id: episodeId,
          url: episodeUrl,
          title: titleText,
          hasBackLink: !!backLink,
          hasTranscriptContent: !!transcriptContent,
          hasSubstantialContent: hasContent,
          contentLength: contentText.length,
          status: (!!title && !!backLink && !!transcriptContent && hasContent) ? 'success' : 'issues'
        };
        
        results.episodeDetails.push(episodeResult);
        results.checkedEpisodes++;
        
        if (episodeResult.status === 'success') {
          results.successfulEpisodes++;
        } else {
          results.failedEpisodes.push(episodeId);
        }
        
        console.log(`- Title: ${titleText}`);
        console.log(`- Has back link: ${!!backLink}`);
        console.log(`- Has transcript content: ${!!transcriptContent}`);
        console.log(`- Has substantial content: ${hasContent} (${contentText.length} chars)`);
        console.log(`- Status: ${episodeResult.status}`);
        
      } catch (error) {
        console.error(`Error checking episode ${episodeId}:`, error);
        results.failedEpisodes.push(episodeId);
        results.episodeDetails.push({
          id: episodeId,
          url: episodeUrl,
          error: error.message,
          status: 'error'
        });
      }
    }
    
    // Save results to JSON file
    fs.writeFileSync(
      path.join(__dirname, 'episode-check-results.json'), 
      JSON.stringify(results, null, 2)
    );
    
    console.log('\nEpisode check completed!');
    console.log(`Total episodes: ${results.totalEpisodes}`);
    console.log(`Successfully checked: ${results.successfulEpisodes}`);
    console.log(`Episodes with issues: ${results.failedEpisodes.length}`);
    
    if (results.failedEpisodes.length > 0) {
      console.log('Episodes with issues:', results.failedEpisodes.join(', '));
    }
    
    return results;
  } catch (error) {
    console.error('Error during episode check:', error);
    return { error: error.message };
  } finally {
    await browser.close();
  }
}

// Run the check
checkEpisodes().then(results => {
  if (results.error || (results.failedEpisodes && results.failedEpisodes.length > 0)) {
    console.warn('Some episodes have issues. Check the results JSON file for details.');
    // Don't exit with error code as we want to continue the process
  }
});
