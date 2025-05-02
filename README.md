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

- `pages/`: Contains all HTML files for the website
  - `index.html`: Main page listing episodes
  - `resources.html`: Resources library page with curated articles
  - `ep*.html`: Individual episode pages with notes and transcripts
- `images/`: Image files used throughout the site
- `resources/`: Markdown files containing resource content
- `styles.css`: Main stylesheet for the site
- `script.js`: JavaScript functionality for the site

## Running Locally

To run the website locally, use Python's built-in HTTP server:

```bash
python -m http.server
```

Then open your browser to http://localhost:8000 and you will be redirected to the main page.

## Adding New Content

### New Episodes

To add a new episode:
1. Create a new HTML file in the `pages/` directory named `epXX.html` (where XX is the episode number)
2. Add a link to the new episode in `pages/index.html`

### New Resources

To add new resources to the resource library:
1. Update the resource cards in `pages/resources.html`
2. Add any needed thumbnails to the `images/` directory

## Contributing

Contributions to improve the site are welcome! Please submit a pull request with your proposed changes.
