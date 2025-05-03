# Use Node.js LTS as base image
FROM node:18-alpine

# Set working directory
WORKDIR /app

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy project files
COPY . .

# Build the project
RUN npm run build

# Expose the port that Astro preview runs on
EXPOSE 4321

# Command to run the preview server
CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]
