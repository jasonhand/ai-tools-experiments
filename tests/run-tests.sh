#!/bin/bash

# Create screenshots directory if it doesn't exist
mkdir -p ./tests/screenshots

# Colors for output
GREEN="\033[0;32m"
RED="\033[0;31m"
YELLOW="\033[0;33m"
NC="\033[0m" # No Color

echo -e "${YELLOW}Starting test sequence...${NC}"

# Step 1: Build Docker container
echo -e "${YELLOW}Step 1: Building Docker container...${NC}"
docker-compose build

if [ $? -ne 0 ]; then
  echo -e "${RED}Docker build failed!${NC}"
  exit 1
fi

# Step 2: Start Docker container in background
echo -e "${YELLOW}Step 2: Starting Docker container...${NC}"
docker-compose up -d

if [ $? -ne 0 ]; then
  echo -e "${RED}Failed to start Docker container!${NC}"
  exit 1
fi

# Step 3: Wait for container to be ready
echo -e "${YELLOW}Step 3: Waiting for container to be ready...${NC}"
sleep 10

# Step 4: Run Puppeteer tests
echo -e "${YELLOW}Step 4: Running Puppeteer tests...${NC}"
node ./tests/docker-build-test.js

TEST_RESULT=$?

# Step 5: Stop Docker container
echo -e "${YELLOW}Step 5: Stopping Docker container...${NC}"
docker-compose down

# Step 6: Trigger Netlify build if tests pass
if [ $TEST_RESULT -eq 0 ]; then
  echo -e "${GREEN}Tests passed! Triggering Netlify build...${NC}"
  curl -X POST -d {} https://api.netlify.com/build_hooks/6815aa2896ae6ddba51a8a30
  echo -e "${GREEN}Netlify build triggered successfully.${NC}"
  exit 0
else
  echo -e "${RED}Tests failed! Not triggering Netlify build.${NC}"
  exit 1
fi
