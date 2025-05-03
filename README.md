[![Netlify Status](https://api.netlify.com/api/v1/badges/94b1b695-e156-4836-9f22-aa64256e4d05/deploy-status)](https://app.netlify.com/sites/ai-tools-lab-tst/deploys)
[ai-tools-lab.com](https://ai-tools-lab.com)

![image](https://github.com/user-attachments/assets/9e985980-4722-48d7-9cca-9caf4d3948d3)

# What is This? 

~30-40 minute recorded technical demonstrations of hands-on (early or first) experiences with AI-related tooling for developers.

# Why do This?

Helping the team and beyond to navigate the AI era by leading discussions, demos, and observations that are grounded in curiosity and honest experiences that can be shared in order to remain leaders, not laggers, through this transition.

# Why Now?

What it means to be a developer is is changing rapidly. Therefore, what it means to be a developer advocate is changing rapidly.

# Goals

1. To educate ourselves and form opinions on new (AI-related) technologies, tools, and processes in order to better understand today's challenges, solutions, and current thinking in order to be a better advocate for the modern developer

2. Build credibility and reputation as leaders in engineering excellence as it relates to AI developer tools and thought leadership

3. Educate team about new technology and approaches in our space

4. Collaboration with teammates

# AI Tools Lab

This project contains the website for AI Tools Lab, a collection of experiments and resources related to AI tools.

## Directory Structure

- `src/`: Source files for the Astro project
  - `pages/`: Astro pages (routes)
    - `[slug].astro`: Dynamic route for episode pages
    - `index.astro`: Main page listing episodes
    - `resources.astro`: Resources page
    - `observations.astro`: Observations page
  - `content/`: Content files
    - `transcripts/`: HTML transcript files for episodes
  - `components/`: Reusable Astro components
  - `layouts/`: Page layouts
- `public/`: Static assets served at the root
  - `images/`: Image files used throughout the site
  - `styles.css`: Main stylesheet for the site
- `proxy/`: Netlify functions
  - `datadog-proxy.js`: Datadog monitoring proxy
- `script.js`: JavaScript functionality for Datadog monitoring
- `tests/`: Automated tests
  - `docker-build-test.js`: Puppeteer tests for Docker builds
  - `run-tests.sh`: Test runner script

## Running Locally

### Using Astro Dev Server

To run the website locally using the Astro development server:

```bash
npm install  # Install dependencies
npm run dev  # Start development server
```

Then open your browser to http://localhost:4321

### Using Docker

Alternatively, you can run the website using Docker:

```bash
# Build the Docker image
docker-compose build

# Run the container
docker-compose up
```

This will build and serve the site at http://localhost:4321

### Running Tests

To run the automated tests:

```bash
./tests/run-tests.sh
```

This will build the Docker container, run the Puppeteer tests, and trigger a Netlify deployment if tests pass.

### Git Hooks

This project includes Git hooks to automate testing after commits:

- **post-commit**: Automatically runs tests after each commit to ensure code quality

To install the Git hooks, run either:

```bash
# Using the shell script directly
./hooks/install-hooks.sh

# Or using npm
npm run install-hooks
```

This will copy the hooks to your local `.git/hooks` directory and make them executable.

You can also run the episode tests manually with:

```bash
npm run test-episodes
```

## Adding New Content

### New Episodes

To add a new episode:
1. Create a new HTML file in the `src/content/transcripts/` directory named `epXX.html` (where XX is the episode number)
2. The episode will automatically appear in the episode listing on the homepage

### New Resources

To add new resources to the resource library:
1. Update the resource cards in `src/pages/resources.astro`
2. Add any needed thumbnails to the `public/images/thumbnails/` directory

## Contributing

Contributions to improve the site are welcome! Please submit a pull request with your proposed changes.
